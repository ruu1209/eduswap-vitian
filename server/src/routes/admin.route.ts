import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { adminListQuerySchema } from '../validators/admin.validator';

const router = Router();

// Everything here is admin-only.
router.use(authenticate, authorize('admin'));

router.get('/stats', adminController.stats);
router.get('/users', validate({ query: adminListQuerySchema }), adminController.users);
router.delete('/users/:id', adminController.deleteUser);
router.get('/resources', validate({ query: adminListQuerySchema }), adminController.resources);
router.delete('/resources/:id', adminController.deleteResource);
router.get('/books', validate({ query: adminListQuerySchema }), adminController.books);
router.delete('/books/:id', adminController.deleteBook);

export default router;
