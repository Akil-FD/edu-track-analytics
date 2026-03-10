import { Router } from 'express';
import { logTracking } from '../controllers/trackingController';
import { protect, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import { highlightRouter } from './highlights';

// ─── Tracking ─────────────────────────────────────────────────────────────────
export const trackingRouter = Router();
trackingRouter.use(protect, authorize(UserRole.STUDENT));
trackingRouter.post('/', logTracking);

export { highlightRouter };
