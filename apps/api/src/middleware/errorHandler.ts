import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const errorId = `err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  console.error(`[API Error ${errorId}]`, err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Input validation failed. Please review the submitted data.',
      details: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
      errorId,
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      error: `File upload error: ${err.message}`,
      errorId,
    });
  }

  const rawMessage = err instanceof Error ? err.message : 'An unexpected server error occurred';

  if (
    rawMessage.includes('Invalid file format') ||
    rawMessage.includes('Invalid file MIME type') ||
    rawMessage.includes('CORS Error')
  ) {
    return res.status(400).json({
      success: false,
      error: rawMessage,
      errorId,
    });
  }

  // Prevent leaking internal system strings, credentials, or file paths
  const safeMessage =
    rawMessage.includes('ECONNREFUSED') || rawMessage.includes('mongodb') || rawMessage.includes('redis')
      ? 'Database service connection issue. Please retry shortly.'
      : rawMessage;

  return res.status(500).json({
    success: false,
    error: safeMessage,
    errorId,
  });
}
