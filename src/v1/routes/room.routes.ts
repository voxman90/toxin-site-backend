import { Router } from 'express';

import { getRoomById, searchRooms } from '../controllers/room.controller.js';

const router = Router();

router.get('/search', searchRooms);
router.get('/:id', getRoomById);

export default router;
