import { Request, Response, NextFunction, RequestHandler } from 'express';

// ─── Custom Error Class ───────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Async Handler Wrapper ────────────────────────────────────────────────────
// Eliminates try/catch boilerplate in every controller

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;

export const catchAsync = (fn: AsyncHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ─── API Response Helpers ─────────────────────────────────────────────────────

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  message?: string
): Response => {
  return res.status(statusCode).json({
    success: true,
    ...(message && { message }),
    ...(data !== null && data !== undefined && { data }),
  });
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500
): Response => {
  return res.status(statusCode).json({ success: false, message });
};
