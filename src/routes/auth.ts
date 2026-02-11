import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { authenticate, generateToken } from '../middleware/auth';
import { AuthRequest, User } from '../types';
import { AppError } from '../middleware/errorHandler';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// POST /register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim();
    const pwd = password || '';

    if (!trimmedName || !trimmedEmail || !pwd) {
      throw new AppError(400, 'MISSING_FIELDS', 'Name, email, and password are required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      throw new AppError(400, 'INVALID_EMAIL', 'Invalid email format');
    }

    if (pwd.length < 6) {
      throw new AppError(400, 'WEAK_PASSWORD', 'Password must be at least 6 characters');
    }

    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (existing.length > 0) {
      throw new AppError(400, 'EMAIL_EXISTS', 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(pwd, 10);

    const [result] = await pool.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [trimmedName, trimmedEmail, passwordHash]
    );

    const userId = result.insertId;
    const token = generateToken(userId);

    res.status(201).json({
      token,
      user: {
        id: userId,
        name: trimmedName,
        email: trimmedEmail,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    const trimmedEmail = (email || '').trim();
    const pwd = password || '';

    if (!trimmedEmail || !pwd) {
      throw new AppError(400, 'MISSING_FIELDS', 'Email and password are required');
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      [trimmedEmail]
    );

    const user = rows[0] as User | undefined;

    if (!user || !(await bcrypt.compare(pwd, user.password_hash))) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /me
router.get('/me', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    const user = rows[0];

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    user.id = Number(user.id);

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

export default router;
