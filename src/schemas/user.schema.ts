import { z } from 'zod';

import { MIN_PASSWORD_LENGTH } from '../constants/constants.js';

import { ensureObjectId } from './shared.js';

export const registerUserSchema = z.object({
  body: z.object({
    firstName: z
      .string({ message: 'First name is required' })
      .trim()
      .min(1, 'First name cannot be empty'),
    lastName: z
      .string({ message: 'Last name is required' })
      .trim()
      .min(1, 'Last name cannot be empty'),
    gender: z.string({ message: 'Gender is required' }).min(1, 'Gender cannot be empty'),
    birthdate: z.string({ message: 'Birthdate is required' }).min(1, 'Birthdate cannot be empty'),
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .toLowerCase()
      .pipe(z.email('Please use a valid email address')),
    password: z
      .string({ message: 'Password is required' })
      .min(MIN_PASSWORD_LENGTH, 'Password must be at least 6 characters long'),
    specialOffer: z
      .boolean({ message: 'Special offer must be a boolean' })
      .optional()
      .default(false),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .toLowerCase()
      .pipe(z.email('Please use a valid email address')),
    password: z.string({ message: 'Password is required' }).min(1, 'Password cannot be empty'),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: ensureObjectId('user ID'),
  }),
});
