"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.protect = void 0;
const User_1 = require("../models/User");
const helpers_1 = require("../utils/helpers");
const jwt_1 = require("../utils/jwt");
exports.protect = (0, helpers_1.catchAsync)(async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        throw new helpers_1.AppError('Not authorized. No token provided.', 401);
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
        decoded = (0, jwt_1.verifyToken)(token);
    }
    catch {
        throw new helpers_1.AppError('Invalid or expired token.', 401);
    }
    const user = await User_1.User.findById(decoded.id).select('+password');
    if (!user) {
        throw new helpers_1.AppError('User belonging to this token no longer exists.', 401);
    }
    req.user = user;
    next();
});
const authorize = (...roles) => {
    return (req, _res, next) => {
        const authReq = req;
        if (!roles.includes(authReq.user.role)) {
            throw new helpers_1.AppError(`Access denied. Role '${authReq.user.role}' is not permitted for this action.`, 403);
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map