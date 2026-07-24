import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'womb_jwt_secret_key_2026';

export type AuthenticatedRequest = Request & {
  user?: {
    id: number | string;
    email: string;
    role: string;
  };
};

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Vendor login is required.' });
  }

  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET) as AuthenticatedRequest['user'];
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

export function requireVendor(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const allowedRoles = new Set(['vendor', 'professional', 'admin']);
  if (!req.user || !allowedRoles.has(req.user.role)) {
    return res.status(403).json({ error: 'A vendor account is required for this action.' });
  }

  return next();
}
