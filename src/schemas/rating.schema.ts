import { z } from 'zod';

import { MAX_RATING_SCORE, MIN_RATING_SCORE } from '../constants/constants.js';

import { ensureObjectId } from './shared.js';

export const createRatingSchema = z.object({
  params: z.object({
    roomId: ensureObjectId('room ID'),
  }),
  body: z.object({
    score: z
      .number({ message: 'Score is required and must be a number' })
      .int({ message: 'Score must be an integer' })
      .min(MIN_RATING_SCORE, `Score must be at least ${MIN_RATING_SCORE}`)
      .max(MAX_RATING_SCORE, `Score cannot be greater than ${MAX_RATING_SCORE}`),
  }),
});

export const getRatingSummarySchema = z.object({
  params: z.object({
    roomId: ensureObjectId('room ID'),
  }),
});
