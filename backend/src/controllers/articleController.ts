import { Request, Response } from 'express';
import { Article } from '../models/Article';
import { catchAsync, AppError, sendSuccess } from '../utils/helpers';
import {
  AuthenticatedRequest,
  ArticleQueryParams,
  CreateArticleBody,
  UpdateArticleBody,
  IContentBlock,
  UserRole,
} from '../types';

const parseJSON = <T>(value: string | T): T => {
  if (typeof value === 'string') {
    return JSON.parse(value) as T;
  }
  return value;
};

// ─── Get All Articles ─────────────────────────────────────────────────────────

export const getArticles = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const { category, search, page = '1', limit = '5' } = req.query as ArticleQueryParams;

  const query: Record<string, unknown> = { isPublished: true };

  if (category && category !== 'All') query.category = category;
  if (search) query.title = { $regex: search, $options: 'i' };
  if (authReq.user.role === UserRole.TEACHER) query.createdBy = authReq.user._id;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [articles, total] = await Promise.all([
    Article.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limitNum),
    Article.countDocuments(query),
  ]);

  sendSuccess(res, { articles, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});

// ─── Get Single Article ───────────────────────────────────────────────────────

export const getArticle = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const article = await Article.findById(req.params.id).populate('createdBy', 'name email');

  if (!article) throw new AppError('Article not found.', 404);

  sendSuccess(res, { article });
});

// ─── Create Article ───────────────────────────────────────────────────────────

export const createArticle = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const { title, category, contentBlocks } = req.body as CreateArticleBody;

  if (!title || !category) {
    throw new AppError('Title and category are required.', 400);
  }

  const parsedBlocks: IContentBlock[] = contentBlocks
    ? parseJSON<IContentBlock[]>(contentBlocks)
    : [];

  // Attach uploaded file URLs to blocks
  const files = req.files as Express.Multer.File[] | undefined;
  if (files?.length) {
    files.forEach((file, index) => {
      if (parsedBlocks[index]) {
        const folder = file.destination.split('/')[1];
        parsedBlocks[index].fileUrl = `/uploads/${folder}/${file.filename}`;
      }
    });
  }

  const article = await Article.create({
    title,
    category,
    contentBlocks: parsedBlocks,
    createdBy: authReq.user._id,
  });

  await article.populate('createdBy', 'name email');

  sendSuccess(res, { article }, 201, 'Article created successfully');
});

// ─── Update Article ───────────────────────────────────────────────────────────

export const updateArticle = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const article = await Article.findById(req.params.id);

  if (!article) throw new AppError('Article not found.', 404);

  if (article.createdBy.toString() !== authReq.user._id.toString()) {
    throw new AppError('Not authorized to edit this article.', 403);
  }

  const { title, category, contentBlocks } =
    req.body as UpdateArticleBody;

  const parsedBlocks = contentBlocks
    ? parseJSON<IContentBlock[]>(contentBlocks)
    : article.contentBlocks;

  const updated = await Article.findByIdAndUpdate(
    req.params.id,
    {
      ...(title && { title }),
      ...(category && { category }),
      contentBlocks: parsedBlocks,
    },
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');

  sendSuccess(res, { article: updated }, 200, 'Article updated');
});

// ─── Delete Article ───────────────────────────────────────────────────────────

export const deleteArticle = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const article = await Article.findById(req.params.id);

  if (!article) throw new AppError('Article not found.', 404);

  if (article.createdBy.toString() !== authReq.user._id.toString()) {
    throw new AppError('Not authorized to delete this article.', 403);
  }

  await article.deleteOne();
  sendSuccess(res, null, 200, 'Article deleted successfully');
});
