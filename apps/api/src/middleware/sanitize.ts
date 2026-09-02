import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

/**
 * Recursively sanitizes an object to remove Mongo query injection operators ($ and .)
 */
export function sanitizeObject(obj: any): any {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Strip leading dollar signs or dots from keys to prevent NoSQL operator injection
    const cleanKey = key.replace(/^(\$|\.)+/, '').trim();
    if (!cleanKey) continue;

    if (typeof value === 'string') {
      // Basic sanitization of null bytes and dangerous script injections
      clean[cleanKey] = value.replace(/\0/g, '').trim();
    } else if (typeof value === 'object' && value !== null) {
      clean[cleanKey] = sanitizeObject(value);
    } else {
      clean[cleanKey] = value;
    }
  }

  return clean;
}

/**
 * Middleware to sanitize request body, query, and params against NoSQL Injection and XSS
 */
export function mongoSanitize(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  next();
}

/**
 * Validates whether a given string is a valid 24-character hexadecimal MongoDB ObjectId
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Middleware to validate :id parameter as a valid MongoDB ObjectId
 */
export function validateIdParam(req: Request, res: Response, next: NextFunction) {
  const id = req.params.id;
  if (id && !isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid resource ID format. Must be a valid 24-character hexadecimal ID.',
    });
  }
  next();
}
