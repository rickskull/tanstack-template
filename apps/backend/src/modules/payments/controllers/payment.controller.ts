import { Router } from 'express';

import { requireAuth } from '../../../middleware/auth';
import { walletService } from '../../wallet/services/wallet.service';

export const paymentRouter = Router();

paymentRouter.post('/create-preference', requireAuth(), async (req, res) => {
  const { amount, description } = req.body;
  const result = await walletService.createTopup(req.user!.id, amount);
  res.status(201).json({ ...result, description });
});

paymentRouter.post('/confirm', async (req, res) => {
  await walletService.creditFromWebhook(req.body);
  res.json({ ok: true });
});

paymentRouter.post('/mp/refund', async (req, res) => {
  res.status(202).json({ status: 'scheduled' });
});
