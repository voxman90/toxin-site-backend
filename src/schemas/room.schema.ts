import { z } from 'zod';

import {
  ACCESSIBILITY,
  ALLOWED_SORT_FIELDS,
  DEFAULT_ROOMS_LIMIT,
  DEFAULT_ROOMS_ORDER,
  DEFAULT_ROOMS_SORT,
  RULES,
} from '../constants/constants.js';

import { ensureArray, ensureISODate, ensureObjectId } from './shared.js';

export const searchRoomsSchema = z
  .object({
    checkIn: ensureISODate('check-in'),
    checkOut: ensureISODate('check-out'),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    'guests[adult]': z.coerce.number().nonnegative().optional().default(0),
    'guests[child]': z.coerce.number().nonnegative().optional().default(0),
    'amenities[bed]': z.coerce.number().nonnegative().optional(),
    'amenities[bedroom]': z.coerce.number().nonnegative().optional(),
    'amenities[bathroom]': z.coerce.number().nonnegative().optional(),
    'accessibility[]': ensureArray.pipe(z.array(z.enum(ACCESSIBILITY))).optional(),
    'rules[]': ensureArray.pipe(z.array(z.enum(RULES))).optional(),
    sort: z
      .enum(ALLOWED_SORT_FIELDS, { message: 'Invalid sort field' })
      .optional()
      .default(DEFAULT_ROOMS_SORT),
    order: z
      .string()
      .optional()
      .transform((val) => (val ? (Number(val) === 1 ? 1 : -1) : DEFAULT_ROOMS_ORDER)),
    limit: z.coerce.number().positive().optional().default(DEFAULT_ROOMS_LIMIT),
    page: z.coerce.number().positive().optional().default(1),
  })
  .refine((query) => query.checkOut.getTime() > query.checkIn.getTime(), {
    message: 'Check-out date must be after check-in date',
    path: ['checkOut'],
  });

export const getRoomByIdSchema = z.object({
  id: ensureObjectId('room ID'),
});
