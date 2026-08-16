import { Resource, type IResource } from '../models/resource.model';
import type { FilterQuery } from 'mongoose';

export interface ResourceListOptions {
  page: number;
  limit: number;
  sort: 'recent' | 'popular';
}

const UPLOADER_FIELDS = 'name college avatarUrl';

/** Data access for resources. The only module touching the Resource model. */
export const resourceRepository = {
  create(data: Partial<IResource>) {
    return Resource.create(data);
  },

  findById(id: string) {
    return Resource.findById(id).populate('uploader', UPLOADER_FIELDS);
  },

  async list(filter: FilterQuery<IResource>, options: ResourceListOptions) {
    const { page, limit, sort } = options;
    const sortSpec: Record<string, 1 | -1> =
      sort === 'popular' ? { views: -1, downloads: -1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Resource.find(filter)
        .populate('uploader', UPLOADER_FIELDS)
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit),
      Resource.countDocuments(filter),
    ]);

    return { items, total };
  },

  findByUploader(uploaderId: string) {
    return Resource.find({ uploader: uploaderId, isActive: true })
      .sort({ createdAt: -1 })
      .populate('uploader', UPLOADER_FIELDS);
  },

  incrementViews(id: string) {
    return Resource.findByIdAndUpdate(id, { $inc: { views: 1 } });
  },

  findByIds(ids: string[]) {
    return Resource.find({ _id: { $in: ids }, isActive: true }).populate('uploader', UPLOADER_FIELDS);
  },

  adjustBookmarks(id: string, delta: number) {
    return Resource.findByIdAndUpdate(id, { $inc: { bookmarksCount: delta } });
  },

  incrementDownloads(id: string) {
    return Resource.findByIdAndUpdate(id, { $inc: { downloads: 1 } });
  },

  adjustBookmarkCount(id: string, delta: number) {
    return Resource.findByIdAndUpdate(id, { $inc: { bookmarksCount: delta } });
  },

  updateById(id: string, update: Partial<IResource>) {
    return Resource.findByIdAndUpdate(id, update, { new: true }).populate('uploader', UPLOADER_FIELDS);
  },

  deleteById(id: string) {
    return Resource.findByIdAndDelete(id);
  },
};
