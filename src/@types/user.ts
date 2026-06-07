import type z from '../config/zod.js';
import { LoginResponseSchema, RegisterResponseSchema, UserSchema } from '../schemas/user.schema.js';

export type UserDTO = z.infer<typeof UserSchema>;

export type GetUserResponseDTO = UserDTO;

export type LoginResponseDTO = z.infer<typeof LoginResponseSchema>;

export type RegisterResponseDTO = z.infer<typeof RegisterResponseSchema>;
