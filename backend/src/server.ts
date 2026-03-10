import express, { Application } from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env';
import { connectDatabase } from './config/database';
import { globalErrorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import analyticsRoutes from './routes/analytics';
import { trackingRouter, highlightRouter } from './routes/index';

const app: Application = express();

// ─── Core Middleware ──────────────────────────────────────────────────────────

app.use(
  cors({
    origin: config.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE',],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);


app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files ─────────────────────────────────────────────────────────────

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── API Routes ───────────────────────────────────────────────────────────────

app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tracking', trackingRouter);
app.use('/api/student/highlights', highlightRouter);

// ─── Global Error Handler ─────────────────────────────────────────────────────

app.use(globalErrorHandler);

// ─── Bootstrap ────────────────────────────────────────────────────────────────

const bootstrap = async (): Promise<void> => {
  await connectDatabase();

  app.listen(config.PORT, () => {
    console.log(`🚀 Server running in ${config.NODE_ENV} mode on port ${config.PORT}`);
  });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION:', error);
  process.exit(1);
});

bootstrap();

export default app;


