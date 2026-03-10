import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Analytics } from '../models/Analytics';
import { Article } from '../models/Article';
import { catchAsync, sendSuccess } from '../utils/helpers';
import { AuthenticatedRequest, AnalyticsResponse, StudentAnalyticsData, AnalyticsQueryParams } from '../types';

const THIRTY_DAYS_AGO = (): Date => {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d;
};

// ─── Teacher Analytics ────────────────────────────────────────────────────────

export const getTeacherAnalytics = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const teacherId = (req as AuthenticatedRequest).user._id;
    const { category, search, page = '1', limit = '5' } = req.query as AnalyticsQueryParams;

    const articleFilter: any = { createdBy: teacherId };

    if (category) {
      articleFilter.category = category;
    }

    if (search) {
      articleFilter.title = { $regex: search, $options: 'i' };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const teacherArticles = await Article.find(articleFilter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1, _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('_id title category');

    const articleIds = teacherArticles.map(a => a._id);

    const [viewsPerArticle, categoryStats, studentWiseEngagement, dailyEngagement, uniqueStudentIds] =
      await Promise.all([
        // Views per article with unique students (with pagination)
        Analytics.aggregate([
          { $match: { articleId: { $in: articleIds } } },
          {
            $group: {
              _id: '$articleId',
              totalViews: { $sum: '$views' },
              totalDuration: { $sum: "$duration" },
              uniqueStudents: { $addToSet: '$studentId' },
            },
          },
          {
            $lookup: {
              from: 'articles',
              localField: '_id',
              foreignField: '_id',
              as: 'article',
            },
          },
          { $unwind: '$article' },
          {
            $project: {
              title: '$article.title',
              category: '$article.category',
              totalViews: 1,
              totalDuration: 1,
              uniqueStudents: { $size: '$uniqueStudents' },
            },
          },
          { $sort: { totalViews: -1 } },
          // { $skip: skip },
          // { $limit: limitNum },
        ]),

        // Category breakdown
        Analytics.aggregate([
          { $match: { articleId: { $in: articleIds } } },
          {
            $lookup: {
              from: 'articles',
              localField: 'articleId',
              foreignField: '_id',
              as: 'article',
            },
          },
          { $unwind: '$article' },
          {
            $group: {
              _id: '$article.category',
              totalViews: { $sum: '$views' },
              totalDuration: { $sum: '$duration' },
            },
          },
          { $sort: { totalViews: -1 } },
        ]),

        // Student wise engagement
        Analytics.aggregate([
          {
            $match: {
              articleId: { $in: articleIds }
            }
          },
          {
            $group: {
              _id: "$studentId",
              totalRead: { $sum: 1 },
              totalViews: { $sum: "$views" },
              totalDuration: { $sum: "$duration" }
            }
          },
          {
            $lookup: {
              from: "users",              
              localField: "_id",
              foreignField: "_id",    
              as: "user"
            }
          },
          {
            $unwind: {
              path: "$user",
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $project: {
              _id: 1,
              name: "$user.name",
              totalRead: 1,
              totalViews: 1,
              totalDuration: 1
            }
          },
          {
            $sort: { totalDuration: -1 }
          }
        ]),

        // Daily engagement — last 30 days
        Analytics.aggregate([
          {
            $match: {
              articleId: { $in: articleIds },
              lastRead: { $gte: THIRTY_DAYS_AGO() },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$lastRead' } },
              views: { $sum: '$views' },
              totalDuration: { $sum: "$duration" },
              students: { $addToSet: '$studentId' },
            },
          },
          { $sort: { _id: 1 } },
          {
            $project: {
              date: '$_id',
              views: 1,
              totalDuration: 1,
              studentCount: { $size: '$students' },
            },
          },
        ]),

        // Unique students across all articles
        Analytics.distinct('studentId', { articleId: { $in: articleIds } }),
      ]);

    // Get total count for pagination
    const totalArticles = teacherArticles.length;
    console.log(categoryStats);

    const analyticsData: AnalyticsResponse = {
      kpis: {
        articlesCreated: totalArticles,
        totalStudentsRead: (uniqueStudentIds as Types.ObjectId[]).length,
        top3Categories: categoryStats.slice(0, 3),
      },
      viewsPerArticle,
      studentWiseEngagement,
      dailyEngagement,
      pagination: {
        total: totalArticles,
        page: pageNum,
        pages: Math.ceil(totalArticles / limitNum),
      },
    };

    sendSuccess(res, analyticsData);
  }
);

// ─── Student Analytics ────────────────────────────────────────────────────────

export const getStudentAnalytics = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const studentId = (req as AuthenticatedRequest).user._id;
    const { category, search, page = '1', limit = '5' } = req.query as AnalyticsQueryParams;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build filter for articles
    const articleFilter: any = {};
    if (category && category !== 'All') {
      articleFilter.category = category;
    }
    if (search) {
      articleFilter.title = { $regex: search, $options: 'i' };
    }

    // Get article IDs that match the filter (for this student's read history)
    const matchingArticles = await Article.find(articleFilter).select('_id');
    const matchingArticleIds = matchingArticles.map(a => a._id);

    // Get student's read articles that match the filter
    const readArticlesQuery = {
      studentId,
      ...(matchingArticleIds.length > 0 ? { articleId: { $in: matchingArticleIds } } : {}),
    };

    const [readArticles, totalReadArticles] = await Promise.all([
      Analytics.find(readArticlesQuery)
        .populate({
          path: 'articleId',
          select: 'title category summary',
          populate: { path: 'createdBy', select: 'name' },
        })
        .sort({ lastRead: -1 })
        .skip(skip)
        .limit(limitNum),

      Analytics.countDocuments(readArticlesQuery),
    ]);

    // Time per category (with filter applied)
    const timePerCategory = await Analytics.aggregate([
      { $match: readArticlesQuery },
      {
        $lookup: {
          from: 'articles',
          localField: 'articleId',
          foreignField: '_id',
          as: 'article',
        },
      },
      { $unwind: '$article' },
      // Apply category filter at aggregation level
      ...(category && category !== 'All' ? [{ $match: { 'article.category': category } }] : []),
      {
        $group: {
          _id: '$article.category',
          totalDuration: { $sum: '$duration' },
          articleCount: { $sum: 1 },
        },
      },
      { $sort: { totalDuration: -1 } },
    ]);

    // Total stats (with filter applied)
    const totalStats = await Analytics.aggregate([
      { $match: readArticlesQuery },
      ...(category && category !== 'All'
        ? [
          {
            $lookup: {
              from: 'articles',
              localField: 'articleId',
              foreignField: '_id',
              as: 'article',
            },
          },
          { $unwind: '$article' },
          { $match: { 'article.category': category } },
        ]
        : []),
      {
        $group: {
          _id: null,
          totalArticlesRead: { $sum: 1 },
          totalReadingTime: { $sum: '$duration' },
          totalViews: { $sum: '$views' },
        },
      },
    ]);

    const data: StudentAnalyticsData = {
      readArticles,
      timePerCategory,
      stats: totalStats[0] ?? {
        totalArticlesRead: 0,
        totalReadingTime: 0,
        totalViews: 0,
      },
      pagination: {
        total: totalReadArticles,
        page: pageNum,
        pages: Math.ceil(totalReadArticles / limitNum),
      },
    };

    sendSuccess(res, data);
  }
);
