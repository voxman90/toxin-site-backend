import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware.js';
import {
  RatingSummaryResponseSchema,
  createRatingSchema,
  getRatingSummarySchema,
} from '../../schemas/rating.schema.js';
import {
  ServerErrorResponseSchema,
  UnauthorizedResponseSchema,
  ValidationErrorResponseSchema,
  makeMessageResponseSchema,
} from '../../schemas/shared.js';
import { documentEndpoint } from '../../utils/contract.js';
import { createRating, getRatingSummary } from '../controllers/rating.controller.js';

const router = Router();

documentEndpoint({
  method: 'post',
  path: '/api/ratings/{roomId}',
  summary: 'Create or update room rating',
  security: [{ bearerAuth: [] }],
  request: {
    params: createRatingSchema.shape.params,
    body: {
      content: { 'application/json': { schema: createRatingSchema.shape.body } },
    },
  },
  responses: {
    201: {
      description: 'Rating saved successfully',
      content: {
        'application/json': { schema: makeMessageResponseSchema('Rating saved successfully') },
      },
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
router.post('/:roomId', protect(), createRating);

documentEndpoint({
  method: 'get',
  path: '/api/ratings/{roomId}',
  summary: 'Get room rating summary and score breakdown',
  request: {
    params: getRatingSummarySchema.shape.params,
  },
  responses: {
    200: {
      description: 'Rating summary retrieved successfully',
      content: { 'application/json': { schema: RatingSummaryResponseSchema } },
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
router.get('/:roomId', getRatingSummary);

export default router;
