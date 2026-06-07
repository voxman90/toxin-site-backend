import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware.js';
import {
  CreateRatingResponseSchema,
  RatingSummarySchema,
  createRatingSchema,
  getRatingSummarySchema,
} from '../../schemas/rating.schema.js';
import {
  ServerErrorResponseSchema,
  UnauthorizedResponseSchema,
  ValidationErrorResponseSchema,
} from '../../schemas/shared.js';
import { documentEndpoint } from '../../utils/contract.js';
import { createRating, getRatingSummary } from '../controllers/rating.controller.js';

const router = Router();

router.post('/:roomId', protect(), createRating);
documentEndpoint({
  method: 'post',
  path: '/api/v1/ratings/{roomId}',
  summary: 'Create or update room rating',
  security: [{ bearerAuth: [] }],
  request: {
    params: createRatingSchema.shape.params,
    body: {
      required: true,
      content: { 'application/json': { schema: createRatingSchema.shape.body } },
    },
  },
  responses: {
    201: {
      description: 'Rating saved successfully',
      content: { 'application/json': { schema: CreateRatingResponseSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponseSchema } },
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

router.get('/:roomId', getRatingSummary);
documentEndpoint({
  method: 'get',
  path: '/api/v1/ratings/{roomId}',
  summary: 'Get room rating summary and score breakdown',
  request: {
    params: getRatingSummarySchema.shape.params,
  },
  responses: {
    200: {
      description: 'Rating summary retrieved successfully',
      content: { 'application/json': { schema: RatingSummarySchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponseSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ServerErrorResponseSchema } },
    },
  },
});

export default router;
