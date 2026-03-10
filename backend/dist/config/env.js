"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const getEnvVar = (key, fallback) => {
    const value = process.env[key] ?? fallback;
    if (value === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};
exports.config = {
    PORT: parseInt(getEnvVar('PORT'), 10),
    MONGO_URI: getEnvVar('MONGO_URI'),
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN'),
    NODE_ENV: getEnvVar('NODE_ENV'),
    CLIENT_URL: getEnvVar('CLIENT_URL'),
};
//# sourceMappingURL=env.js.map