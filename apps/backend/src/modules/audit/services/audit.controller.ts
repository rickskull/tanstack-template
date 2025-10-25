import { Router } from 'express';

import { requireAuth } from '../../../middleware/auth';
import { ROLES } from '../../../types/roles';
import { auditService } from './audit.service';

export const auditRouter = Router();

auditRouter.get('/', requireAuth([ROLES.ADMIN, ROLES.ADMIN_PRINCIPAL]), async (req, res) => {
  const logs = await auditService.list({ actorId: req.query.actorId as string | undefined });
  res.json(logs);
});
