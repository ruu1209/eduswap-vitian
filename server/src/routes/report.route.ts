import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate, authorize, requireVerified } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createReportSchema, listReportQuerySchema, updateReportSchema } from '../validators/report.validator';

const router = Router();

router.use(authenticate);

// Any verified student can file a report.
router.post('/', requireVerified, validate({ body: createReportSchema }), reportController.create);

// Only admins review and resolve them.
router.get('/', authorize('admin'), validate({ query: listReportQuerySchema }), reportController.list);
router.patch('/:id', authorize('admin'), validate({ body: updateReportSchema }), reportController.updateStatus);

export default router;
