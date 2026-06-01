import { z } from 'zod';

import { ADDITIONAL_SERVICES } from '../constants/constants.js';

import { ensureArray, ensureISODate, ensureObjectId } from './shared.js';

export const bookingParamsSchema = z.object({
  roomId: ensureObjectId('room ID'),
});

export const bookingBodySchema = z
  .object({
    checkIn: ensureISODate('check-in'),
    checkOut: ensureISODate('check-out'),
    'additionalServices[]': ensureArray
      .pipe(z.array(z.enum(ADDITIONAL_SERVICES, { message: 'Invalid service name' })))
      .optional()
      .default([]),
    'guests[adult]': z.coerce.number().nonnegative().optional().default(0),
    'guests[child]': z.coerce.number().nonnegative().optional().default(0),
    'guests[baby]': z.coerce.number().nonnegative().optional().default(0),
  })
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
  .refine((body) => body['guests[adult]'] + body['guests[child]'] > 0, {
    message: 'There must be at least one guest',
    path: ['guests[adult]'],
  });
