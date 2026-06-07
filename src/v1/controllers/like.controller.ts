import { Response } from 'express';

import type { AuthorizedRequest } from '../../@types/express.js';
import type { ToggleLikeResponseDTO } from '../../@types/review.js';
import Review from '../../models/Review.js';
import { toggleLikeSchema } from '../../schemas/review.schema.js';
import { handleControllerError } from '../../utils/handleError.js';

export const toggleLike = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { params } = await toggleLikeSchema.parseAsync({ params: req.params });
    const { reviewId } = params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const existingReview = await Review.findById(reviewId).select('user');

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    if (existingReview.user.equals(userId)) {
      return res.status(400).json({ message: 'You cannot like your own review' });
    }

    const review = await Review.findOneAndUpdate(
      { _id: reviewId },
      [
        {
          $set: {
            likes: {
              $cond: [
                { $in: [userId, '$likes'] },
                { $setDifference: ['$likes', [userId]] },
                { $concatArrays: ['$likes', [userId]] },
              ],
            },
          },
        },
      ],
      {
        returnDocument: 'after',
        updatePipeline: true,
      },
    );

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const isLiked = review.likes.some((id) => id.equals(userId));

    const responseData: ToggleLikeResponseDTO = {
      likeCount: review.likes.length,
      isLiked,
    };

    res.status(200).json(responseData);
  } catch (error) {
    handleControllerError(error, res);
  }
};
