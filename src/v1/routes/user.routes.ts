import { Router } from 'express';

import { protect } from '../../middlewares/auth.middleware.js';
import { getMyProfile, getUserById } from '../controllers/user.controller.js';

const router = Router();

router.get('/me', protect(), getMyProfile);
router.get('/:id', getUserById);

export default router;
