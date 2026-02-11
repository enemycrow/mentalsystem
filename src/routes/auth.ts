import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { authenticate, generateToken } from '../middleware/auth';
import { AuthRequest, User } from '../types';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const router = Router();

// POST /register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim();
    const pwd = password || '';

    if (!trimmedName || !trimmedEmail || !pwd) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    if (pwd.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check if email already exists
    const [existing] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?',
      [trimmedEmail]
    );

    if (existing.length > 0) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Create user
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
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const trimmedEmail = (email || '').trim();
    const pwd = password || '';

    if (!trimmedEmail || !pwd) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, password_hash FROM users WHERE email = ?',
      [trimmedEmail]
    );

    const user = rows[0] as User | undefined;

    if (!user || !(await bcrypt.compare(pwd, user.password_hash))) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
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
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT id, name, email, created_at FROM users WHERE id = ?',
      [userId]
    );

    const user = rows[0];

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    user.id = Number(user.id);

    res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
