import { Router } from 'express';

import { requireAuth } from '../../../middleware/auth';
import { subscriptionService } from '../services/subscription.service';
import { ROLES } from '../../../types/roles';

export const subscriptionRouter = Router();

subscriptionRouter.get('/plans', async (_req, res) => {
  const plans = await subscriptionService.getPlans();
  res.json(plans);
});

subscriptionRouter.post('/subscribe', requireAuth([ROLES.SELLER, ROLES.ADMIN, ROLES.ADMIN_PRINCIPAL]), async (req, res) => {
  const { planId } = req.body;
  const subscription = await subscriptionService.subscribe(req.user!.id, planId);
  res.status(201).json(subscription);
});
