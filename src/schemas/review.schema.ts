import { z } from 'zod';

import {
  ALLOWED_REVIEWS_SORT_FIELDS,
  DEFAULT_REVIEWS_LIMIT,
  DEFAULT_REVIEWS_ORDER,
  DEFAULT_REVIEWS_SORT,
} from '../constants/constants.js';

import { ensureObjectId } from './shared.js';

export const createReviewSchema = z.object({
  body: z.object({
    text: z.string({ message: 'Text id required' }).trim().min(1, 'Text cannot be empty'),
    roomId: ensureObjectId('room ID'),
  }),
});

export const getRoomReviewsSchema = z.object({
  params: z.object({
    roomId: ensureObjectId('room ID'),
  }),
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : 1))
      .refine((val) => !isNaN(val) && val > 0, { message: 'Page must be a positive number' }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Number(val) : DEFAULT_REVIEWS_LIMIT))
      .refine((val) => !isNaN(val) && val > 0, { message: 'Limit must be a positive number' }),
    sort: z
      .enum(ALLOWED_REVIEWS_SORT_FIELDS, { message: 'Invalid sort field' })
      .optional()
      .default(DEFAULT_REVIEWS_SORT),
    order: z
      .string()
      .optional()
      .transform((val) => (val ? (Number(val) === 1 ? 1 : -1) : DEFAULT_REVIEWS_ORDER)),
  }),
});

export const toggleLikeSchema = z.object({
  params: z.object({
    reviewId: ensureObjectId('review ID'),
  }),
});
