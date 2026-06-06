import { z } from '../config/zod.js';
import { MAX_RATING_SCORE, MIN_RATING_SCORE } from '../constants/constants.js';

import { ensureObjectId } from './shared.js';

export const ratingParamsSchema = z.object({
  roomId: ensureObjectId('room ID'),
});

export const CreateRatingBodyContractSchema = z
  .object({
    score: z
      .number({ message: 'Score is required and must be a number' })
      .int({ message: 'Score must be an integer' })
      .min(MIN_RATING_SCORE, `Score must be at least ${MIN_RATING_SCORE}`)
      .max(MAX_RATING_SCORE, `Score cannot be greater than ${MAX_RATING_SCORE}`),
  })
  .openapi('CreateRatingRequestBody');

export const getRatingSummarySchema = z.object({
  params: ratingParamsSchema,
});

export const createRatingSchema = z.object({
  params: ratingParamsSchema,
  body: CreateRatingBodyContractSchema,
});

export const RatingSummaryResponseSchema = z
  .object({
    totalCount: z.number().openapi({ example: 12 }),
    avgScore: z.number().openapi({ example: 4.5 }),
    scoreBreakdown: z.record(z.string(), z.number()).openapi({
      example: { '1': 0, '2': 1, '3': 2, '4': 4, '5': 5 },
    }),
  })
  .openapi('RatingSummaryResponse');
