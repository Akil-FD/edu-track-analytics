"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHighlight = exports.getAllHighlights = exports.getHighlightsByArticle = exports.createHighlight = void 0;
const helpers_1 = require("../utils/helpers");
const Highlights_1 = require("../models/Highlights");
exports.createHighlight = (0, helpers_1.catchAsync)(async (req, res) => {
    const { articleId, text, note } = req.body;
    const studentId = req.user._id;
    if (!articleId || !text) {
        throw new helpers_1.AppError('articleId and text are required.', 400);
    }
    const highlight = await Highlights_1.Highlight.create({
        studentId,
        articleId,
        text,
        note: note ?? '',
    });
    (0, helpers_1.sendSuccess)(res, { highlight }, 201);
});
exports.getHighlightsByArticle = (0, helpers_1.catchAsync)(async (req, res) => {
    const studentId = req.user._id;
    const { articleId } = req.params;
    const highlights = await Highlights_1.Highlight.find({ studentId, articleId }).sort({ createdAt: -1 });
    (0, helpers_1.sendSuccess)(res, { highlights });
});
exports.getAllHighlights = (0, helpers_1.catchAsync)(async (req, res) => {
    const studentId = req.user._id;
    const highlights = await Highlights_1.Highlight.find({ studentId })
        .populate('articleId', 'title category')
        .sort({ createdAt: -1 });
    (0, helpers_1.sendSuccess)(res, { highlights });
});
exports.deleteHighlight = (0, helpers_1.catchAsync)(async (req, res) => {
    const studentId = req.user._id;
    const highlight = await Highlights_1.Highlight.findOneAndDelete({
        _id: req.params.id,
        studentId,
    });
    if (!highlight)
        throw new helpers_1.AppError('Highlight not found.', 404);
    (0, helpers_1.sendSuccess)(res, null, 200, 'Highlight deleted.');
});
//# sourceMappingURL=highlightsController.js.map