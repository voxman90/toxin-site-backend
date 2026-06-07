import { Response } from 'express';
import mongoose, { Types } from 'mongoose';

import type { AuthorizedRequest } from '../../@types/express.js';
import type {
  CreateRatingResponseDTO,
  GetRatingSummaryResponseDTO,
  RatingAggregationResult,
  ScoreBreakdownItem,
} from '../../@types/rating.js';
import Rating from '../../models/Rating.js';
import Room from '../../models/Room.js';
import { createRatingSchema, getRatingSummarySchema } from '../../schemas/rating.schema.js';
import { handleControllerError } from '../../utils/handleError.js';

export const createRating = async (req: AuthorizedRequest, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const { params, body } = await createRatingSchema.parseAsync({
      params: req.params,
      body: req.body,
    });
    const { roomId } = params;
    const { score } = body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await session.withTransaction(async () => {
      await Rating.findOneAndUpdate(
        {
          user: userId,
          room: roomId,
        },
        { $set: { score } },
        {
          upsert: true,
          session,
          returnDocument: 'after',
          runValidators: true,
        },
      );

      const stats = await Rating.aggregate([
        { $match: { room: new Types.ObjectId(roomId) } },
        {
          $group: {
            _id: null,
            avgScore: { $avg: '$score' },
            totalCount: { $sum: 1 },
          },
        },
      ]).session(session);

      const { avgScore } = stats[0] || { avgScore: 0 };
      const safeAvgScore = avgScore ?? 0;

      await Room.findByIdAndUpdate(
        roomId,
        {
          avgRating: Number(safeAvgScore.toFixed(1)),
        },
        { session },
      );
    });

    const responseData: CreateRatingResponseDTO = { message: 'Rating saved successfully' };

    res.status(201).json(responseData);
  } catch (error) {
    handleControllerError(error, res);
  } finally {
    session.endSession();
  }
};

export const getRatingSummary = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { params } = await getRatingSummarySchema.parseAsync({ params: req.params });
    const { roomId } = params;

    const [stats] = await Rating.aggregate<RatingAggregationResult>([
      { $match: { room: new Types.ObjectId(roomId) } },
      {
        $facet: {
          scoreBreakdown: [
            { $group: { _id: '$score', count: { $sum: 1 } } },
            { $sort: { _id: -1 } },
          ],
          summary: [
            {
              $group: {
                _id: null,
                totalCount: { $sum: 1 },
                avgScore: { $avg: '$score' },
              },
            },
          ],
        },
      },
    ]);

    if (!stats || stats.summary?.length === 0) {
      return res.status(200).json({
        totalCount: 0,
        avgScore: 0,
        scoreBreakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      });
    }

    const formattedBreakdown = stats.scoreBreakdown.reduce(
      (acc: Record<string, number>, item: ScoreBreakdownItem) => {
        acc[item._id] = item.count;

        return acc;
      },
      {},
    );

    const responseData: GetRatingSummaryResponseDTO = {
      totalCount: stats.summary[0]?.totalCount ?? 0,
      avgScore: Number(stats.summary[0]?.avgScore?.toFixed(1) ?? 0),
      scoreBreakdown: formattedBreakdown,
    };

    res.status(200).json(responseData);
  } catch (error) {
    handleControllerError(error, res);
  }
};
