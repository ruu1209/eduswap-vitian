import multer from 'multer';
import { AppError } from '../utils/AppError';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOC_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15 MB

/**
 * In-memory upload for resources: one PDF under `file`, up to 5 images under
 * `images`. Buffers are streamed to Cloudinary by the storage service.
 */
export const resourceUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(_req, file, cb) {
    if (file.fieldname === 'file' && DOC_TYPES.includes(file.mimetype)) return cb(null, true);
    if (file.fieldname === 'images' && IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(AppError.badRequest(`Unsupported file type for "${file.fieldname}"`));
  },
}).fields([
  { name: 'file', maxCount: 1 },
  { name: 'images', maxCount: 5 },
]);

/** Books have images only (no document). Up to 5 images under `images`. */
export const bookUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter(_req, file, cb) {
    if (file.fieldname === 'images' && IMAGE_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(AppError.badRequest(`Unsupported file type for "${file.fieldname}"`));
  },
}).fields([{ name: 'images', maxCount: 5 }]);
