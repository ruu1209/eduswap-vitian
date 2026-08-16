import { User } from '../models/user.model';
import { Resource } from '../models/resource.model';
import { Book } from '../models/book.model';
import { Report } from '../models/report.model';
import { AppError } from '../utils/AppError';
import { buildSearchRegex } from '../utils/regex';

interface Paged {
  page: number;
  limit: number;
  q?: string;
}

function meta(total: number, page: number, limit: number) {
  return { total, page, limit, pages: Math.ceil(total / limit) };
}

export const adminService = {
  async stats() {
    const [users, verifiedUsers, resources, books, booksSold, pendingReports, totalReports] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isVerified: true }),
        Resource.countDocuments(),
        Book.countDocuments(),
        Book.countDocuments({ status: 'sold' }),
        Report.countDocuments({ status: 'pending' }),
        Report.countDocuments(),
      ]);
    return { users, verifiedUsers, resources, books, booksSold, pendingReports, totalReports };
  },

  async listUsers({ page, limit, q }: Paged) {
    const filter = q ? { name: buildSearchRegex(q) } : {};
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);
    return { items, meta: meta(total, page, limit) };
  },

  async deleteUser(id: string, adminId: string) {
    if (id === adminId) throw AppError.badRequest('You cannot delete your own account');
    const user = await User.findById(id);
    if (!user) throw AppError.notFound('User not found');
    if (user.role === 'admin') throw AppError.forbidden('Admins cannot be deleted here');
    await user.deleteOne();
  },

  async listResources({ page, limit, q }: Paged) {
    const filter = q ? { title: buildSearchRegex(q) } : {};
    const [items, total] = await Promise.all([
      Resource.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('uploader', 'name email'),
      Resource.countDocuments(filter),
    ]);
    return { items, meta: meta(total, page, limit) };
  },

  async listBooks({ page, limit, q }: Paged) {
    const filter = q ? { title: buildSearchRegex(q) } : {};
    const [items, total] = await Promise.all([
      Book.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('seller', 'name email'),
      Book.countDocuments(filter),
    ]);
    return { items, meta: meta(total, page, limit) };
  },
};
