import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
    userName: { 
        type: String, 
        required: true,
        trim: true
    },
    quizId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Quiz',
        required: true
    },
    quizTitle: { 
        type: String, 
        required: true,
        trim: true
    },
    score: { 
        type: Number, 
        required: true,
        min: 0,
        max: 100
    },
    timeTaken: { 
        type: Number, 
        required: true,
        min: 0
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, { 
    timestamps: true,
    collection: 'results'
});

// Index for faster queries
resultSchema.index({ quizId: 1, score: -1 });

export default mongoose.models.Result || mongoose.model('Result', resultSchema);