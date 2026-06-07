import { z } from '../config/zod.js';
import { MONGO_ID_MOCK, MONGO_ID_REGEX } from '../constants/constants.js';

const capitalize = (str: string) => `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`;

export const ensureISODate = (name: string) =>
  z
    .string({ message: `${capitalize(name)} date is required` })
    .endsWith('Z', { message: `${capitalize(name)} date must be a UTC ISO string (ending with Z)` })
    .openapi({
      type: 'string',
      format: 'date-time',
      example: '2026-06-06T12:00:00.000Z',
    })
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), { message: `Invalid ${name} date` });

export const ensureObjectId = (name: string) =>
  z
    .string({ message: `${capitalize(name)} is required` })
    .regex(MONGO_ID_REGEX, { message: `Invalid ${capitalize(name)} format` })
    .openapi({
      type: 'string',
      description: 'MongoDB ObjectId hex string',
      example: MONGO_ID_MOCK,
    });

export const ValidationErrorResponseSchema = z
  .object({
    message: z.string().openapi({ example: 'Bad request' }),
    status: z.string().openapi({ example: 'fail' }),
    errors: z.array(
      z.object({
        field: z.string().openapi({ example: 'checkOut' }),
        message: z.string().openapi({ example: 'Check-out date must be after check-in date' }),
      }),
    ),
  })
  .openapi('ValidationErrorResponse');

export const makeMessageResponseSchema = (exampleText: string) =>
  z
    .object({
      message: z.string().openapi({ example: exampleText }),
    })
    .openapi('BaseMessageResponse');

export const makePaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
  name: string,
) => {
  return z
    .object({
      docs: z.array(itemSchema),
      totalDocs: z.number().openapi({ example: 42 }),
      limit: z.number().openapi({ example: 10 }),
      page: z.number().openapi({ example: 1 }),
      totalPages: z.number().openapi({ example: 5 }),
      pagingCounter: z.number().openapi({ example: 1 }),
      hasPrevPage: z.boolean(),
      hasNextPage: z.boolean(),
      prevPage: z.number().nullable(),
      nextPage: z.number().nullable(),
    })
    .openapi(name);
};

export const ServerErrorResponseSchema = makeMessageResponseSchema('Internal server error');

export const UnauthorizedResponseSchema = makeMessageResponseSchema('Unauthorized');
