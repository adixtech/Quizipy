import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const quizSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, 'Quiz title is required'],
        trim: true
    },
    description: { 
        type: String, 
        required: [true, 'Description is required'],
        trim: true
    },
    timer: { 
        type: Number, 
        required: true,
        min: 0
    },
    questions: [{
        text: { 
            type: String, 
            required: [true, 'Question text is required'],
            trim: true
        },
        options: { 
            type: [String], 
            required: true,
            validate: [arr => arr.length >= 2, 'At least 2 options required']
        },
        correct: { 
            type: Number, 
            required: true,
            min: 0
        }
    }],
    quizCode: {
        type: String,
        unique: true,
        default: () => nanoid(6).toUpperCase(),
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { 
    timestamps: true,
    collection: 'quizzes'
});

// Index for faster lookups
quizSchema.index({ quizCode: 1 });

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);