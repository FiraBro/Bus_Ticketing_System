import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { ZodError } from 'zod';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      status: 'error',
      message: 'Validation Error',
      errors: err.issues,
    });
    return;
  }

  console.error('Unhandled environment error:', err);

  res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
};
