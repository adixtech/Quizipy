import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        trim: true
    },
    quizCode: {
        type: String,
        required: true,
        uppercase: true
    },
    quizTitle: {
        type: String,
        required: true,
        default: "Unknown Quiz"
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
    collection: 'leaderboard'
});

// Indexes for faster queries
leaderboardSchema.index({ quizCode: 1, score: -1 });
// leaderboardSchema.index({ score: -1 }); aaj mitaya hu rraat mai 27 oct

export default mongoose.models.Leaderboard || mongoose.model('Leaderboard', leaderboardSchema);
