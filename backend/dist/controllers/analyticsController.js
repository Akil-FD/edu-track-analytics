"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentAnalytics = exports.getTeacherAnalytics = void 0;
const Analytics_1 = require("../models/Analytics");
const Article_1 = require("../models/Article");
const helpers_1 = require("../utils/helpers");
const THIRTY_DAYS_AGO = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
};
exports.getTeacherAnalytics = (0, helpers_1.catchAsync)(async (req, res) => {
    const teacherId = req.user._id;
    const { category, search, page = '1', limit = '5' } = req.query;
    const articleFilter = { createdBy: teacherId };
    if (category) {
        articleFilter.category = category;
    }
    if (search) {
        articleFilter.title = { $regex: search, $options: 'i' };
    }
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const teacherArticles = await Article_1.Article.find(articleFilter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('_id title category');
    const articleIds = teacherArticles.map(a => a._id);
    const [viewsPerArticle, categoryStats, studentWiseEngagement, dailyEngagement, uniqueStudentIds] = await Promise.all([
        Analytics_1.Analytics.aggregate([
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
        ]),
        Analytics_1.Analytics.aggregate([
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
        Analytics_1.Analytics.aggregate([
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
        Analytics_1.Analytics.aggregate([
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
        Analytics_1.Analytics.distinct('studentId', { articleId: { $in: articleIds } }),
    ]);
    const totalArticles = teacherArticles.length;
    console.log(categoryStats);
    const analyticsData = {
        kpis: {
            articlesCreated: totalArticles,
            totalStudentsRead: uniqueStudentIds.length,
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
    (0, helpers_1.sendSuccess)(res, analyticsData);
});
exports.getStudentAnalytics = (0, helpers_1.catchAsync)(async (req, res) => {
    const studentId = req.user._id;
    const { category, search, page = '1', limit = '5' } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const articleFilter = {};
    if (category && category !== 'All') {
        articleFilter.category = category;
    }
    if (search) {
        articleFilter.title = { $regex: search, $options: 'i' };
    }
    const matchingArticles = await Article_1.Article.find(articleFilter).select('_id');
    const matchingArticleIds = matchingArticles.map(a => a._id);
    const readArticlesQuery = {
        studentId,
        ...(matchingArticleIds.length > 0 ? { articleId: { $in: matchingArticleIds } } : {}),
    };
    const [readArticles, totalReadArticles] = await Promise.all([
        Analytics_1.Analytics.find(readArticlesQuery)
            .populate({
            path: 'articleId',
            select: 'title category summary',
            populate: { path: 'createdBy', select: 'name' },
        })
            .sort({ lastRead: -1 })
            .skip(skip)
            .limit(limitNum),
        Analytics_1.Analytics.countDocuments(readArticlesQuery),
    ]);
    const timePerCategory = await Analytics_1.Analytics.aggregate([
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
    const totalStats = await Analytics_1.Analytics.aggregate([
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
    const data = {
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
    (0, helpers_1.sendSuccess)(res, data);
});
//# sourceMappingURL=analyticsController.js.map