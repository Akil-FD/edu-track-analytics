import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
export declare const protect: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare const authorize: (...roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map