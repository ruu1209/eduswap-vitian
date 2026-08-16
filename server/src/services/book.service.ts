import type { FilterQuery } from 'mongoose';
import { bookRepository, type BookListOptions } from '../repositories/book.repository';
import { userRepository } from '../repositories/user.repository';
import { storageService } from './storage.service';
import type { IBook, BookDocument } from '../models/book.model';
import { AppError } from '../utils/AppError';
import { buildSearchRegex } from '../utils/regex';
import type { UserRole } from '../utils/constants';

interface UploadedFiles {
  images?: Express.Multer.File[];
}
interface CreateBookInput {
  title: string;
  author?: string;
  description?: string;
  subject?: string;
  department?: IBook['department'];
  semester?: IBook['semester'];
  courseCode?: string;
  edition?: string;
  condition: IBook['condition'];
  price: number;
  isNegotiable: boolean;
}
export interface ListBooksInput extends BookListOptions {
  q?: string;
  department?: IBook['department'];
  condition?: IBook['condition'];
  status: IBook['status'];
  maxPrice?: number;
  seller?: string;
}

export const bookService = {
  async create(sellerId: string, input: CreateBookInput, files: UploadedFiles): Promise<BookDocument> {
    const images = files.images ?? [];
    if (images.length === 0) throw AppError.badRequest('Add at least one photo of the book');

    const seller = await userRepository.findById(sellerId);
    if (!seller) throw AppError.notFound('Seller not found');

    const uploaded = await Promise.all(images.map((img) => storageService.uploadImage(img.buffer)));

    return bookRepository.create({
      ...input,
      images: uploaded,
      seller: seller._id,
      college: seller.college ?? '',
    });
  },

  async getById(id: string): Promise<BookDocument> {
    const book = await bookRepository.findById(id);
    if (!book || !book.isActive) throw AppError.notFound('Book not found');
    return book;
  },

  async list(input: ListBooksInput) {
    const filter: FilterQuery<IBook> = { isActive: true, status: input.status };
    if (input.department) filter.department = input.department;
    if (input.condition) filter.condition = input.condition;
    if (input.seller) filter.seller = input.seller;
    if (typeof input.maxPrice === 'number') filter.price = { $lte: input.maxPrice };

    if (input.q && input.q.trim()) {
      const regex = buildSearchRegex(input.q);
      const sellerIds = await userRepository.findIdsMatchingName(input.q);
      filter.$or = [
        { title: regex },
        { author: regex },
        { subject: regex },
        { courseCode: regex },
        ...(sellerIds.length ? [{ seller: { $in: sellerIds } }] : []),
      ];
    }

    const { items, total } = await bookRepository.list(filter, {
      page: input.page,
      limit: input.limit,
      sort: input.sort,
    });

    return {
      items,
      meta: { total, page: input.page, limit: input.limit, pages: Math.ceil(total / input.limit) },
    };
  },

  listBySeller(sellerId: string) {
    return bookRepository.findBySeller(sellerId);
  },

  async reserve(id: string, userId: string): Promise<BookDocument> {
    const book = await bookRepository.findById(id);
    if (!book || !book.isActive) throw AppError.notFound('Book not found');
    if (book.seller._id.toString() === userId) throw AppError.badRequest('You cannot reserve your own book');
    if (book.status !== 'available') throw AppError.badRequest('This book is no longer available');

    const updated = await bookRepository.updateById(id, { status: 'reserved', reservedBy: userId as never });
    if (!updated) throw AppError.notFound('Book not found');
    return updated;
  },

  async cancelReservation(id: string, requester: { id: string; role: UserRole }): Promise<BookDocument> {
    const book = await bookRepository.findById(id);
    if (!book) throw AppError.notFound('Book not found');
    if (book.status !== 'reserved') throw AppError.badRequest('This book is not reserved');

    const isSeller = book.seller._id.toString() === requester.id;
    const isReserver = book.reservedBy?.toString() === requester.id;
    if (!isSeller && !isReserver && requester.role !== 'admin') {
      throw AppError.forbidden('You cannot cancel this reservation');
    }

    const updated = await bookRepository.updateById(id, { status: 'available', reservedBy: null });
    if (!updated) throw AppError.notFound('Book not found');
    return updated;
  },

  async markSold(id: string, requester: { id: string; role: UserRole }): Promise<BookDocument> {
    const book = await bookRepository.findById(id);
    if (!book) throw AppError.notFound('Book not found');

    const isSeller = book.seller._id.toString() === requester.id;
    if (!isSeller && requester.role !== 'admin') throw AppError.forbidden('Only the seller can mark this sold');
    if (book.status === 'sold') throw AppError.badRequest('This book is already sold');

    const updated = await bookRepository.updateById(id, { status: 'sold' });
    if (!updated) throw AppError.notFound('Book not found');
    return updated;
  },

  async remove(id: string, requester: { id: string; role: UserRole }): Promise<void> {
    const book = await bookRepository.findById(id);
    if (!book) throw AppError.notFound('Book not found');

    const isSeller = book.seller._id.toString() === requester.id;
    if (!isSeller && requester.role !== 'admin') throw AppError.forbidden('You cannot delete this book');

    await Promise.allSettled(book.images.map((img) => storageService.remove(img.publicId, 'image')));
    await bookRepository.deleteById(id);
  },
};
