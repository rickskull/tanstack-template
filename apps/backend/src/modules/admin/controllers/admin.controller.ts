import { Router } from 'express';

import { requireAuth } from '../../../middleware/auth';
import { ROLES } from '../../../types/roles';
import { adminService } from '../services/admin.service';

export const adminRouter = Router();

const adminRoles = [ROLES.ADMIN, ROLES.ADMIN_PRINCIPAL];

adminRouter.post('/users/:id/ban', requireAuth(adminRoles), async (req, res) => {
  const { reason } = req.body;
  await adminService.banUser(req.params.id, reason, req.user!.id);
  res.status(204).send();
});

adminRouter.post('/ip/ban', requireAuth(adminRoles), async (req, res) => {
  const { value, reason } = req.body;
  await adminService.banValue('ip', value, req.user!.id, reason);
  res.status(201).json({ value });
});

adminRouter.post('/ua/ban', requireAuth(adminRoles), async (req, res) => {
  const { value, reason } = req.body;
  await adminService.banValue('ua', value, req.user!.id, reason);
  res.status(201).json({ value });
});

adminRouter.post('/users/create-seller', requireAuth(adminRoles), async (req, res) => {
  const { userId } = req.body;
  await adminService.createSeller(userId, req.user!.id);
  res.status(201).json({ userId });
});

adminRouter.post('/announcements/batch-delete', requireAuth(adminRoles), async (req, res) => {
  const { ids } = req.body as { ids: string[] };
  await adminService.batchDeleteAnnouncements(ids, req.user!.id);
  res.status(202).json({ ids });
});

adminRouter.post('/transactions/:id/rollback', requireAuth(adminRoles), async (req, res) => {
  await adminService.rollbackTransaction(req.params.id, req.user!.id);
  res.status(202).json({ id: req.params.id });
});

adminRouter.get('/withdrawals', requireAuth(adminRoles), async (_req, res) => {
  const payouts = await adminService.listWithdrawals();
  res.json(payouts);
});

adminRouter.post('/withdrawals/:id/approve', requireAuth(adminRoles), async (req, res) => {
  const payout = await adminService.approveWithdrawal(req.params.id, req.user!.id);
  res.json(payout);
});

export default adminRouter;
