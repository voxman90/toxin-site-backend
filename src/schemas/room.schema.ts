import type { Order } from '../@types/data.js';
import { z } from '../config/zod.js';
import {
  ACCESSIBILITY,
  ALLOWED_SORT_FIELDS,
  DEFAULT_ROOMS_LIMIT,
  DEFAULT_ROOMS_ORDER,
  DEFAULT_ROOMS_SORT,
  MONGO_ID_MOCK,
  RULES,
} from '../constants/constants.js';

import { ensureISODate, ensureObjectId, makePaginatedResponseSchema } from './shared.js';

export const SearchRoomsQueryContractSchema = z
  .object({
    checkIn: ensureISODate('check-in'),
    checkOut: ensureISODate('check-out'),
    minPrice: z.number().nonnegative().optional(),
    maxPrice: z.number().nonnegative().optional(),
    guests: z
      .object({
        adult: z.number().nonnegative().optional().default(0),
        child: z.number().nonnegative().optional().default(0),
        baby: z.number().nonnegative().optional().default(0),
      })
      .optional()
      .default({ adult: 0, child: 0, baby: 0 }),
    amenities: z
      .object({
        bed: z.number().nonnegative().optional().default(0),
        bedroom: z.number().nonnegative().optional().default(0),
        bathroom: z.number().nonnegative().optional().default(0),
      })
      .optional()
      .default({ bed: 0, bedroom: 0, bathroom: 0 }),
    accessibility: z.array(z.enum(ACCESSIBILITY)).optional().default([]),
    rules: z.array(z.enum(RULES)).optional().default([]),
    sort: z.enum(ALLOWED_SORT_FIELDS).optional().default(DEFAULT_ROOMS_SORT),
    order: z
      .number()
      .optional()
      .default(DEFAULT_ROOMS_ORDER)
      .openapi({ description: '1 for ASC, -1 for DESC', example: DEFAULT_ROOMS_ORDER })
      .transform((val): Order => (val === 1 ? 1 : -1)),
    limit: z.number().positive().optional().default(DEFAULT_ROOMS_LIMIT),
    page: z.number().positive().optional().default(1),
  })
  .openapi('SearchRoomsQueryParams')
  .refine((query) => query.checkOut.getTime() > query.checkIn.getTime(), {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  });

export const getRoomByIdSchema = z.object({
  params: z.object({
    id: ensureObjectId('room ID'),
  }),
});

export const searchRoomsSchema = z.object({
  query: SearchRoomsQueryContractSchema,
});

export const RoomItemSchema = z
  .object({
    id: z.string().openapi({ example: MONGO_ID_MOCK }),
    number: z.number().openapi({ example: 840 }),
    price: z.number().openapi({ example: 5000 }),
    capacity: z.number().openapi({ example: 4 }),
    bed: z.number().openapi({ example: 2 }),
    bedroom: z.number().openapi({ example: 1 }),
    bathroom: z.number().openapi({ example: 1 }),
    isAvailable: z.boolean(),
    avgRating: z.number().openapi({ example: 4.5 }),
    reviewsCount: z.number().openapi({ example: 12 }),
    accessibility: z.array(z.enum(ACCESSIBILITY)),
    rules: z.array(z.enum(RULES)),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi('RoomResponse');

export const PaginatedRoomsResponseSchema = makePaginatedResponseSchema(
  RoomItemSchema,
  'PaginatedRoomsResponse',
);
