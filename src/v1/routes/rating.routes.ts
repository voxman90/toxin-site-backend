import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware.js';
import { createRating, getRatingSummary } from '../controllers/rating.controller.js';

const router = Router();

router.post('/:roomId', protect(), createRating);
router.get('/:roomId', getRatingSummary);

export default router;
