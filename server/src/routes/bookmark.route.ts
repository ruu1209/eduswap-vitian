import { Router } from 'express';
import { bookmarkController } from '../controllers/bookmark.controller';
import { authenticate, requireVerified } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { toggleBookmarkSchema, checkBookmarkSchema, listBookmarkSchema } from '../validators/bookmark.validator';

const router = Router();

router.use(authenticate, requireVerified);

router.get('/', validate({ query: listBookmarkSchema }), bookmarkController.list);
router.get('/check', validate({ query: checkBookmarkSchema }), bookmarkController.check);
router.post('/toggle', validate({ body: toggleBookmarkSchema }), bookmarkController.toggle);

export default router;
