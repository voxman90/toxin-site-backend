import { Request, Response } from 'express';
import mongoose, { Types } from 'mongoose';

import type { AuthorizedRequest } from '../../@types/express.js';
import Rating from '../../models/Rating.js';
import Room from '../../models/Room.js';

const createRating = async (req: AuthorizedRequest, res: Response) => {
  const session = await mongoose.startSession();

  try {
    const { roomId } = req.params;
    const { score } = req.body;
    const userId = req.user?._id;

    await session.withTransaction(async () => {
      await Rating.create([{
        score: Number(score),
        user: userId,
        room: roomId,
      }], { session });

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

      await Room.findByIdAndUpdate(roomId, {
        avgRating: Number(avgScore.toFixed(1)),
      }, { session });
    });

    res.status(201).json({ message: 'Rating created successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};

const getRatingSummary = async (req: Request<{ roomId: string }>, res: Response) => {
  try {
    const { roomId } = req.params;

    const [stats] = await Rating.aggregate([
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

    if (!stats || stats.summary.length === 0) {
      return res.status(200).json({
        totalCount: 0,
        avgScore: 0,
        scoreBreakdown: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 },
      });
    }

    const formattedBreakdown = stats.scoreBreakdown.reduce(
      (acc: Record<string, number>, item: Record<string, number>) => {
        acc[item._id] = item.count;
        return acc;
      },
      {}
    );

    res.status(200).json({
      totalCount: stats.summary[0].totalCount,
      avgScore: Number(stats.summary[0].avgScore.toFixed(1)),
      scoreBreakdown: formattedBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  createRating,
  getRatingSummary,
};
