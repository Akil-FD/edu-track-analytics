import mongoose, { Schema } from 'mongoose';
import { IHighlight } from '../types';


const highlightSchema = new Schema<IHighlight>(
    {
        studentId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        articleId: {
            type: Schema.Types.ObjectId,
            ref: 'Article',
            required: true,
        },
        text: {
            type: String,
            required: [true, 'Highlighted text is required'],
            maxlength: [1000, 'Highlight text cannot exceed 1000 characters'],
        },
        note: {
            type: String,
            maxlength: [500, 'Note cannot exceed 500 characters'],
            default: '',
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

export const Highlight = mongoose.model<IHighlight>('Highlight', highlightSchema);
