import { Request, Response, NextFunction } from 'express';
import { HttpError } from './HttpError.js';

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  const message = err instanceof Error ? err.message : 'Unexpected error';
  const status = message === 'Invalid email or password' || message.includes('already registered') || message.includes('já cadastrado') ? 400 : 500;
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json({ error: message });
}
