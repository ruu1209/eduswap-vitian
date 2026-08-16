import { Router } from 'express';
import { bookController } from '../controllers/book.controller';
import { authenticate, requireVerified } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { bookUpload } from '../middlewares/upload.middleware';
import { createBookSchema, listBookQuerySchema } from '../validators/book.validator';

const router = Router();

router.use(authenticate, requireVerified);

router.get('/', validate({ query: listBookQuerySchema }), bookController.list);
router.get('/mine', bookController.mine);
router.get('/:id', bookController.getById);
router.post('/', bookUpload, validate({ body: createBookSchema }), bookController.create);
router.post('/:id/reserve', bookController.reserve);
router.post('/:id/cancel-reservation', bookController.cancelReservation);
router.post('/:id/mark-sold', bookController.markSold);
router.delete('/:id', bookController.remove);

export default router;
