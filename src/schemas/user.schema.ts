import { z } from '../config/zod.js';
import { MIN_PASSWORD_LENGTH, MONGO_ID_MOCK, ROLES } from '../constants/constants.js';

import { ensureObjectId, makeMessageResponseSchema } from './shared.js';

export const UserSchema = z
  .object({
    id: z.string().openapi({ example: MONGO_ID_MOCK }),
    firstName: z.string().openapi({ example: 'John' }),
    lastName: z.string().openapi({ example: 'Doe' }),
    gender: z.string().openapi({ example: 'male' }),
    birthdate: z.string().openapi({ example: '1995-05-15' }),
    email: z.email().openapi({ example: 'john.doe@example.com' }),
    specialOffer: z.boolean(),
    avatarUrl: z.string().openapi({ example: 'https://example.com' }),
    role: z.enum([ROLES.user, ROLES.admin]).openapi({ example: ROLES.user }),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi('User');

export const RegisterBodyContractSchema = z
  .object({
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
  })
  .openapi('RegisterRequestBody');

export const LoginBodyContractSchema = z
  .object({
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .toLowerCase()
      .pipe(z.email('Please use a valid email address')),
    password: z.string({ message: 'Password is required' }).min(1, 'Password cannot be empty'),
  })
  .openapi('LoginRequestBody');

export const loginSchema = z.object({
  body: LoginBodyContractSchema,
});

export const registerSchema = z.object({
  body: RegisterBodyContractSchema,
});

export const getUserSchema = z.object({
  params: z.object({
    id: ensureObjectId('user ID'),
  }),
});

export const LoginResponseSchema = z
  .object({
    message: z.string().openapi({ example: 'User logged in successfully' }),
    token: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsIn...' }),
    user: UserSchema,
  })
  .openapi('LoginResponse');

export const RegisterResponseSchema = makeMessageResponseSchema('User registered successfully');
