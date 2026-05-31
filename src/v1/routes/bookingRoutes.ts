import { Router } from 'express';

import { protect } from '../../middlewares/authMiddleware.js';
import { createBooking, getBookingPreview } from '../controllers/bookingController.js';

const router = Router();

router.post('/:roomId/preview', getBookingPreview);
router.post('/:roomId/confirm', protect(), createBooking);

export default router;
