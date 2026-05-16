import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

/**
 * Validates req.body against a Zod schema.
 * Throws a ZodError on failure — picked up by the global error handler.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    req.body = schema.parse(req.body); // strips unknown keys by default
    next();
  };
}
