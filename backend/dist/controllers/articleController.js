"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteArticle = exports.updateArticle = exports.createArticle = exports.getArticle = exports.getArticles = void 0;
const Article_1 = require("../models/Article");
const helpers_1 = require("../utils/helpers");
const types_1 = require("../types");
const parseJSON = (value) => {
    if (typeof value === 'string') {
        return JSON.parse(value);
    }
    return value;
};
exports.getArticles = (0, helpers_1.catchAsync)(async (req, res) => {
    const authReq = req;
    const { category, search, page = '1', limit = '5' } = req.query;
    const query = { isPublished: true };
    if (category && category !== 'All')
        query.category = category;
    if (search)
        query.title = { $regex: search, $options: 'i' };
    if (authReq.user.role === types_1.UserRole.TEACHER)
        query.createdBy = authReq.user._id;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const [articles, total] = await Promise.all([
        Article_1.Article.find(query)
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1, _id: -1 })
            .skip(skip)
            .limit(limitNum),
        Article_1.Article.countDocuments(query),
    ]);
    (0, helpers_1.sendSuccess)(res, { articles, pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) } });
});
exports.getArticle = (0, helpers_1.catchAsync)(async (req, res) => {
    const article = await Article_1.Article.findById(req.params.id).populate('createdBy', 'name email');
    if (!article)
        throw new helpers_1.AppError('Article not found.', 404);
    (0, helpers_1.sendSuccess)(res, { article });
});
exports.createArticle = (0, helpers_1.catchAsync)(async (req, res) => {
    const authReq = req;
    const { title, category, contentBlocks } = req.body;
    if (!title || !category) {
        throw new helpers_1.AppError('Title and category are required.', 400);
    }
    const parsedBlocks = contentBlocks
        ? parseJSON(contentBlocks)
        : [];
    const files = req.files;
    if (files?.length) {
        files.forEach((file, index) => {
            if (parsedBlocks[index]) {
                const folder = file.destination.split('/')[1];
                parsedBlocks[index].fileUrl = `/uploads/${folder}/${file.filename}`;
            }
        });
    }
    const article = await Article_1.Article.create({
        title,
        category,
        contentBlocks: parsedBlocks,
        createdBy: authReq.user._id,
    });
    await article.populate('createdBy', 'name email');
    (0, helpers_1.sendSuccess)(res, { article }, 201, 'Article created successfully');
});
exports.updateArticle = (0, helpers_1.catchAsync)(async (req, res) => {
    const authReq = req;
    const article = await Article_1.Article.findById(req.params.id);
    if (!article)
        throw new helpers_1.AppError('Article not found.', 404);
    if (article.createdBy.toString() !== authReq.user._id.toString()) {
        throw new helpers_1.AppError('Not authorized to edit this article.', 403);
    }
    const { title, category, contentBlocks } = req.body;
    const parsedBlocks = contentBlocks
        ? parseJSON(contentBlocks)
        : article.contentBlocks;
    const updated = await Article_1.Article.findByIdAndUpdate(req.params.id, {
        ...(title && { title }),
        ...(category && { category }),
        contentBlocks: parsedBlocks,
    }, { new: true, runValidators: true }).populate('createdBy', 'name email');
    (0, helpers_1.sendSuccess)(res, { article: updated }, 200, 'Article updated');
});
exports.deleteArticle = (0, helpers_1.catchAsync)(async (req, res) => {
    const authReq = req;
    const article = await Article_1.Article.findById(req.params.id);
    if (!article)
        throw new helpers_1.AppError('Article not found.', 404);
    if (article.createdBy.toString() !== authReq.user._id.toString()) {
        throw new helpers_1.AppError('Not authorized to delete this article.', 403);
    }
    await article.deleteOne();
    (0, helpers_1.sendSuccess)(res, null, 200, 'Article deleted successfully');
});
//# sourceMappingURL=articleController.js.map