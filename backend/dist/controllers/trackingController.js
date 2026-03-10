"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logTracking = void 0;
const Analytics_1 = require("../models/Analytics");
const helpers_1 = require("../utils/helpers");
exports.logTracking = (0, helpers_1.catchAsync)(async (req, res) => {
    const { articleId, duration = 0 } = req.body;
    const studentId = req.user._id;
    if (!articleId)
        throw new helpers_1.AppError('articleId is required.', 400);
    const record = await Analytics_1.Analytics.findOneAndUpdate({ articleId, studentId }, {
        $inc: { views: 1, duration },
        $set: { lastRead: new Date() },
    }, { upsert: true, new: true });
    (0, helpers_1.sendSuccess)(res, { record });
});
//# sourceMappingURL=trackingController.js.map