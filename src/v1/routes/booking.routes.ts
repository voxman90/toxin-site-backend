import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware.js';
import { createBooking, getBookingPreview } from '../controllers/booking.controller.js';

const router = Router();

router.post('/:roomId/preview', getBookingPreview);
router.post('/:roomId/confirm', protect(), createBooking);

export default router;
