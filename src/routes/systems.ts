import { Router, Response, NextFunction } from 'express';
import pool from '../config/database';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET / - Get system by objective_id query param
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const objectiveId = Number(req.query.objective_id || 0);

    if (!objectiveId || objectiveId <= 0) {
      throw new AppError(400, 'MISSING_OBJECTIVE_ID', 'objective_id is required');
    }

    // Verify ownership via objective
    const [objRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, user_id FROM objectives WHERE id = ?',
      [objectiveId]
    );

    const objective = objRows[0];

    if (!objective) {
      throw new AppError(404, 'NOT_FOUND', 'Objective not found');
    }

    if (Number(objective.user_id) !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not own this objective');
    }

    // Fetch system
    const [sysRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, purpose, created_at FROM systems WHERE objective_id = ?',
      [objectiveId]
    );

    const system = sysRows[0];

    if (!system) {
      throw new AppError(404, 'SYSTEM_NOT_FOUND', 'System not found for this objective');
    }

    system.id = Number(system.id);
    const systemId = system.id;

    // Fetch elements
    const [elRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, description FROM system_elements WHERE system_id = ?',
      [systemId]
    );
    for (const el of elRows) {
      el.id = Number(el.id);
    }
    system.elements = elRows;

    // Fetch interactions
    const [interRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, element_from_id, element_to_id, description FROM system_interactions WHERE system_id = ?',
      [systemId]
    );
    for (const inter of interRows) {
      inter.id = Number(inter.id);
      inter.element_from_id = Number(inter.element_from_id);
      inter.element_to_id = Number(inter.element_to_id);
    }
    system.interactions = interRows;

    res.json({ system });
  } catch (err) {
    next(err);
  }
});

// PUT / - Update system (delete old elements/interactions, recreate)
router.put('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  let connection: Awaited<ReturnType<typeof pool.getConnection>> | null = null;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();
    const userId = req.userId!;
    const { objective_id, purpose, elements: inputElements, interactions: inputInteractions } = req.body;

    const objectiveId = Number(objective_id || 0);
    const trimmedPurpose = (purpose || '').trim();

    if (!objectiveId || objectiveId <= 0) {
      throw new AppError(400, 'MISSING_OBJECTIVE_ID', 'objective_id is required');
    }

    if (!trimmedPurpose) {
      throw new AppError(400, 'MISSING_PURPOSE', 'purpose is required');
    }

    // Verify ownership via objective
    const [objRows] = await connection.execute<RowDataPacket[]>(
      'SELECT id, user_id FROM objectives WHERE id = ?',
      [objectiveId]
    );

    const objective = objRows[0];

    if (!objective) {
      throw new AppError(404, 'NOT_FOUND', 'Objective not found');
    }

    if (Number(objective.user_id) !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not own this objective');
    }

    // Find existing system
    const [existingSysRows] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM systems WHERE objective_id = ?',
      [objectiveId]
    );
    const existingSystem = existingSysRows[0];

    await connection.beginTransaction();
    transactionStarted = true;

    let systemId: number;

    if (existingSystem) {
      systemId = Number(existingSystem.id);

      // Delete old interactions and elements (interactions first due to FK)
      await connection.execute('DELETE FROM system_interactions WHERE system_id = ?', [systemId]);
      await connection.execute('DELETE FROM system_elements WHERE system_id = ?', [systemId]);

      // Update purpose
      await connection.execute('UPDATE systems SET purpose = ? WHERE id = ?', [trimmedPurpose, systemId]);
    } else {
      // Create new system
      const [sysResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO systems (objective_id, purpose) VALUES (?, ?)',
        [objectiveId, trimmedPurpose]
      );
      systemId = sysResult.insertId;
    }

    // Recreate elements
    const elements = inputElements || [];
    const elementIds: number[] = [];

    for (const element of elements) {
      const [elResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO system_elements (system_id, name, description) VALUES (?, ?, ?)',
        [systemId, element.name || '', element.description ?? null]
      );
      elementIds.push(elResult.insertId);
    }

    // Recreate interactions
    const interactions = inputInteractions || [];
    for (const interaction of interactions) {
      const fromIndex = Number(interaction.element_from_index ?? -1);
      const toIndex = Number(interaction.element_to_index ?? -1);

      if (elementIds[fromIndex] === undefined || elementIds[toIndex] === undefined) {
        throw new AppError(400, 'INVALID_ELEMENT_INDEX', 'Invalid element index in interactions');
      }

      await connection.execute(
        'INSERT INTO system_interactions (system_id, element_from_id, element_to_id, description) VALUES (?, ?, ?, ?)',
        [systemId, elementIds[fromIndex], elementIds[toIndex], interaction.description || '']
      );
    }

    await connection.commit();

    // Return updated system
    const [resultRows] = await connection.execute<RowDataPacket[]>(
      'SELECT id, purpose, created_at FROM systems WHERE id = ?',
      [systemId]
    );
    const result = resultRows[0];
    result.id = Number(result.id);

    // Fetch new elements
    const [resultElRows] = await connection.execute<RowDataPacket[]>(
      'SELECT id, name, description FROM system_elements WHERE system_id = ?',
      [systemId]
    );
    for (const el of resultElRows) {
      el.id = Number(el.id);
    }
    result.elements = resultElRows;

    // Fetch new interactions
    const [resultInterRows] = await connection.execute<RowDataPacket[]>(
      'SELECT id, element_from_id, element_to_id, description FROM system_interactions WHERE system_id = ?',
      [systemId]
    );
    for (const inter of resultInterRows) {
      inter.id = Number(inter.id);
      inter.element_from_id = Number(inter.element_from_id);
      inter.element_to_id = Number(inter.element_to_id);
    }
    result.interactions = resultInterRows;

    res.json({ system: result });
  } catch (err) {
    if (connection && transactionStarted) {
      try {
        await connection.rollback();
      } catch {
        // Ignore rollback errors to preserve original error
      }
    }
    next(err);
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;
