import { Router } from 'express';
import { resourceController } from '../controllers/resource.controller';
import { authenticate, requireVerified } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { resourceUpload } from '../middlewares/upload.middleware';
import { createResourceSchema, listResourceQuerySchema } from '../validators/resource.validator';

const router = Router();

// Every marketplace route requires a verified college account.
router.use(authenticate, requireVerified);

router.get('/', validate({ query: listResourceQuerySchema }), resourceController.list);
router.get('/mine', resourceController.mine);
router.get('/:id', resourceController.getById);
router.get('/:id/download', resourceController.download);
router.post('/', resourceUpload, validate({ body: createResourceSchema }), resourceController.create);
router.delete('/:id', resourceController.remove);

export default router;
