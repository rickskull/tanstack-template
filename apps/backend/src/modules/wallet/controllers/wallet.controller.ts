import { Router } from 'express';

import { requireAuth } from '../../../middleware/auth';
import { walletService } from '../services/wallet.service';

export const walletRouter = Router();

walletRouter.post('/topup', requireAuth(), async (req, res) => {
  const { amount } = req.body;
  const result = await walletService.createTopup(req.user!.id, Number(amount));
  res.status(201).json(result);
});

walletRouter.post('/confirm-topup', async (req, res) => {
  await walletService.creditFromWebhook(req.body);
  res.json({ ok: true });
});

walletRouter.get('/balance', requireAuth(), async (req, res) => {
  const wallet = await walletService.getBalance(req.user!.id);
  res.json(wallet);
});
