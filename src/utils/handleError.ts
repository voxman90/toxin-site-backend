import { Response } from 'express';
import { ZodError } from 'zod';

export const handleControllerError = (error: unknown, res: Response): void => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Bad request',
      status: 'fail',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.').replace(/^(body|query|params)\./, ''),
        message: issue.message,
      })),
    });

    return;
  }

  res.status(500).json({
    message: 'Server error',
  });
};
