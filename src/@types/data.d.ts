import { ACCESSIBILITY, ADDITIONAL_SERVICES, RULES } from '../constants/constants.js';

export type Rule = (typeof RULES)[number];

export type Accessibility = (typeof ACCESSIBILITY)[number];

export type AdditionalService = (typeof ADDITIONAL_SERVICES)[number];

export type Role = 'user' | 'admin';

export type Guest = 'adult' | 'child' | 'baby';

export interface BookingPreview {
  nights: number;
  discount: number;
  pricePerNight: number;
  basePrice: number;
  servicePrice: number;
  additionalServicePrice: number;
  additionalServiceSummary: Partial<Record<AdditionalService, number>>;
  totalPrice: number;
}
