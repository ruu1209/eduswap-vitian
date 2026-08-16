import { Types } from 'mongoose';
import { User, type IUser } from '../models/user.model';
import { buildSearchRegex } from '../utils/regex';

type CreateUserInput = Pick<IUser, 'name' | 'email' | 'password'> &
  Partial<Pick<IUser, 'college' | 'rollNumber' | 'role'>>;

/** The only module that talks to the User model directly. */
export const userRepository = {
  create(data: CreateUserInput) {
    return User.create(data);
  },

  findByEmail(email: string, withPassword = false) {
    const query = User.findOne({ email: email.toLowerCase() });
    return withPassword ? query.select('+password') : query;
  },

  findById(id: string) {
    return User.findById(id);
  },

  findByIdWithRefresh(id: string) {
    return User.findById(id).select('+refreshTokenHash');
  },

  findByResetTokenHash(hash: string) {
    return User.findOne({
      passwordResetTokenHash: hash,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetTokenHash +passwordResetExpires');
  },

  setRefreshTokenHash(id: string, hash: string | null) {
    return User.findByIdAndUpdate(id, { refreshTokenHash: hash });
  },

  setPasswordReset(id: string, hash: string, expires: Date) {
    return User.findByIdAndUpdate(id, {
      passwordResetTokenHash: hash,
      passwordResetExpires: expires,
    });
  },

  findByEmailWithOtp(email: string) {
    return User.findOne({ email: email.toLowerCase() }).select('+otpHash +otpExpires');
  },

  setOtp(id: string, hash: string, expires: Date) {
    return User.findByIdAndUpdate(id, { otpHash: hash, otpExpires: expires });
  },

  markVerified(id: string) {
    return User.findByIdAndUpdate(
      id,
      { isVerified: true, otpHash: null, otpExpires: null },
      { new: true },
    );
  },

  /** Returns ids of users whose name matches the query (for uploader/seller search). */
  async findIdsMatchingName(query: string): Promise<Types.ObjectId[]> {
    const users = await User.find({ name: buildSearchRegex(query) }).select('_id').lean();
    return users.map((u) => u._id);
  },
};
