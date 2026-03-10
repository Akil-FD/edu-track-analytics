import mongoose, { Schema } from 'mongoose';
import { IAnalytics } from '../types';

// ─── Analytics ────────────────────────────────────────────────────────────────

const analyticsSchema = new Schema<IAnalytics>(
  {
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: { type: Number, default: 1 },
    duration: { type: Number, default: 0 }, // seconds
    lastRead: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

analyticsSchema.index({ articleId: 1, studentId: 1 }, { unique: true });

export const Analytics = mongoose.model<IAnalytics>('Analytics', analyticsSchema);

