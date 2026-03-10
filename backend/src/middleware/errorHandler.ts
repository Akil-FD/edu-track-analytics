import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/helpers';
import { config } from '../config/env';

// ─── Upload Middleware ────────────────────────────────────────────────────────

const UPLOAD_DIRS = ['uploads', 'uploads/images', 'uploads/videos', 'uploads/models'];
UPLOAD_DIRS.forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    let folder = 'uploads/images';
    if (file.mimetype.startsWith('video/')) folder = 'uploads/videos';
    else if (/\.(glb|gltf|obj)$/i.test(file.originalname)) folder = 'uploads/models';
    cb(null, folder);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
  const allowedPattern = /jpeg|jpg|png|gif|webp|mp4|webm|mov|glb|gltf|obj/;
  const extname = allowedPattern.test(path.extname(file.originalname).toLowerCase());
  const isModel = /\.(glb|gltf|obj)$/i.test(file.originalname);

  if (extname || isModel) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Allowed: images, videos, 3D models.', 400));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// ─── Global Error Handler ─────────────────────────────────────────────────────

interface MongoError extends Error {
  code?: number;
  keyValue?: Record<string, unknown>;
  path?: string;
  value?: unknown;
  errors?: Record<string, { message: string }>;
}

export const globalErrorHandler = (
  err: MongoError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  } else if (err.code === 11000 && err.keyValue) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists.`;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for field: ${err.path ?? 'unknown'}`;
  }

  if (config.NODE_ENV === 'development') {
    console.error('ERROR:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
