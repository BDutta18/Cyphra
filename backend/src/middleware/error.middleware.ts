import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { logger } from '../utils/logger.js';
import { AppError } from '../types/index.js';

// ---------------------------------------------------------------------------
// Centralized Error Handler
// ---------------------------------------------------------------------------

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = (req.headers['x-request-id'] as string) ?? 'unknown';

  // Zod validation errors → 400
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      meta: { timestamp: Date.now(), requestId },
    });
    return;
  }

  // Application-level errors (thrown with explicit status codes)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code ?? 'APP_ERROR',
      meta: { timestamp: Date.now(), requestId },
    });
    return;
  }

  // Log unexpected errors
  logger.error('Unhandled error on request', {
    method: req.method,
    path: req.path,
    requestId,
    error: err instanceof Error ? { message: err.message, stack: err.stack } : err,
  });

  const message =
    err instanceof Error ? err.message : 'An unexpected error occurred';

  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : message,
    code: 'INTERNAL_ERROR',
    meta: { timestamp: Date.now(), requestId },
  });
}

// ---------------------------------------------------------------------------
// Not Found Handler — for unmatched routes
// ---------------------------------------------------------------------------

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.path}`,
    code: 'NOT_FOUND',
    meta: { timestamp: Date.now() },
  });
}

// ---------------------------------------------------------------------------
// Request ID Injector — stamps every request with a trace ID
// ---------------------------------------------------------------------------

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existing = req.headers['x-request-id'] as string | undefined;
  const id = existing ?? `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  req.headers['x-request-id'] = id;
  res.setHeader('x-request-id', id);
  next();
}

// ---------------------------------------------------------------------------
// Request Logger — structured access log
// ---------------------------------------------------------------------------

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] ?? '—';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.path} → ${res.statusCode} (${duration}ms)`, {
      requestId,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });

  next();
}
