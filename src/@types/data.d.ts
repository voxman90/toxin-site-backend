import { ADDITIONAL_SERVICES, RULES, ACCESSIBILITY } from '../constants/constants.js';

export type Rule = typeof RULES[number];

export type Accessibility = typeof ACCESSIBILITY[number];

export type AdditionalService = typeof ADDITIONAL_SERVICES[number];

export type Role = 'user' | 'admin';
