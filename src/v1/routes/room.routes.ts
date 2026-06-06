import { Router } from 'express';

import {
  PaginatedRoomsResponseSchema,
  RoomItemSchema,
  getRoomByIdSchema,
  searchRoomsSchema,
} from '../../schemas/room.schema.js';
import {
  ServerErrorResponseSchema,
  ValidationErrorResponseSchema,
  makeMessageResponseSchema,
} from '../../schemas/shared.js';
import { documentEndpoint } from '../../utils/contract.js';
import { getRoomById, searchRooms } from '../controllers/room.controller.js';

const router = Router();

documentEndpoint({
  method: 'get',
  path: '/api/rooms/search',
  summary: 'Search for available rooms based on criteria',
  request: {
    query: searchRoomsSchema.shape.query,
  },
  responses: {
    200: {
      description: 'Paginated available rooms list retrieved successfully',
      content: { 'application/json': { schema: PaginatedRoomsResponseSchema } },
    },
    400: {
      description: 'Validation error or incorrect date range',
      content: { 'application/json': { schema: ValidationErrorResponseSchema } },
    },
    500: {
      description: 'Internal server error',
      content: { 'application/json': { schema: ServerErrorResponseSchema } },
    },
  },
});
router.get('/search', searchRooms);

documentEndpoint({
  method: 'get',
  path: '/api/rooms/{id}',
  summary: 'Get room profile details by ID',
  request: {
    params: getRoomByIdSchema.shape.params,
  },
  responses: {
    200: {
      description: 'Room details retrieved successfully',
      content: { 'application/json': { schema: RoomItemSchema } },
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
router.get('/:id', getRoomById);

export default router;
