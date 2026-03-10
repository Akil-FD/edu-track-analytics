import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthenticatedRequest, UserRole } from '../types';
import { AppError, catchAsync } from '../utils/helpers';
import { verifyToken } from '../utils/jwt';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// ─── Protect Route ────────────────────────────────────────────────────────────

export const protect = catchAsync(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Not authorized. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    let decoded: JwtPayload;
    try {
      decoded = verifyToken(token) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired token.', 401);
    }

    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      throw new AppError('User belonging to this token no longer exists.', 401);
    }

    (req as AuthenticatedRequest).user = user;
    next();
  }
);

// ─── Role Authorization ───────────────────────────────────────────────────────

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;

    if (!roles.includes(authReq.user.role)) {
      throw new AppError(
        `Access denied. Role '${authReq.user.role}' is not permitted for this action.`,
        403
      );
    }

    next();
  };
};
