import type { AggregatePaginateModel } from 'mongoose';
import { Model, Schema, Types, model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface IRating {
  user: Types.ObjectId;
  room: Types.ObjectId;
  score: number;
}

export type RatingModel = Model<IRating, {}, {}>;

const ratingSchema = new Schema<IRating, RatingModel>({
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
  score: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: '{VALUE} is not an integer score',
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

ratingSchema.plugin(mongooseAggregatePaginate);
ratingSchema.index({ user: 1, room: 1 }, { unique: true });

const Rating = model<IRating, AggregatePaginateModel<IRating>>('Rating', ratingSchema);

export default Rating;
