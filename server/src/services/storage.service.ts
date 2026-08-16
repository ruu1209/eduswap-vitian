import { Readable } from 'node:stream';
import type { UploadApiOptions } from 'cloudinary';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';
import { AppError } from '../utils/AppError';

export interface StoredFile {
  url: string;
  publicId: string;
}

const ROOT = 'eduswap';

function uploadBuffer(buffer: Buffer, options: UploadApiOptions): Promise<StoredFile> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) {
        reject(error ?? new Error('Upload failed'));
        return;
      }
      resolve({ url: result.secure_url, publicId: result.public_id });
    });
    Readable.from(buffer).pipe(stream);
  });
}

/** Uploads to Cloudinary. Fails loudly if Cloudinary isn't configured. */
export const storageService = {
  async uploadImage(buffer: Buffer): Promise<StoredFile> {
    if (!isCloudinaryConfigured()) throw AppError.badRequest('File storage is not configured');
    return uploadBuffer(buffer, { folder: `${ROOT}/resources/images`, resource_type: 'image' });
  },

  async uploadDocument(buffer: Buffer): Promise<StoredFile> {
    if (!isCloudinaryConfigured()) throw AppError.badRequest('File storage is not configured');
    // resource_type 'auto' lets Cloudinary handle PDFs and generate previews.
    return uploadBuffer(buffer, { folder: `${ROOT}/resources/files`, resource_type: 'auto' });
  },

  async remove(publicId: string, resourceType: 'image' | 'raw' | 'auto' = 'image'): Promise<void> {
    if (!isCloudinaryConfigured()) return;
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  },
};
