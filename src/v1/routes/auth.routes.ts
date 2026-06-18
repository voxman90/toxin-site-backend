import { Router } from 'express';

import {
  ServerErrorResponseSchema,
  ValidationErrorResponseSchema,
  makeMessageResponseSchema,
} from '../../schemas/shared.js';
import {
  LoginResponseSchema,
  RegisterResponseSchema,
  loginSchema,
  registerSchema,
} from '../../schemas/user.schema.js';
import { documentEndpoint } from '../../utils/contract.js';
import { loginUser, registerUser } from '../controllers/auth.controller.js';

const router = Router();

router.post('/login', loginUser);
documentEndpoint({
  method: 'post',
  path: '/api/v1/auth/login',
  summary: 'Authenticate user and get token',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: loginSchema.shape.body } },
    },
  },
  responses: {
    200: {
      description: 'User authenticated successfully',
      content: { 'application/json': { schema: LoginResponseSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponseSchema } },
    },
    401: {
      description: 'Invalid credentials',
      content: { 'application/json': { schema: makeMessageResponseSchema('Invalid credentials') } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ServerErrorResponseSchema } },
    },
  },
});

router.post('/register', registerUser);
documentEndpoint({
  method: 'post',
  path: '/api/v1/auth/register',
  summary: 'Register a new user',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: registerSchema.shape.body } },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': { schema: RegisterResponseSchema },
      },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponseSchema } },
    },
    409: {
      description: 'Email already exists',
      content: {
        'application/json': { schema: makeMessageResponseSchema('Email already exists') },
      },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ServerErrorResponseSchema } },
    },
  },
});

export default router;
