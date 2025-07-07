import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateRequest = (schema: {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }
      
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }
      
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }
      
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }));
        
        res.status(400).json({
          message: "Validation failed",
          errors: validationErrors
        });
        return;
      }
      
      next(error);
    }
  };
};

export const validateBody = (schema: ZodSchema) => {
  return validateRequest({ body: schema });
};

export const validateParams = (schema: ZodSchema) => {
  return validateRequest({ params: schema });
};

export const validateQuery = (schema: ZodSchema) => {
  return validateRequest({ query: schema });
}; 