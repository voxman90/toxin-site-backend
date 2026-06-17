import type { Order, Role } from '../@types/data.js';

export const FALLBACK_PORT = 5000;

export const MONGO_ID_REGEX = /^[0-9a-fA-F]{24}$/;
export const MONGO_ID_MOCK = '5d7a4c2e8b1f6a390e4d2c1b';

export const MIN_PASSWORD_LENGTH = 6;

export const ROLES: { [key in Role]: key } = {
  user: 'user',
  admin: 'admin',
};

export const DEFAULT_ROOMS_LIMIT = 12;
export const DEFAULT_ROOMS_SORT = 'createAt';
export const DEFAULT_ROOMS_ORDER: Order = 1;

export const DEFAULT_REVIEWS_LIMIT = 10;
export const DEFAULT_REVIEWS_SORT = 'createAt';
export const DEFAULT_REVIEWS_ORDER: Order = 1;

export const ALLOWED_REVIEWS_SORT_FIELDS = ['text', 'likes', 'createAt'] as const;

export const ALLOWED_ROOMS_SORT_FIELDS = [
  'price',
  'roomNumber',
  'avgRating',
  'reviewsCount',
  'capacity',
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

export const SCORE = ['1', '2', '3', '4', '5'] as const;

export const ROOM_IMGS: string[] = Array.from({ length: 9 }).map((_, i) => `room${i + 1}.jpg`);

export const MIN_RATING_SCORE = 1;
export const MAX_RATING_SCORE = 5;
