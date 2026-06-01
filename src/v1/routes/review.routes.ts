import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware.js';
import { toggleLike } from '../controllers/like.controller.js';
import { createReview, getRoomReviews } from '../controllers/review.controller.js';

const router = Router();

router.post('/', protect(), createReview);
router.get('/:roomId', protect(true), getRoomReviews);
router.put('/:reviewId/toggle-like', protect(), toggleLike);

export default router;
