import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { config } from '../config/env';


export const generateToken = (id: string): string =>
  jwt.sign({ id }, config.JWT_SECRET as Secret, {
    expiresIn: config.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  } as SignOptions);

export const verifyToken = (token: string) =>
  jwt.verify(token, config.JWT_SECRET as Secret);
