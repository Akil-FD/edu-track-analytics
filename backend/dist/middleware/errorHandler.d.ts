import multer from 'multer';
import { Request, Response, NextFunction } from 'express';
export declare const upload: multer.Multer;
interface MongoError extends Error {
    code?: number;
    keyValue?: Record<string, unknown>;
    path?: string;
    value?: unknown;
    errors?: Record<string, {
        message: string;
    }>;
}
export declare const globalErrorHandler: (err: MongoError, _req: Request, res: Response, _next: NextFunction) => void;
export {};
//# sourceMappingURL=errorHandler.d.ts.map