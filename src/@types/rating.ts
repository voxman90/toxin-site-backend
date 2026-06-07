import type z from '../config/zod.js';
import type { CreateRatingResponseSchema, RatingSummarySchema } from '../schemas/rating.schema.js';

export type RatingSummaryDTO = z.infer<typeof RatingSummarySchema>;

export type CreateRatingResponseDTO = z.infer<typeof CreateRatingResponseSchema>;

export type GetRatingSummaryResponseDTO = RatingSummaryDTO;

export interface ScoreBreakdownItem {
  _id: number;
  count: number;
}

export interface SummaryItem {
  _id: null;
  totalCount: number;
  avgScore: number;
}

export interface RatingAggregationResult {
  scoreBreakdown: ScoreBreakdownItem[];
  summary: SummaryItem[];
}
