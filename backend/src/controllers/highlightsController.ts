import { Request, Response } from 'express';
import { catchAsync, AppError, sendSuccess } from '../utils/helpers';
import {
  AuthenticatedRequest,
  CreateHighlightBody,
} from '../types';
import { Highlight } from '../models/Highlights';


export const createHighlight = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { articleId, text, note } = req.body as CreateHighlightBody;
  const studentId = (req as AuthenticatedRequest).user._id;

  if (!articleId || !text) {
    throw new AppError('articleId and text are required.', 400);
  }

  const highlight = await Highlight.create({
    studentId,
    articleId,
    text,
    note: note ?? '',
  });

  sendSuccess(res, { highlight }, 201);
});

export const getHighlightsByArticle = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user._id;
    const { articleId } = req.params;

    const highlights = await Highlight.find({ studentId, articleId }).sort({ createdAt: -1 });

    sendSuccess(res, { highlights });
  }
);

export const getAllHighlights = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const studentId = (req as AuthenticatedRequest).user._id;

  const highlights = await Highlight.find({ studentId })
    .populate('articleId', 'title category')
    .sort({ createdAt: -1 });

  sendSuccess(res, { highlights });
});

export const deleteHighlight = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const studentId = (req as AuthenticatedRequest).user._id;

  const highlight = await Highlight.findOneAndDelete({
    _id: req.params.id,
    studentId,
  });

  if (!highlight) throw new AppError('Highlight not found.', 404);

  sendSuccess(res, null, 200, 'Highlight deleted.');
});
