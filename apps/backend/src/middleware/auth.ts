import createHttpError from 'http-errors';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env';
import { prisma } from '../config/prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export function requireAuth(roles: string[] = []) {
  return async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw createHttpError(401, 'Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string; role: string };

      const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user) {
        throw createHttpError(401, 'Invalid token');
      }

      req.user = { id: user.id, role: user.role };

      if (roles.length && !roles.includes(user.role)) {
        throw createHttpError(403, 'Forbidden');
      }

      next();
    } catch (error) {
      throw createHttpError(401, 'Invalid token', { expose: env.NODE_ENV !== 'production' });
    }
  };
}
