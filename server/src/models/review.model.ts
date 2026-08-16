import { Schema, model, type HydratedDocument, type Types } from 'mongoose';
import { baseSchemaOptions } from '../utils/mongoose';
import { REVIEW_TARGETS, type ReviewTarget } from '../utils/enums';

export interface IReview {
  author: Types.ObjectId;
  targetType: ReviewTarget; // 'Resource' | 'User' (a seller)
  target: Types.ObjectId;
  rating: number; // 1..5
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReviewDocument = HydratedDocument<IReview>;

const reviewSchema = new Schema<IReview>(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: REVIEW_TARGETS, required: true },
    target: { type: Schema.Types.ObjectId, required: true, refPath: 'targetType' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  baseSchemaOptions,
);

// One review per author per target.
reviewSchema.index({ author: 1, targetType: 1, target: 1 }, { unique: true });
reviewSchema.index({ target: 1, createdAt: -1 });

export const Review = model<IReview>('Review', reviewSchema);
