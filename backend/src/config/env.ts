import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface EnvConfig {
  PORT: number;
  MONGO_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  NODE_ENV: 'development' | 'production' | 'test';
  CLIENT_URL: string;
}

const getEnvVar = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config: EnvConfig = {
    PORT: parseInt(getEnvVar('PORT'), 10),
    MONGO_URI: getEnvVar('MONGO_URI'),
    JWT_SECRET: getEnvVar('JWT_SECRET'),
    JWT_EXPIRES_IN: getEnvVar('JWT_EXPIRES_IN'),
    NODE_ENV: (getEnvVar('NODE_ENV') as EnvConfig['NODE_ENV']),
    CLIENT_URL: getEnvVar('CLIENT_URL'),
  };
