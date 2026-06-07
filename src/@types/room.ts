import type z from '../config/zod.js';
import { PaginatedRoomsSchema, RoomSchema } from '../schemas/room.schema.js';

export type RoomDTO = z.infer<typeof RoomSchema>;

export type PaginatedRoomsDTO = z.infer<typeof PaginatedRoomsSchema>;

export type GetRoomResponseDTO = RoomDTO;

export type SearchRoomsResponseDTO = PaginatedRoomsDTO;
