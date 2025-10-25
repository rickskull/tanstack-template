import jwt from 'jsonwebtoken';

import { env } from '../config/env';

export const signAccessToken = (payload: Record<string, unknown>) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

export const signRefreshToken = (payload: Record<string, unknown>) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string; role: string };
