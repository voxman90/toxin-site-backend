import type z from '../config/zod.js';
import type {
  CreateReviewResponseSchema,
  PaginatedReviewsSchema,
  ReviewSchema,
  ToggleLikeResponseSchema,
} from '../schemas/review.schema.js';

export type ReviewDTO = z.infer<typeof ReviewSchema>;

export type PaginatedReviewsDTO = z.infer<typeof PaginatedReviewsSchema>;

export type GetRoomReviewsResponseDTO = PaginatedReviewsDTO;

export type CreateReviewResponseDTO = z.infer<typeof CreateReviewResponseSchema>;

export type ToggleLikeResponseDTO = z.infer<typeof ToggleLikeResponseSchema>;
