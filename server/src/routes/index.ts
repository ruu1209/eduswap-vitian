import { Router } from 'express';
import healthRoutes from './health.route';
import authRoutes from './auth.route';
import resourceRoutes from './resource.route';
import bookRoutes from './book.route';
import bookmarkRoutes from './bookmark.route';
import chatRoutes from './chat.route';
import reportRoutes from './report.route';
import adminRoutes from './admin.route';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/resources', resourceRoutes);
router.use('/books', bookRoutes);
router.use('/bookmarks', bookmarkRoutes);
router.use('/chats', chatRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);


export default router;
