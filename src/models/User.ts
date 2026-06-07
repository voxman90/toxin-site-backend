import bcrypt from 'bcryptjs';
import type { Types } from 'mongoose';
import { Model, Schema, model } from 'mongoose';

import type { Role } from '../@types/data.js';
import { ROLES } from '../constants/constants.js';

export interface IUser {
  firstName: string;
  lastName: string;
  birthdate: string;
  email: string;
  gender: string;
  specialOffer?: boolean;
  password: string;
  role: Role;
  avatarUrl?: string;
}

export interface ILeanUser extends IUser {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserModel = Model<IUser, unknown, IUserMethods>;

export const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        const user = ret as Partial<ILeanUser>;

        delete user.password;

        return user;
      },
    },
    toObject: { virtuals: true },
  },
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, Number(process.env.PSW_SALT_ROUNDS));
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = model<IUser, UserModel>('User', userSchema);

export default User;
