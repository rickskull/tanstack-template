import { Router } from 'express';

import { requireAuth } from '../../../middleware/auth';
import { ticketService } from '../services/ticket.service';
import { ROLES } from '../../../types/roles';

export const ticketRouter = Router();

ticketRouter.post('/ticket', requireAuth(), async (req, res) => {
  const ticket = await ticketService.create(req.user!.id, req.body);
  res.status(201).json(ticket);
});

ticketRouter.get('/tickets', requireAuth(), async (req, res) => {
  const tickets = await ticketService.list(req.user!.id, req.user!.role);
  res.json(tickets);
});

ticketRouter.post('/tickets/:id/respond', requireAuth(), async (req, res) => {
  await ticketService.respond(req.params.id, req.user!.id, req.body.message);
  res.status(204).send();
});

ticketRouter.post('/tickets/:id/assign', requireAuth([ROLES.ADMIN, ROLES.ADMIN_PRINCIPAL]), async (req, res) => {
  await ticketService.assign(req.params.id, req.body.assigneeId, req.user!.id);
  res.status(204).send();
});
