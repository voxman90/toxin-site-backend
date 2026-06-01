import z from 'zod';

import { MONGO_ID_REGEX } from '../constants/constants.js';

const Capitalize = (str: string) => `${str.slice(0, 1).toUpperCase()}${str.slice(1)}`;

export const ensureISODate = (name: string) =>
  z
    .string({ message: `${Capitalize(name)} date is required` })
    .endsWith('Z', { message: `${Capitalize(name)} date must be a UTC ISO string (ending with Z)` })
    .transform((val) => new Date(val))
    .refine((date) => !isNaN(date.getTime()), { message: `Invalid ${name} date` });

export const ensureObjectId = (name: string) =>
  z
    .string({ message: `${Capitalize(name)} is required` })
    .regex(MONGO_ID_REGEX, { message: `Invalid ${Capitalize(name)} format` });

export const ensureArray = z.preprocess((val) => {
  if (val === undefined || val === null) return [];

  return Array.isArray(val) ? val : [val];
}, z.array(z.string()));
