import { Request, Response } from 'express';
import mongoose from 'mongoose';

import type { AuthorizedRequest } from '../../@types/express.js';
import { DEFAULT_REVIEWS_LIMIT } from '../../constants/constants.js';
import Review from '../../models/Review.js';
import Room from '../../models/Room.js';

const createReview = async (req: AuthorizedRequest, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const { text, roomId } = req.body;
    const userId = req.user?._id;

    await session.withTransaction(async () => {
      await Review.create([{
        room: roomId,
        user: userId,
        text,
      }], { session });

      await Room.findByIdAndUpdate(roomId, {
        $inc: { reviewsCount: 1 },
      }, { session });
    });

    res.status(201).json({ message: 'Review created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  } finally {
    session.endSession();
  }
};

const getReviewsByRoomId = async (req: Request<{ roomId: string }>, res: Response) => {
  try {
    const { roomId } = req.params;
    const { page, limit } = req.query;
    const userId = (req as AuthorizedRequest).user?._id;

    const aggregate = Review.aggregate([
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
            $ifNull: [
              { $concat: ['$author.firstName', ' ', '$author.lastName'] },
              'Deleted User',
            ],
          },
          avatarUrl: { $ifNull: ['$author.avatarUrl', null] },
          text: 1,
          createdAt: 1,
          likeCount: { $size: '$likes' },
          isLiked: { $in: [userId, '$likes'] },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    const options = {
      page: Number(page) || 1,
      limit: Number(limit) || DEFAULT_REVIEWS_LIMIT,
    };

    const result = await Review.aggregatePaginate(aggregate, options);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  createReview,
  getReviewsByRoomId,
};
