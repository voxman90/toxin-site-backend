import { Model, Schema, Types, model } from 'mongoose';

import type { AdditionalService, Guest } from '../@types/data.js';
import { ADDITIONAL_SERVICES } from '../constants/constants.js';

export interface BookingPriceSummary {
  nights: number;
  discount: number;
  pricePerNight: number;
  basePrice: number;
  servicePrice: number;
  additionalServicePrice: number;
  additionalServiceSummary: Record<AdditionalService, number>;
  totalPrice: number;
}

export interface IBooking {
  user: Types.ObjectId;
  room: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: Partial<Record<Guest, number>>;
  additionalServices: AdditionalService[];
  priceSummary: BookingPriceSummary;
}

export interface ILeanBooking extends IBooking {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingModel extends Model<IBooking> {
  calculateNights(checkIn: Date, checkOut: Date): number;
  calculateTotalPrice(args: {
    pricePerNight: number;
    nights: number;
    servicePrice: number;
    additionalServicePrice: number;
    discount: number;
  }): {
    basePrice: number;
    totalPrice: number;
    discount: number;
  };
}

const bookingSchema = new Schema<IBooking, BookingModel>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    room: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: {
        adult: {
          type: Number,
          default: 0,
        },
        child: {
          type: Number,
          default: 0,
        },
        baby: {
          type: Number,
          default: 0,
        },
      },
      required: true,
      validate: {
        validator: function (v) {
          return v.adult + v.child > 0;
        },
        message: 'There must be at least one guest',
      },
    },
    priceSummary: {
      nights: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        required: true,
      },
      pricePerNight: {
        type: Number,
        required: true,
      },
      basePrice: {
        type: Number,
        required: true,
      },
      servicePrice: {
        type: Number,
        required: true,
      },
      additionalServicePrice: {
        type: Number,
        required: true,
      },
      additionalServiceSummary: {
        type: Map,
        of: Number,
        validate: {
          validator: (v: Map<string, number>) => {
            return Array.from(v.keys()).every((key) =>
              ADDITIONAL_SERVICES.includes(key as AdditionalService),
            );
          },
          message: 'Invalid service name',
        },
      },
      totalPrice: {
        type: Number,
        required: true,
      },
    },
    additionalServices: {
      type: [String],
      enum: ADDITIONAL_SERVICES,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

bookingSchema.statics.calculateTotalPrice = function ({
  pricePerNight,
  nights,
  additionalServicePrice,
  servicePrice,
  discount,
}) {
  const basePrice = pricePerNight * nights;
  const calculatedDiscount = basePrice * discount;
  const totalPrice = basePrice - calculatedDiscount + servicePrice + additionalServicePrice;

  return {
    discount: calculatedDiscount,
    basePrice,
    totalPrice,
  };
};

bookingSchema.statics.calculateNights = function (checkIn: Date, checkOut: Date) {
  const fromMs = checkIn.getTime();
  const toMs = checkOut.getTime();

  if (fromMs >= toMs) return 1;

  const diffMs = Math.abs(toMs - fromMs);
  const msInDay = 24 * 60 * 60 * 1000;

  return Math.ceil(diffMs / msInDay);
};

const Booking = model<IBooking, BookingModel>('Booking', bookingSchema);

export default Booking;
