import { Router } from 'express';

import {
  ServerErrorResponseSchema,
  ValidationErrorResponseSchema,
  makeMessageResponseSchema,
} from '../../schemas/shared.js';
import {
  LoginResponseSchema,
  loginUserSchema,
  registerUserSchema,
} from '../../schemas/user.schema.js';
import { documentEndpoint } from '../../utils/contract.js';
import { loginUser, registerUser } from '../controllers/auth.controller.js';

const router = Router();

documentEndpoint({
  method: 'post',
  path: '/api/users/login',
  summary: 'Authenticate user and get token',
  request: {
    body: {
      content: { 'application/json': { schema: loginUserSchema.shape.body } },
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
router.post('/login', loginUser);

documentEndpoint({
  method: 'post',
  path: '/api/users/register',
  summary: 'Register a new user',
  request: {
    body: {
      content: { 'application/json': { schema: registerUserSchema.shape.body } },
    },
  },
  responses: {
    201: {
      description: 'User registered successfully',
      content: {
        'application/json': { schema: makeMessageResponseSchema('User registered successfully') },
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
router.post('/register', registerUser);

export default router;
