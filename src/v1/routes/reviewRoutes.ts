import { Router } from 'express';

import { protect } from '../../middlewares/authMiddleware.js';
import { toggleLike } from '../controllers/likeController.js';
import { createReview, getReviewsByRoomId } from '../controllers/reviewController.js';

const router = Router();

router.post('/', protect(), createReview);
router.get('/:roomId', protect(true), getReviewsByRoomId);
router.put('/:reviewId/like', protect(), toggleLike);

export default router;
