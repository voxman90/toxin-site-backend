import { Response } from 'express';

import type { AuthorizedRequest } from '../../@types/express.js';
import Review from '../../models/Review.js';

const toggleLike = async (req: AuthorizedRequest, res: Response) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const isLiked = review.likes.some(id => id.equals(userId));

    if (isLiked) {
      review.likes = review.likes.filter(id => !id.equals(userId));
    } else {
      if (userId) review.likes.push(userId);
    }

    res.status(200).json({
      likeCount: review.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  toggleLike,
};
