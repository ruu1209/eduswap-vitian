import { Book, type IBook } from '../models/book.model';
import type { FilterQuery } from 'mongoose';

export interface BookListOptions {
  page: number;
  limit: number;
  sort: 'recent' | 'price_asc' | 'price_desc';
}

const SELLER_FIELDS = 'name college avatarUrl';

export const bookRepository = {
  create(data: Partial<IBook>) {
    return Book.create(data);
  },

  findById(id: string) {
    return Book.findById(id)
      .populate('seller', SELLER_FIELDS)
      .populate('reservedBy', 'name');
  },

  async list(filter: FilterQuery<IBook>, options: BookListOptions) {
    const { page, limit, sort } = options;
    const sortSpec: Record<string, 1 | -1> =
      sort === 'price_asc' ? { price: 1 } : sort === 'price_desc' ? { price: -1 } : { createdAt: -1 };

    const [items, total] = await Promise.all([
      Book.find(filter)
        .populate('seller', SELLER_FIELDS)
        .sort(sortSpec)
        .skip((page - 1) * limit)
        .limit(limit),
      Book.countDocuments(filter),
    ]);

    return { items, total };
  },

  findByIds(ids: string[]) {
    return Book.find({ _id: { $in: ids }, isActive: true }).populate('seller', SELLER_FIELDS);
  },

  findBySeller(sellerId: string) {
    return Book.find({ seller: sellerId, isActive: true })
      .sort({ createdAt: -1 })
      .populate('seller', SELLER_FIELDS);
  },

  updateById(id: string, update: Partial<IBook>) {
    return Book.findByIdAndUpdate(id, update, { new: true })
      .populate('seller', SELLER_FIELDS)
      .populate('reservedBy', 'name');
  },

  deleteById(id: string) {
    return Book.findByIdAndDelete(id);
  },
};
