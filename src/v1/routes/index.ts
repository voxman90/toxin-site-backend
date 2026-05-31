import { Router } from 'express';

import authRoutes from './authRoutes.js';
import bookingRoutes from './bookingRoutes.js';
import ratingRoutes from './ratingRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import roomRoutes from './roomRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/booking', bookingRoutes);
router.use('/review', reviewRoutes);
router.use('/rating', ratingRoutes);
router.use('/user', userRoutes);
router.use('/room', roomRoutes);

export default router;
