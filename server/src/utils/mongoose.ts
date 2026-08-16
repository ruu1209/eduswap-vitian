/**
 * Shared schema options: timestamps + a clean JSON shape (id instead of _id,
 * no __v). Reused by every domain model so the transform lives in one place.
 *
 * Note: intentionally NOT annotated as `SchemaOptions` — annotating it pins the
 * generic params to their defaults, which conflicts with each typed
 * `new Schema<IEntity>()`. Left as an inferred literal, it stays assignable
 * to every model's options.
 */
export const baseSchemaOptions = {
  timestamps: true as const,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(_doc: unknown, ret: Record<string, unknown>) {
      delete ret._id;
      return ret;
    },
  },
};
