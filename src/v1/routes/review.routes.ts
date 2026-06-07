import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware.js';
import {
  CreateReviewResponseSchema,
  PaginatedReviewsSchema,
  ToggleLikeResponseSchema,
  createReviewSchema,
  getRoomReviewsSchema,
  toggleLikeSchema,
} from '../../schemas/review.schema.js';
import {
  ServerErrorResponseSchema,
  UnauthorizedResponseSchema,
  ValidationErrorResponseSchema,
} from '../../schemas/shared.js';
import { documentEndpoint } from '../../utils/contract.js';
import { toggleLike } from '../controllers/like.controller.js';
import { createReview, getRoomReviews } from '../controllers/review.controller.js';

const router = Router();

router.post('/', protect(), createReview);
documentEndpoint({
  method: 'post',
  path: '/api/v1/reviews',
  summary: 'Create a new review for a room',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: createReviewSchema.shape.body } },
    },
  },
  responses: {
    201: {
      description: 'Review created successfully',
      content: {
        'application/json': { schema: CreateReviewResponseSchema },
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

router.get('/:roomId', protect(true), getRoomReviews);
documentEndpoint({
  method: 'get',
  path: '/api/v1/reviews/{roomId}',
  summary: 'Get paginated reviews for a room (Optional Auth)',
  description:
    'Public endpoint. If Bearer token is provided, isLiked field will reflect current user status.',
  request: {
    params: getRoomReviewsSchema.shape.params,
    query: getRoomReviewsSchema.shape.query,
  },
  responses: {
    200: {
      description: 'Paginated reviews list retrieved successfully',
      content: { 'application/json': { schema: PaginatedReviewsSchema } },
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

router.put('/:reviewId/toggle-like', protect(), toggleLike);
documentEndpoint({
  method: 'put',
  path: '/api/v1/reviews/{reviewId}/toggle-like',
  summary: 'Toggle like status on a review',
  security: [{ bearerAuth: [] }],
  request: {
    params: toggleLikeSchema.shape.params,
  },
  responses: {
    200: {
      description: 'Like status toggled successfully',
      content: { 'application/json': { schema: ToggleLikeResponseSchema } },
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

export default router;
