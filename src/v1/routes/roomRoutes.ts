import { Router } from 'express';

import { getRoomById, searchRooms } from '../controllers/roomController.js';

const router = Router();

router.get('/search', searchRooms);
router.get('/:id', getRoomById);

export default router;
