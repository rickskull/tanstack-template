import { Router } from 'express';
import createHttpError from 'http-errors';

import { authService } from '../services/auth.service';
import { requireAuth } from '../../../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  const result = await authService.register({ email, password, name });
  res.status(201).json(result);
});

authRouter.post('/login', async (req, res) => {
  const { email, password, totpCode } = req.body;
  const result = await authService.login({ email, password, totpCode });
  res.json(result);
});

authRouter.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    throw createHttpError(400, 'Refresh token obrigatório');
  }
  const tokens = await authService.refresh(refreshToken);
  res.json(tokens);
});

authRouter.post('/totp/enable', requireAuth(), async (req, res) => {
  const result = await authService.enableTotp(req.user!.id);
  res.json(result);
});

authRouter.post('/forgot', async (_req, res) => {
  // Implementation stub to integrate with transactional email provider
  res.json({ message: 'Instruções de redefinição enviadas (mock).' });
});
