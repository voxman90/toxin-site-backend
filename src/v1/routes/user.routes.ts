import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware.js';
import {
  ServerErrorResponseSchema,
  UnauthorizedResponseSchema,
  ValidationErrorResponseSchema,
  makeMessageResponseSchema,
} from '../../schemas/shared.js';
import { UserResponseSchema, getUserByIdSchema } from '../../schemas/user.schema.js';
import { documentEndpoint } from '../../utils/contract.js';
import { getMyProfile, getUserById } from '../controllers/user.controller.js';

const router = Router();

documentEndpoint({
  method: 'get',
  path: '/api/users/me',
  summary: 'Get current authorized user profile',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Current user profile data',
      content: { 'application/json': { schema: UserResponseSchema } },
    },
    401: {
      description: 'Unauthorized access',
      content: { 'application/json': { schema: UnauthorizedResponseSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ServerErrorResponseSchema } },
    },
  },
});
router.get('/me', protect(), getMyProfile);

documentEndpoint({
  method: 'get',
  path: '/api/users/{id}',
  summary: 'Get user profile by ID',
  request: {
    params: getUserByIdSchema.shape.params,
  },
  responses: {
    200: {
      description: 'User profile data retrieved successfully',
      content: { 'application/json': { schema: UserResponseSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponseSchema } },
    },
    404: {
      description: 'User not found',
      content: { 'application/json': { schema: makeMessageResponseSchema('User not found') } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ServerErrorResponseSchema } },
    },
  },
});
router.get('/:id', getUserById);

export default router;
