import crypto from 'node:crypto';
import { Router } from 'express';

import { requireAuth } from '../../../middleware/auth';
import { orderService } from '../services/order.service';
import { ROLES } from '../../../types/roles';

export const orderRouter = Router();

orderRouter.post('/', requireAuth(), async (req, res) => {
  const { announcementId } = req.body;
  const idempotencyKey = (req.headers['x-idempotency-key'] as string) || crypto.randomUUID();
  const order = await orderService.createOrder(req.user!.id, announcementId, idempotencyKey);
  res.status(201).json(order);
});

orderRouter.post('/:id/complete', requireAuth([ROLES.ADMIN, ROLES.ADMIN_PRINCIPAL]), async (req, res) => {
  const result = await orderService.completeOrder(req.params.id, req.user!.id);
  res.json(result);
});
