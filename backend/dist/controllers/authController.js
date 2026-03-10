"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const User_1 = require("../models/User");
const helpers_1 = require("../utils/helpers");
const types_1 = require("../types");
const jwt_1 = require("../utils/jwt");
exports.register = (0, helpers_1.catchAsync)(async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        const requiredFields = { name, email, password };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field]) => field);
        if (missingFields.length) {
            throw new helpers_1.AppError(`${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required.`, 400);
        }
    }
    const existingUser = await User_1.User.findOne({ email });
    if (existingUser) {
        throw new helpers_1.AppError('Email already registered.', 400);
    }
    const user = await User_1.User.create({
        name,
        email,
        password,
        role: role ?? types_1.UserRole.STUDENT,
    });
    const token = (0, jwt_1.generateToken)(user._id.toString());
    (0, helpers_1.sendSuccess)(res, { token, user }, 201, 'Registration successful');
});
exports.login = (0, helpers_1.catchAsync)(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new helpers_1.AppError('Email and password are required.', 400);
    }
    const user = await User_1.User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
        throw new helpers_1.AppError('Invalid email or password.', 401);
    }
    const token = (0, jwt_1.generateToken)(user._id.toString());
    const userPublic = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    };
    (0, helpers_1.sendSuccess)(res, { token, user: userPublic }, 200, 'Login successful');
});
//# sourceMappingURL=authController.js.map