import { Router } from 'express';

import { authRouter } from './modules/auth/controllers/auth.controller';
import { announcementRouter } from './modules/announcements/controllers/announcement.controller';
import { walletRouter } from './modules/wallet/controllers/wallet.controller';
import { paymentRouter } from './modules/payments/controllers/payment.controller';
import { mercadoPagoWebhook } from './modules/payments/controllers/webhook.controller';
import { orderRouter } from './modules/orders/controllers/order.controller';
import { chatRouter } from './modules/chat/controllers/chat.controller';
import { ticketRouter } from './modules/tickets/controllers/ticket.controller';
import { adminRouter } from './modules/admin/controllers/admin.controller';
import { subscriptionRouter } from './modules/subscriptions/controllers/subscription.controller';
import { auditRouter } from './modules/audit/services/audit.controller';

export const routes = Router();

routes.use('/auth', authRouter);
routes.use('/announcements', announcementRouter);
routes.use('/wallet', walletRouter);
routes.use('/payments', paymentRouter);
routes.post('/webhooks/mp', mercadoPagoWebhook);
routes.use('/orders', orderRouter);
routes.use('/chats', chatRouter);
routes.use('/support', ticketRouter);
routes.use('/admin', adminRouter);
routes.use('/subscriptions', subscriptionRouter);
routes.use('/audit', auditRouter);

export default routes;
