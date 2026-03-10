"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const helpers_1 = require("../utils/helpers");
const env_1 = require("../config/env");
const UPLOAD_DIRS = ['uploads', 'uploads/images', 'uploads/videos', 'uploads/models'];
UPLOAD_DIRS.forEach(dir => {
    if (!fs_1.default.existsSync(dir))
        fs_1.default.mkdirSync(dir, { recursive: true });
});
const storage = multer_1.default.diskStorage({
    destination: (_req, file, cb) => {
        let folder = 'uploads/images';
        if (file.mimetype.startsWith('video/'))
            folder = 'uploads/videos';
        else if (/\.(glb|gltf|obj)$/i.test(file.originalname))
            folder = 'uploads/models';
        cb(null, folder);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path_1.default.extname(file.originalname)}`);
    },
});
const fileFilter = (_req, file, cb) => {
    const allowedPattern = /jpeg|jpg|png|gif|webp|mp4|webm|mov|glb|gltf|obj/;
    const extname = allowedPattern.test(path_1.default.extname(file.originalname).toLowerCase());
    const isModel = /\.(glb|gltf|obj)$/i.test(file.originalname);
    if (extname || isModel) {
        cb(null, true);
    }
    else {
        cb(new helpers_1.AppError('Invalid file type. Allowed: images, videos, 3D models.', 400));
    }
};
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 50 * 1024 * 1024 },
});
const globalErrorHandler = (err, _req, res, _next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    if (err instanceof helpers_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err.name === 'ValidationError' && err.errors) {
        statusCode = 400;
        message = Object.values(err.errors).map(e => e.message).join(', ');
    }
    else if (err.code === 11000 && err.keyValue) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
    }
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid value for field: ${err.path ?? 'unknown'}`;
    }
    if (env_1.config.NODE_ENV === 'development') {
        console.error('ERROR:', err);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(env_1.config.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=errorHandler.js.map