interface EnvConfig {
    PORT: number;
    MONGO_URI: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    NODE_ENV: 'development' | 'production' | 'test';
    CLIENT_URL: string;
}
export declare const config: EnvConfig;
export {};
//# sourceMappingURL=env.d.ts.map