import type { Role } from '../@types/data.js';

export const FALLBACK_PORT = 5000;

export const DEFAULT_ROOMS_LIMIT = 12;
export const DEFAULT_ROOMS_SORT_ORDER = { price: 1 } as const;
export const DEFAULT_REVIEWS_LIMIT = 12;

export const ADDITIONAL_SERVICES = [
  'dinner',
  'desk',
  'highchair',
  'crib',
  'TV',
  'shampoo',
] as const;

export const ACCESSIBILITY = [
  'wideCorridor',
  'assistant',
] as const;

export const RULES = [
  'smokeAllowed',
  'petsAllowed',
  'guestsAllowed',
] as const;

export const ROLES: {[key in Role]: key } = {
  user: 'user',
  admin: 'admin',
};

export const ROOM_IMGS: string[] = Array.from({ length: 9 }).map((_, i) => `room${i + 1}.jpg`);

export const PSW_SALT_ROUNDS = 12;
