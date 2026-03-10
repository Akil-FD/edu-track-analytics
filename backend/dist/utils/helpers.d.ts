import { Request, Response, NextFunction, RequestHandler } from 'express';
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly isOperational: boolean;
    constructor(message: string, statusCode: number);
}
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void | Response>;
export declare const catchAsync: (fn: AsyncHandler) => RequestHandler;
export declare const sendSuccess: <T>(res: Response, data: T, statusCode?: number, message?: string) => Response;
export declare const sendError: (res: Response, message: string, statusCode?: number) => Response;
export {};
//# sourceMappingURL=helpers.d.ts.map