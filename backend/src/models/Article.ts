import mongoose, { Schema } from 'mongoose';
import { IArticle, IContentBlock, ArticleCategory, ContentBlockType } from '../types';

const contentBlockSchema = new Schema<IContentBlock>(
  {
    type: {
      type: String,
      enum: Object.values(ContentBlockType),
      required: true,
    },
    content: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    caption: { type: String, default: '' },
  },
  { _id: true }
);

const articleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: Object.values(ArticleCategory),
      default: ArticleCategory.SCIENCE,
    },
    summary: {
      type: String,
      maxlength: [500, 'Summary cannot exceed 500 characters'],
      default: '',
    },
    contentBlocks: [contentBlockSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { id, __v, ...rest } = ret;
        return rest;
      },
    },
  }
);

// Text index for full-text search
articleSchema.index({ title: 'text', summary: 'text', tags: 'text' });

export const Article = mongoose.model<IArticle>('Article', articleSchema);
