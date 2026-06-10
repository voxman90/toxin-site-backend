import type { Order } from '../@types/data.js';
import { z } from '../config/zod.js';
import {
  ALLOWED_REVIEWS_SORT_FIELDS,
  DEFAULT_REVIEWS_LIMIT,
  DEFAULT_REVIEWS_ORDER,
  DEFAULT_REVIEWS_SORT,
  MONGO_ID_MOCK,
} from '../constants/constants.js';

import {
  ensureObjectId,
  makeMessageResponseSchema,
  makePaginatedResponseSchema,
} from './shared.js';

export const ReviewSchema = z
  .object({
    id: z.string().openapi({ example: MONGO_ID_MOCK }),
    authorName: z.string().openapi({ example: 'Ivan Ivanov' }),
    avatarUrl: z.string().nullable().openapi({ example: 'https://example.com' }),
    text: z.string().openapi({ example: 'Great room, very clean!' }),
    createdAt: z.iso.datetime(),
    likeCount: z.number().int().openapi({ example: 5 }),
    isLiked: z.boolean().openapi({ description: 'True if current user liked this review' }),
  })
  .openapi('Review');

export const PaginatedReviewsSchema = makePaginatedResponseSchema(ReviewSchema, 'PaginatedReviews');

export const CreateReviewBodyContractSchema = z
  .object({
    text: z.string({ message: 'Text id required' }).trim().min(1, 'Text cannot be empty'),
    roomId: ensureObjectId('room ID'),
  })
  .openapi('CreateReviewRequestBody');

export const RoomReviewsQueryContractSchema = z
  .object({
    page: z
      .number()
      .positive({ message: 'Page must be a positive number' })
      .optional()
      .default(1)
      .openapi({ description: 'Page number', example: 1 }),
    limit: z
      .number()
      .positive({ message: 'Limit must be a positive number' })
      .optional()
      .default(DEFAULT_REVIEWS_LIMIT)
      .openapi({ description: 'Items per page', example: DEFAULT_REVIEWS_LIMIT }),
    sort: z
      .enum(ALLOWED_REVIEWS_SORT_FIELDS)
      .optional()
      .default(DEFAULT_REVIEWS_SORT)
      .openapi({ example: DEFAULT_REVIEWS_SORT }),
    order: z
      .number()
      .optional()
      .default(DEFAULT_REVIEWS_ORDER)
      .openapi({ description: '1 for ASC, -1 for DESC', example: DEFAULT_REVIEWS_ORDER })
      .transform((val): Order => (val === 1 ? 1 : -1)),
  })
  .openapi('RoomReviewsQueryParam');

export const getRoomReviewsSchema = z.object({
  params: z.object({
    roomId: ensureObjectId('room ID'),
  }),
  query: RoomReviewsQueryContractSchema,
});

export const createReviewSchema = z.object({
  body: CreateReviewBodyContractSchema,
});

export const toggleLikeSchema = z.object({
  params: z.object({
    reviewId: ensureObjectId('review ID'),
  }),
});

export const CreateReviewResponseSchema = makeMessageResponseSchema('Review created successfully');

export const ToggleLikeResponseSchema = z
  .object({
    reviewId: z.string().openapi({ example: MONGO_ID_MOCK }),
    likeCount: z.number().int().nonnegative().openapi({ example: 6 }),
    isLiked: z.boolean().openapi({ description: 'The new like status for the current user' }),
  })
  .openapi('ToggleLikeResponse');
