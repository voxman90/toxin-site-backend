import bcrypt from 'bcryptjs';
import { model, Model, Schema } from 'mongoose';

import type { Role } from '../@types/data.js';
import { ROLES, PSW_SALT_ROUNDS } from '../constants/constants.js';

export interface IUser {
  firstName: string;
  lastName: string;
  birthdate: string;
  email: string;
  gender: string;
  specialOffer: boolean;
  password: string;
  role: Role;
  avatarUrl: string;
}

export interface IUserInstanceMethods extends Model<IUser> {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserModel = Model<IUser, {}, IUserInstanceMethods>;

export const userSchema = new Schema<IUser, UserModel, IUserInstanceMethods>({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  birthdate: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
  },
  specialOffer: {
    type: Boolean,
    default: false,
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: [ROLES.user, ROLES.admin],
    default: ROLES.user,
  },
  avatarUrl: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      const user = ret as Partial<IUser>;
      delete user.password;
      return user;
    }
  },
  toObject: { virtuals: true },
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, PSW_SALT_ROUNDS);
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser, UserModel>('User', userSchema);

export default User;
