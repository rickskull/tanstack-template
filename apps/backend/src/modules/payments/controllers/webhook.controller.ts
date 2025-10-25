import { Request, Response } from 'express';

import { walletService } from '../../wallet/services/wallet.service';

export async function mercadoPagoWebhook(req: Request, res: Response) {
  await walletService.creditFromWebhook(req.body.data ?? req.body);
  res.status(200).json({ received: true });
}
