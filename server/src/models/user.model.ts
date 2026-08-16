import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES, type UserRole } from '../utils/constants';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  isVerified: boolean;
  college?: string;
  rollNumber?: string;
  avatarUrl?: string;
  refreshTokenHash?: string | null;
  passwordResetTokenHash?: string | null;
  passwordResetExpires?: Date | null;
  otpHash?: string | null; // Phase 5
  otpExpires?: Date | null; // Phase 5
  createdAt: Date;
  updatedAt: Date;
}

interface IUserMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

type UserModelType = Model<IUser, Record<string, never>, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new Schema<IUser, UserModelType, IUserMethods>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(USER_ROLES), default: USER_ROLES.STUDENT },
    isVerified: { type: Boolean, default: false },
    college: { type: String, trim: true },
    rollNumber: { type: String, trim: true },
    avatarUrl: { type: String },
    refreshTokenHash: { type: String, default: null, select: false },
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpires: { type: Date, default: null, select: false },
    otpHash: { type: String, default: null, select: false },
    otpExpires: { type: Date, default: null, select: false },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret: Record<string, unknown>) {
        delete ret.password;
        delete ret.refreshTokenHash;
        delete ret.passwordResetTokenHash;
        delete ret.passwordResetExpires;
        delete ret.otpHash;
        delete ret.otpExpires;
        delete ret._id;
        return ret;
      },
    },
  },
);

// Hash the password whenever it is set or changed.
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser, UserModelType>('User', userSchema);
