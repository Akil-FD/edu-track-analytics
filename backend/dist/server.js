"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = __importDefault(require("./routes/auth"));
const articles_1 = __importDefault(require("./routes/articles"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const index_1 = require("./routes/index");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.config.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE',],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
app.use('/api/auth', auth_1.default);
app.use('/api/articles', articles_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/tracking', index_1.trackingRouter);
app.use('/api/student/highlights', index_1.highlightRouter);
app.use(errorHandler_1.globalErrorHandler);
const bootstrap = async () => {
    await (0, database_1.connectDatabase)();
    app.listen(env_1.config.PORT, () => {
        console.log(`🚀 Server running in ${env_1.config.NODE_ENV} mode on port ${env_1.config.PORT}`);
    });
};
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION:', error);
    process.exit(1);
});
bootstrap();
exports.default = app;
//# sourceMappingURL=server.js.map