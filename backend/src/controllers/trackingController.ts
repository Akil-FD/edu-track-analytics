import { Request, Response } from 'express';
import { Analytics } from '../models/Analytics';
import { catchAsync, AppError, sendSuccess } from '../utils/helpers';
import {
  AuthenticatedRequest,
  TrackingBody,
} from '../types';

// ─── Tracking Controller ──────────────────────────────────────────────────────

export const logTracking = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { articleId, duration = 0 } = req.body as TrackingBody;
  const studentId = (req as AuthenticatedRequest).user._id;

  if (!articleId) throw new AppError('articleId is required.', 400);

  const record = await Analytics.findOneAndUpdate(
    { articleId, studentId },
    {
      $inc: { views: 1, duration },
      $set: { lastRead: new Date() },
    },
    { upsert: true, new: true }
  );

  sendSuccess(res, { record });
});

