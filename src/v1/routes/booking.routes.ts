import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware.js';
import {
  BookingPreviewResponseSchema,
  BookingResponseSchema,
  createBookingSchema,
  getBookingPreviewSchema,
} from '../../schemas/booking.schema.js';
import {
  ServerErrorResponseSchema,
  ValidationErrorResponseSchema,
  makeMessageResponseSchema,
} from '../../schemas/shared.js';
import { documentEndpoint } from '../../utils/contract.js';
import { createBooking, getBookingPreview } from '../controllers/booking.controller.js';

const router = Router();

documentEndpoint({
  method: 'post',
  path: '/api/bookings/{roomId}/preview',
  summary: 'Get booking price preview',
  request: {
    params: getBookingPreviewSchema.shape.params,
    body: {
      content: { 'application/json': { schema: getBookingPreviewSchema.shape.body } },
    },
  },
  responses: {
    200: {
      description: 'Price preview calculated successfully',
      content: { 'application/json': { schema: BookingPreviewResponseSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ValidationErrorResponseSchema } },
    },
    404: {
      description: 'Room not found',
      content: { 'application/json': { schema: makeMessageResponseSchema('Room not found') } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ServerErrorResponseSchema } },
    },
  },
});
router.post('/:roomId/preview', getBookingPreview);

documentEndpoint({
  method: 'post',
  path: '/api/bookings/{roomId}/confirm',
  summary: 'Confirm and create room booking',
  security: [{ bearerAuth: [] }],
  request: {
    params: createBookingSchema.shape.params,
    body: {
      content: { 'application/json': { schema: createBookingSchema.shape.body } },
    },
  },
  responses: {
    201: {
      description: 'Booking created successfully',
      content: { 'application/json': { schema: BookingResponseSchema } },
    },
    400: {
      description: 'Validation or overlapping error',
      content: { 'application/json': { schema: ValidationErrorResponseSchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: makeMessageResponseSchema('Invalid credentials') } },
    },
    404: {
      description: 'Room not found',
      content: { 'application/json': { schema: makeMessageResponseSchema('Room not found') } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ServerErrorResponseSchema } },
    },
  },
});
router.post('/:roomId/confirm', protect(), createBooking);

export default router;
