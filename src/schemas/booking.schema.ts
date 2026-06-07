import { z } from '../config/zod.js';
import { ADDITIONAL_SERVICES, MONGO_ID_MOCK } from '../constants/constants.js';

import { ensureISODate, ensureObjectId } from './shared.js';

export const PriceSummarySchema = z
  .object({
    nights: z.number().openapi({ example: 6 }),
    discount: z.number().openapi({ example: 0 }),
    pricePerNight: z.number().openapi({ example: 5000 }),
    basePrice: z.number().openapi({ example: 30000 }),
    servicePrice: z.number().openapi({ example: 1000 }),
    additionalServicePrice: z.number().openapi({ example: 1500 }),
    additionalServiceSummary: z.record(z.enum(ADDITIONAL_SERVICES), z.number()),
    totalPrice: z.number().openapi({ example: 32500 }),
  })
  .openapi('PriceSummary');

export const BookingSchema = z
  .object({
    id: z.string().openapi({ description: 'MongoDB ObjectId virtual id', example: MONGO_ID_MOCK }),
    user: z.string().openapi({ description: 'User ObjectId ref', example: MONGO_ID_MOCK }),
    room: z.string().openapi({ description: 'Room ObjectId ref', example: MONGO_ID_MOCK }),
    checkIn: z.iso.datetime().openapi({ example: '2026-06-01T12:00:00.000Z' }),
    checkOut: z.iso.datetime().openapi({ example: '2026-06-07T12:00:00.000Z' }),
    guests: z.object({
      adult: z.number().default(0),
      child: z.number().default(0),
      baby: z.number().default(0),
    }),
    additionalServices: z.array(z.enum(ADDITIONAL_SERVICES)),
    priceSummary: PriceSummarySchema,
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .openapi('Booking');

export const bookingParamsSchema = z.object({
  roomId: ensureObjectId('room ID'),
});

export const BookingBodyContractSchema = z
  .object({
    checkIn: ensureISODate('check-in'),
    checkOut: ensureISODate('check-out'),
    additionalServices: z
      .array(z.enum(ADDITIONAL_SERVICES, { message: 'Invalid service name' }))
      .optional()
      .default([]),
    guests: z
      .object({
        adult: z.number().nonnegative().optional().default(0),
        child: z.number().nonnegative().optional().default(0),
        baby: z.number().nonnegative().optional().default(0),
      })
      .optional()
      .default({ adult: 0, child: 0, baby: 0 }),
  })
  .openapi('BookingRequestBody')
  .refine(
    (body) => {
      const { checkOut, checkIn } = body;

      return (
        checkOut instanceof Date &&
        checkIn instanceof Date &&
        checkOut.getTime() > checkIn.getTime()
      );
    },
    {
      message: 'Check-out date must be after check-in date',
      path: ['checkOut'],
    },
  )
  .refine(
    (body) => {
      const adult = body.guests?.adult ?? 0;
      const child = body.guests?.child ?? 0;

      return adult + child > 0;
    },
    {
      message: 'There must be at least one guest',
      path: ['guests', 'adult'],
    },
  );

export const getPriceSummarySchema = z.object({
  params: bookingParamsSchema,
  body: BookingBodyContractSchema,
});

export const createBookingSchema = z.object({
  params: bookingParamsSchema,
  body: BookingBodyContractSchema,
});
