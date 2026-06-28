import express from 'express';
import { createEvent, getMyEvents, sendGroupInvite, getReceivedInvites, respondToInvite } from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createEvent);
router.get('/', protect, getMyEvents);
router.get('/invitations', protect, getReceivedInvites);
router.put('/invitations/:id', protect, respondToInvite);
router.post('/:id/invite', protect, sendGroupInvite);

export default router;