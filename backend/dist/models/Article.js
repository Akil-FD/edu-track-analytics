"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Article = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const types_1 = require("../types");
const contentBlockSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(types_1.ContentBlockType),
        required: true,
    },
    content: { type: String, default: '' },
    fileUrl: { type: String, default: '' },
    caption: { type: String, default: '' },
}, { _id: true });
const articleSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: Object.values(types_1.ArticleCategory),
        default: types_1.ArticleCategory.SCIENCE,
    },
    summary: {
        type: String,
        maxlength: [500, 'Summary cannot exceed 500 characters'],
        default: '',
    },
    contentBlocks: [contentBlockSchema],
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            const { id, __v, ...rest } = ret;
            return rest;
        },
    },
});
articleSchema.index({ title: 'text', summary: 'text', tags: 'text' });
exports.Article = mongoose_1.default.model('Article', articleSchema);
//# sourceMappingURL=Article.js.map