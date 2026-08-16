import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { baseSchemaOptions } from '../utils/mongoose';
import {
  BOOK_CONDITIONS,
  BOOK_STATUSES,
  DEPARTMENTS,
  SEMESTERS,
  type BookCondition,
  type BookStatus,
  type Department,
  type Semester,
} from '../utils/enums';

interface StoredFile {
  url: string;
  publicId: string;
}

export interface IBook {
  title: string;
  author?: string;
  description?: string;
  subject?: string;
  department?: Department;
  semester?: Semester;
  courseCode?: string;
  edition?: string;
  condition: BookCondition;
  price: number;
  isNegotiable: boolean;
  images: StoredFile[];
  seller: Types.ObjectId;
  college: string;
  status: BookStatus;
  reservedBy?: Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BookDocument = HydratedDocument<IBook>;

const fileSchema = new Schema<StoredFile>(
  { url: { type: String, required: true }, publicId: { type: String, required: true } },
  { _id: false },
);

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    author: { type: String, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 4000 },
    subject: { type: String, trim: true, maxlength: 120 },
    department: { type: String, enum: DEPARTMENTS },
    semester: { type: Number, enum: SEMESTERS },
    courseCode: { type: String, trim: true, uppercase: true, maxlength: 20 },
    edition: { type: String, trim: true, maxlength: 40 },
    condition: { type: String, enum: BOOK_CONDITIONS, required: true },
    price: { type: Number, required: true, min: 0 },
    isNegotiable: { type: Boolean, default: true },
    images: { type: [fileSchema], default: [] },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    college: { type: String, required: true, trim: true },
    status: { type: String, enum: BOOK_STATUSES, default: 'available', index: true },
    reservedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions,
);

bookSchema.index({ title: 'text', author: 'text', subject: 'text', courseCode: 'text' });
bookSchema.index({ department: 1, status: 1 });
bookSchema.index({ createdAt: -1 });

export const Book = model<IBook>('Book', bookSchema);
