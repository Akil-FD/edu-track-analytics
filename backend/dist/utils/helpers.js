"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = exports.catchAsync = exports.AppError = void 0;
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const catchAsync = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.catchAsync = catchAsync;
const sendSuccess = (res, data, statusCode = 200, message) => {
    return res.status(statusCode).json({
        success: true,
        ...(message && { message }),
        ...(data !== null && data !== undefined && { data }),
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, statusCode = 500) => {
    return res.status(statusCode).json({ success: false, message });
};
exports.sendError = sendError;
//# sourceMappingURL=helpers.js.map