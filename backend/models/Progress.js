import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonsCompleted: [String],
  quizScores: [{
    organName: String,
    score: Number,
    total: Number,
    difficulty: String,
    date: { type: Date, default: Date.now }
  }],
  timeSpentSeconds: { type: Number, default: 0 }
}, { timestamps: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
