import type { AggregatePaginateModel } from 'mongoose';
import { Model, Schema, Types, model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

export interface IReview {
  user: Types.ObjectId;
  room: Types.ObjectId;
  text: string;
  likes: Types.ObjectId[];
}

export type ReviewModel = Model<IReview, {}, {}>;

const reviewSchema = new Schema<IReview, ReviewModel>({
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
  text: {
    type: String,
    trim: true,
    default: '',
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

reviewSchema.plugin(mongooseAggregatePaginate);

reviewSchema.index({ user: 1, room: 1 }, { unique: true });

const Review = model<IReview, AggregatePaginateModel<IReview>>('Review', reviewSchema);

export default Review;
