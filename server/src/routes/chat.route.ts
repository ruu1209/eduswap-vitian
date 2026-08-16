import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { authenticate, requireVerified } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { startChatSchema, sendMessageSchema, messagesQuerySchema } from '../validators/chat.validator';

const router = Router();

router.use(authenticate, requireVerified);

router.get('/', chatController.list);
router.post('/', validate({ body: startChatSchema }), chatController.start);
router.get('/:id/messages', validate({ query: messagesQuerySchema }), chatController.messages);
router.post('/:id/messages', validate({ body: sendMessageSchema }), chatController.send);
router.post('/:id/read', chatController.markRead);

export default router;
