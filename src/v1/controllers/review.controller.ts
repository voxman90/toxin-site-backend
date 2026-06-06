import { Response } from 'express';
import type { PipelineStage } from 'mongoose';
import mongoose, { Types } from 'mongoose';

import type { AuthorizedRequest } from '../../@types/express.js';
import Review from '../../models/Review.js';
import Room from '../../models/Room.js';
import { createReviewSchema, getRoomReviewsSchema } from '../../schemas/review.schema.js';
import { handleControllerError } from '../../utils/handleError.js';

export const createReview = async (req: AuthorizedRequest, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const { body } = await createReviewSchema.parseAsync({ body: req.body });
    const { text, roomId } = body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await session.withTransaction(async () => {
      await Review.create(
        [
          {
            room: new Types.ObjectId(roomId),
            user: userId,
            text,
          },
        ],
        { session },
      );

      await Room.findByIdAndUpdate(
        roomId,
        {
          $inc: { reviewsCount: 1 },
        },
        { session },
      );
    });

    res.status(201).json({ message: 'Review created successfully' });
  } catch (error) {
    handleControllerError(error, res);
  } finally {
    session.endSession();
  }
};

export const getRoomReviews = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { params, query } = await getRoomReviewsSchema.parseAsync({
      params: req.params,
      query: req.query,
    });
    const { roomId } = params;
    const { page, limit, sort, order } = query;
    const userId = req.user?._id;

    const pipeline: PipelineStage[] = [
      { $match: { room: new mongoose.Types.ObjectId(roomId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          id: '$_id',
          authorName: {
            $ifNull: [{ $concat: ['$author.firstName', ' ', '$author.lastName'] }, 'Deleted User'],
          },
          avatarUrl: { $ifNull: ['$author.avatarUrl', null] },
          text: 1,
          createdAt: 1,
          likeCount: { $size: '$likes' },
          isLiked: { $in: [userId, '$likes'] },
        },
      },
    ];

    if (sort === 'likes') {
      pipeline.push(
        { $addFields: { tempLikeCount: { $size: '$likes' } } },
        { $sort: { [sort]: order } },
        { $project: { tempLikeCount: 0 } },
      );
    } else {
      pipeline.push({
        $sort: { [sort]: order },
      });
    }

    const aggregate = Review.aggregate(pipeline);

    const options = { page, limit };

    const result = await Review.aggregatePaginate(aggregate, options);

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(error, res);
  }
};
