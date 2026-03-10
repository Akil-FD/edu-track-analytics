import { Request, Response } from 'express';
import { User } from '../models/User';
import { catchAsync, AppError, sendSuccess } from '../utils/helpers';
import {
  RegisterBody,
  LoginBody,
  UserRole,
} from '../types';
import { generateToken } from '../utils/jwt';


// ─── Register ─────────────────────────────────────────────────────────────────

export const register = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, role } = req.body as RegisterBody;

  if (!name || !email || !password) {
    const requiredFields = { name, email, password };
    const missingFields = Object.entries(requiredFields)
      .filter(([_, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length) {
      throw new AppError(
        `${missingFields.join(", ")} ${missingFields.length > 1 ? "are" : "is"} required.`,
        400
      );
    }

  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered.', 400);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role ?? UserRole.STUDENT,
  });

  const token = generateToken(user._id.toString());

  sendSuccess(res, { token, user }, 201, 'Registration successful');
});

// ─── Login ────────────────────────────────────────────────────────────────────

export const login = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as LoginBody;

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const token = generateToken(user._id.toString());

  const userPublic = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  sendSuccess(res, { token, user: userPublic }, 200, 'Login successful');
});
