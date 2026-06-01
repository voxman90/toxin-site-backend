import { Router } from 'express';

import auth from './auth.routes.js';
import booking from './booking.routes.js';
import rating from './rating.routes.js';
import review from './review.routes.js';
import room from './room.routes.js';
import user from './user.routes.js';

const router = Router();

router.use('/auth', auth);
router.use('/bookings', booking);
router.use('/reviews', review);
router.use('/ratings', rating);
router.use('/users', user);
router.use('/rooms', room);

export default router;
