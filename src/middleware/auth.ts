import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../types';
import { AppError } from './errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'mentalsystem_default_secret_change_in_production';

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization || '';

  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    next(new AppError(401, 'AUTH_REQUIRED', 'Authorization token required'));
    return;
  }

  const token = match[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as unknown as { sub: number };
    if (!payload.sub) {
      next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
      return;
    }
    req.userId = payload.sub;
    next();
  } catch {
    next(new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token'));
  }
}

export function generateToken(userId: number): string {
  return jwt.sign(
    { sub: userId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}
