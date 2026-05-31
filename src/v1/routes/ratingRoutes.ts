import { Router } from 'express';

import { protect } from '../../middlewares/authMiddleware.js';
import { createRating, getRatingSummary } from '../controllers/ratingController.js';

const router = Router();

router.post('/:roomId/', protect(), createRating);
router.get('/:roomId', getRatingSummary);

export default router;
