import express from 'express';
import { createEvent, getMyEvents } from '../controllers/eventController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mount the protect guard directly onto the route endpoint base
router.route('/')
  .post(protect, createEvent)
  .get(protect, getMyEvents);

export default router;