import type { FilterQuery } from 'mongoose';
import { resourceRepository, type ResourceListOptions } from '../repositories/resource.repository';
import { userRepository } from '../repositories/user.repository';
import { storageService, type StoredFile } from './storage.service';
import type { IResource, ResourceDocument } from '../models/resource.model';
import { AppError } from '../utils/AppError';
import { buildSearchRegex } from '../utils/regex';
import type { UserRole } from '../utils/constants';

interface UploadedFiles {
  file?: Express.Multer.File[];
  images?: Express.Multer.File[];
}
interface CreateResourceInput {
  title: string;
  description: string;
  subject: string;
  department: IResource['department'];
  semester: IResource['semester'];
  type: IResource['type'];
  courseCode?: string;
  tags?: string[];
  isFree: boolean;
  price: number;
}
export interface ListResourcesInput extends ResourceListOptions {
  q?: string;
  department?: IResource['department'];
  semester?: number;
  type?: IResource['type'];
  isFree?: boolean;
  uploader?: string;
}

export const resourceService = {
  async create(uploaderId: string, input: CreateResourceInput, files: UploadedFiles): Promise<ResourceDocument> {
    const doc = files.file?.[0];
    const images = files.images ?? [];
    if (!doc && images.length === 0) {
      throw AppError.badRequest('Upload a PDF file or at least one image');
    }

    const uploader = await userRepository.findById(uploaderId);
    if (!uploader) throw AppError.notFound('Uploader not found');

    // Upload the document and images in parallel.
    const [file, uploadedImages] = await Promise.all([
      doc ? storageService.uploadDocument(doc.buffer) : Promise.resolve<StoredFile | undefined>(undefined),
      Promise.all(images.map((img) => storageService.uploadImage(img.buffer))),
    ]);

    return resourceRepository.create({
      ...input,
      file,
      images: uploadedImages,
      uploader: uploader._id,
      college: uploader.college ?? '',
    });
  },

  async getById(id: string): Promise<ResourceDocument> {
    const resource = await resourceRepository.findById(id);
    if (!resource || !resource.isActive) throw AppError.notFound('Resource not found');
    await resourceRepository.incrementViews(id);
    return resource;
  },

  async list(input: ListResourcesInput) {
    const filter: FilterQuery<IResource> = { isActive: true };
    if (input.department) filter.department = input.department;
    if (input.semester) filter.semester = input.semester;
    if (input.type) filter.type = input.type;
    if (typeof input.isFree === 'boolean') filter.isFree = input.isFree;
    if (input.uploader) filter.uploader = input.uploader;

    if (input.q && input.q.trim()) {
      const regex = buildSearchRegex(input.q);
      const uploaderIds = await userRepository.findIdsMatchingName(input.q);
      filter.$or = [
        { title: regex },
        { description: regex },
        { subject: regex },
        { courseCode: regex },
        { tags: regex },
        ...(uploaderIds.length ? [{ uploader: { $in: uploaderIds } }] : []),
      ];
    }

    const { items, total } = await resourceRepository.list(filter, {
      page: input.page,
      limit: input.limit,
      sort: input.sort,
    });

    return {
      items,
      meta: { total, page: input.page, limit: input.limit, pages: Math.ceil(total / input.limit) },
    };
  },

  listByUploader(uploaderId: string) {
    return resourceRepository.findByUploader(uploaderId);
  },

  async download(id: string): Promise<{ url: string }> {
    const resource = await resourceRepository.findById(id);
    if (!resource || !resource.isActive) throw AppError.notFound('Resource not found');
    if (!resource.file) throw AppError.badRequest('This resource has no downloadable file');
    await resourceRepository.incrementDownloads(id);
    return { url: resource.file.url };
  },

  async remove(id: string, requester: { id: string; role: UserRole }): Promise<void> {
    const resource = await resourceRepository.findById(id);
    if (!resource) throw AppError.notFound('Resource not found');

    const isOwner = resource.uploader._id.toString() === requester.id;
    if (!isOwner && requester.role !== 'admin') throw AppError.forbidden('You cannot delete this resource');

    // Best-effort cleanup of Cloudinary assets.
    const removals: Promise<void>[] = [];
    if (resource.file) removals.push(storageService.remove(resource.file.publicId, 'auto'));
    resource.images.forEach((img) => removals.push(storageService.remove(img.publicId, 'image')));
    await Promise.allSettled(removals);

    await resourceRepository.deleteById(id);
  },
};
