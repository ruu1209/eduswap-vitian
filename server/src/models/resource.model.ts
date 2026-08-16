import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { baseSchemaOptions } from '../utils/mongoose';
import {
  DEPARTMENTS,
  RESOURCE_TYPES,
  SEMESTERS,
  type Department,
  type ResourceType,
  type Semester,
} from '../utils/enums';

interface StoredFile {
  url: string;
  publicId: string;
}

export interface IResource {
  title: string;
  description: string;
  subject: string;
  department: Department;
  semester: Semester;
  courseCode?: string;
  type: ResourceType;
  tags: string[];
  isFree: boolean;
  price: number;
  file?: StoredFile; // the PDF/notes file
  images: StoredFile[]; // previews / cover images
  uploader: Types.ObjectId;
  college: string;
  views: number;
  downloads: number;
  bookmarksCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type ResourceDocument = HydratedDocument<IResource>;

const fileSchema = new Schema<StoredFile>(
  { url: { type: String, required: true }, publicId: { type: String, required: true } },
  { _id: false },
);

const resourceSchema = new Schema<IResource>(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, required: true, trim: true, maxlength: 4000 },
    subject: { type: String, required: true, trim: true, maxlength: 120 },
    department: { type: String, enum: DEPARTMENTS, required: true },
    semester: { type: Number, enum: SEMESTERS, required: true },
    courseCode: { type: String, trim: true, uppercase: true, maxlength: 20 },
    type: { type: String, enum: RESOURCE_TYPES, required: true },
    tags: { type: [String], default: [], index: true },
    isFree: { type: Boolean, default: true },
    price: { type: Number, default: 0, min: 0 },
    file: { type: fileSchema },
    images: { type: [fileSchema], default: [] },
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    college: { type: String, required: true, trim: true },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    bookmarksCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions,
);

// Free resources cannot carry a price.
resourceSchema.pre('validate', function (next) {
  if (this.isFree) this.price = 0;
  else if (this.price > 0) this.isFree = false;
  next();
});

// Full-text search across the fields students actually search by (Phase 9).
resourceSchema.index({ title: 'text', description: 'text', subject: 'text', courseCode: 'text', tags: 'text' });
resourceSchema.index({ department: 1, semester: 1 });
resourceSchema.index({ createdAt: -1 });

export const Resource = model<IResource>('Resource', resourceSchema);
