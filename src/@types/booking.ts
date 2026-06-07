import type z from '../config/zod.js';
import { BookingSchema, PriceSummarySchema } from '../schemas/booking.schema.js';

export type PriceSummaryDTO = z.infer<typeof PriceSummarySchema>;

export type BookingDTO = z.infer<typeof BookingSchema>;

export type CreateBookingResponseDTO = BookingDTO;

export type GetPriceSummaryDTO = PriceSummaryDTO;
