import { Router, Response, NextFunction } from 'express';
import pool from '../config/database';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// All routes require authentication
router.use(authenticate);

// GET / - List all objectives for the authenticated user
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const [objectives] = await pool.execute<RowDataPacket[]>(
      'SELECT id, title, description, status, created_at FROM objectives WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    for (const obj of objectives) {
      obj.id = Number(obj.id);
    }

    res.json({ objectives });
  } catch (err) {
    next(err);
  }
});

// POST / - Create a new objective with reflection, system, elements, interactions
router.post('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  let connection: Awaited<ReturnType<typeof pool.getConnection>> | null = null;
  let transactionStarted = false;

  try {
    connection = await pool.getConnection();
    const userId = req.userId!;
    const { title, description, reflection, system } = req.body;

    const trimmedTitle = (title || '').trim();
    const trimmedDescription = (description || '').trim();

    if (!trimmedTitle) {
      throw new AppError(400, 'MISSING_TITLE', 'Title is required');
    }

    await connection.beginTransaction();
    transactionStarted = true;

    // 1. Create objective
    const [objResult] = await connection.execute<ResultSetHeader>(
      'INSERT INTO objectives (user_id, title, description) VALUES (?, ?, ?)',
      [userId, trimmedTitle, trimmedDescription]
    );
    const objectiveId = objResult.insertId;

    // 2. Create reflection (if provided)
    if (reflection) {
      await connection.execute(
        'INSERT INTO reflections (objective_id, question_1, question_2, question_3) VALUES (?, ?, ?, ?)',
        [
          objectiveId,
          reflection.question_1 ?? null,
          reflection.question_2 ?? null,
          reflection.question_3 ?? null,
        ]
      );
    }

    // 3. Create system with elements and interactions (if provided)
    if (system && system.purpose) {
      const [sysResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO systems (objective_id, purpose) VALUES (?, ?)',
        [objectiveId, system.purpose]
      );
      const systemId = sysResult.insertId;

      // 3a. Create elements
      const elements = system.elements || [];
      const elementIds: number[] = [];

      for (const element of elements) {
        const [elResult] = await connection.execute<ResultSetHeader>(
          'INSERT INTO system_elements (system_id, name, description) VALUES (?, ?, ?)',
          [systemId, element.name || '', element.description ?? null]
        );
        elementIds.push(elResult.insertId);
      }

      // 3b. Create interactions (resolve indices to actual element IDs)
      const interactions = system.interactions || [];
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
    }

    await connection.commit();

    res.status(201).json({
      objective: {
        id: objectiveId,
        title: trimmedTitle,
        description: trimmedDescription,
        status: 'active',
      },
    });
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

// GET /:id - Get objective with reflection, system (elements + interactions)
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const objectiveId = Number(req.params.id);

    if (!objectiveId || objectiveId <= 0) {
      throw new AppError(400, 'INVALID_ID', 'Objective id is required');
    }

    // Fetch objective and verify ownership
    const [objRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, user_id, title, description, status, created_at FROM objectives WHERE id = ?',
      [objectiveId]
    );

    const objective = objRows[0];

    if (!objective) {
      throw new AppError(404, 'NOT_FOUND', 'Objective not found');
    }

    if (Number(objective.user_id) !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not own this objective');
    }

    objective.id = Number(objective.id);
    delete objective.user_id;

    // Fetch reflection
    const [refRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, question_1, question_2, question_3, created_at FROM reflections WHERE objective_id = ?',
      [objectiveId]
    );
    const reflection = refRows[0] || null;
    if (reflection) {
      reflection.id = Number(reflection.id);
    }

    // Fetch system
    const [sysRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, purpose, created_at FROM systems WHERE objective_id = ?',
      [objectiveId]
    );
    const system = sysRows[0] || null;

    if (system) {
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
    }

    res.json({
      objective,
      reflection,
      system,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /:id - Update title/description/status
router.put('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const objectiveId = Number(req.params.id);

    if (!objectiveId || objectiveId <= 0) {
      throw new AppError(400, 'INVALID_ID', 'Objective id is required');
    }

    // Verify ownership
    const [objRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, user_id, title, description, status FROM objectives WHERE id = ?',
      [objectiveId]
    );

    const objective = objRows[0];

    if (!objective) {
      throw new AppError(404, 'NOT_FOUND', 'Objective not found');
    }

    if (Number(objective.user_id) !== userId) {
      throw new AppError(403, 'FORBIDDEN', 'You do not own this objective');
    }

    // Build dynamic update
    const fields: string[] = [];
    const params: any[] = [];

    if (req.body.title !== undefined) {
      const trimmedTitle = (req.body.title || '').trim();
      if (!trimmedTitle) {
        throw new AppError(400, 'EMPTY_TITLE', 'Title cannot be empty');
      }
      fields.push('title = ?');
      params.push(trimmedTitle);
    }

    if (req.body.description !== undefined) {
      fields.push('description = ?');
      params.push((req.body.description || '').trim());
    }

    if (req.body.status !== undefined) {
      const allowed = ['active', 'completed', 'archived'];
      if (!allowed.includes(req.body.status)) {
        throw new AppError(400, 'INVALID_STATUS', 'Status must be one of: active, completed, archived');
      }
      fields.push('status = ?');
      params.push(req.body.status);
    }

    if (fields.length === 0) {
      throw new AppError(400, 'NO_FIELDS', 'No fields to update');
    }

    params.push(objectiveId);
    const sql = `UPDATE objectives SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(sql, params);

    // Return updated objective
    const [updatedRows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, title, description, status, created_at FROM objectives WHERE id = ?',
      [objectiveId]
    );
    const updated = updatedRows[0];
    updated.id = Number(updated.id);

    res.json({ objective: updated });
  } catch (err) {
    next(err);
  }
});

// DELETE /:id - Delete objective
router.delete('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const objectiveId = Number(req.params.id);

    if (!objectiveId || objectiveId <= 0) {
      throw new AppError(400, 'INVALID_ID', 'Objective id is required');
    }

    // Verify ownership
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

    await pool.execute('DELETE FROM objectives WHERE id = ?', [objectiveId]);

    res.json({ message: 'Objective deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
