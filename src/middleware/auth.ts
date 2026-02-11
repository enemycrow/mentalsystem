import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'mentalsystem_default_secret_change_in_production';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    res.status(401).json({ error: 'Authorization token required' });
    return;
  }

  const token = match[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as { sub: number };
    if (!payload.sub) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function generateToken(userId: number): string {
  return jwt.sign(
    { sub: userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
