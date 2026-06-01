import type { Role } from '../@types/data.js';

export const FALLBACK_PORT = 5000;

export const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const MIN_PASSWORD_LENGTH = 6;

export const ROLES: { [key in Role]: key } = {
  user: 'user',
  admin: 'admin',
};

export const DEFAULT_ROOMS_LIMIT = 12;
export const DEFAULT_ROOMS_SORT = 'createAt';
export const DEFAULT_ROOMS_ORDER = 1;

export const DEFAULT_REVIEWS_LIMIT = 10;
export const DEFAULT_REVIEWS_SORT = 'createAt';
export const DEFAULT_REVIEWS_ORDER = 1;

export const ALLOWED_REVIEWS_SORT_FIELDS = ['text', 'likes', 'createAt'] as const;

export const ALLOWED_SORT_FIELDS = [
  'price',
  'roomNumber',
  'avgRating',
  'reviewsCount',
  'createAt',
] as const;

export const ADDITIONAL_SERVICES = [
  'dinner',
  'desk',
  'highchair',
  'crib',
  'TV',
  'shampoo',
] as const;

export const ACCESSIBILITY = ['wideCorridor', 'assistant'] as const;
export const RULES = ['smokeAllowed', 'petsAllowed', 'guestsAllowed'] as const;

export const ROOM_IMGS: string[] = Array.from({ length: 9 }).map((_, i) => `room${i + 1}.jpg`);

export const MIN_RATING_SCORE = 1;
export const MAX_RATING_SCORE = 5;
