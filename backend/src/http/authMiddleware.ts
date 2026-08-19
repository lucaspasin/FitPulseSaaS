import { Request, Response, NextFunction } from 'express';
import { ITokenService } from '../security/ITokenService.js';
import { Role } from '../domain/types.js';

export interface AuthenticatedRequest extends Request {
  auth?: {
    userId: string;
    role: Role;
    gymId?: string;
  };
}

export function createRequireAuth(tokenService: ITokenService) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    try {
      req.auth = tokenService.verify(header.slice(7));
      next();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.auth || !roles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}
