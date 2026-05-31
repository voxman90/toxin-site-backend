import { Router } from 'express';

import { protect } from '../../middlewares/authMiddleware.js';
import { getMyProfile, getUserById } from '../controllers/userController.js';

const router = Router();

router.get('/me', protect(), getMyProfile);
router.get('/:id', getUserById);

export default router;
