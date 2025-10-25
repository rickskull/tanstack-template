import { Router } from 'express';

import { requireAuth } from '../../../middleware/auth';
import { ROLES } from '../../../types/roles';
import { announcementService } from '../services/announcement.service';

export const announcementRouter = Router();

announcementRouter.get('/', async (req, res) => {
  const announcements = await announcementService.list({
    platform: req.query.platform as string | undefined,
    tags: req.query.tags ? String(req.query.tags).split(',') : undefined
  });
  res.json(announcements);
});

announcementRouter.post('/', requireAuth([ROLES.SELLER, ROLES.ADMIN, ROLES.ADMIN_PRINCIPAL]), async (req, res) => {
  const announcement = await announcementService.create(req.user!.id, req.body);
  res.status(201).json(announcement);
});

announcementRouter.put('/:id', requireAuth([ROLES.SELLER, ROLES.ADMIN, ROLES.ADMIN_PRINCIPAL]), async (req, res) => {
  const announcement = await announcementService.update(req.user!.id, req.params.id, req.body);
  res.json(announcement);
});

announcementRouter.delete('/:id', requireAuth([ROLES.SELLER, ROLES.ADMIN, ROLES.ADMIN_PRINCIPAL]), async (req, res) => {
  await announcementService.remove(req.user!.id, req.params.id);
  res.status(204).send();
});
