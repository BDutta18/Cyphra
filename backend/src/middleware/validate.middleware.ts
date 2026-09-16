import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

/**
 * Request body validation middleware using Zod schemas.
 * Parses and replaces req.body with the validated + typed output.
 * Throws a ZodError on failure, which is caught by the errorHandler.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body);
    next();
  };
}

/**
 * Query parameter validation middleware using Zod schemas.
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.query = schema.parse(req.query) as typeof req.query;
    next();
  };
}
