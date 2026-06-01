import type { AggregatePaginateModel } from 'mongoose';
import { Model, Schema, model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

import type { Accessibility, Rule } from '../@types/data.js';
import { ACCESSIBILITY, RULES } from '../constants/constants.js';

export interface IRoom {
  roomNumber: number;
  isLuxe: boolean;
  price: number;
  capacity: number;
  accessibility: Accessibility[];
  rules: Rule[];
  bedroom: number;
  bed: number;
  bathroom: number;
  isAvailable: boolean;
  images: string[];
  avgRating: number;
  reviewsCount: number;
}

type RoomModel = Model<IRoom>;

const roomSchema = new Schema<IRoom, RoomModel>(
  {
    roomNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    isLuxe: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
    },
    accessibility: {
      type: [String],
      enum: ACCESSIBILITY,
    },
    rules: {
      type: [String],
      enum: RULES,
    },
    bedroom: {
      type: Number,
      required: true,
      min: 0,
    },
    bed: {
      type: Number,
      required: true,
      min: 0,
    },
    bathroom: {
      type: Number,
      required: true,
      min: 0,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    images: [String],
    avgRating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

roomSchema.virtual('allReviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'room',
});

roomSchema.plugin(mongooseAggregatePaginate);

const Room = model<IRoom, AggregatePaginateModel<IRoom>>('Room', roomSchema);

export default Room;
