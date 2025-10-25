import { Router } from 'express';

import { requireAuth } from '../../../middleware/auth';
import { chatService } from '../services/chat.service';

export const chatRouter = Router();

chatRouter.post('/', requireAuth(), async (req, res) => {
  const { sellerId } = req.body;
  const chat = await chatService.startChat(req.user!.id, sellerId);
  res.status(201).json(chat);
});

chatRouter.get('/', requireAuth(), async (req, res) => {
  const chats = await chatService.listChats(req.user!.id);
  res.json(chats);
});

chatRouter.post('/:id/message', requireAuth(), async (req, res) => {
  const message = await chatService.sendMessage(req.params.id, req.user!.id, req.body.body);
  res.status(201).json(message);
});

chatRouter.delete('/messages/:id', requireAuth(), async (req, res) => {
  const message = await chatService.softDeleteMessage(req.params.id, req.user!.id);
  res.json(message);
});
