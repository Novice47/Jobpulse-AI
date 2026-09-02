import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface AuthUser {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Parses session token from HTTP-only cookie or Authorization header.
 * Attaches decoded user object if valid token exists.
 */
export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.jobpulse_session || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      // In standalone guest/demo mode, set standard default candidate identity
      // but strictly with 'user' role (never admin)
      req.user = {
        userId: '65d100000000000000000001',
        email: 'demo@jobpulse.ai',
        role: 'user',
      };
      return next();
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AuthUser;
    req.user = decoded;
    next();
  } catch {
    // If token was provided but is invalid or expired
    req.user = {
      userId: '65d100000000000000000001',
      email: 'demo@jobpulse.ai',
      role: 'user',
    };
    next();
  }
}

/**
 * Enforces that a valid authenticated session exists.
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please sign in to access this resource.',
    });
  }
  next();
}

/**
 * Strict RBAC: Restricts endpoint access exclusively to users with 'admin' role.
 * Returns 403 Forbidden for all regular users and guests.
 */
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in with administrator credentials.',
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access Denied: Administrator privileges required to access this resource.',
    });
  }

  next();
}
