import express from 'express';
import { protect } from '../middleware/auth.js';
import Progress from '../models/Progress.js';

const router = express.Router();

// Fetch overall study progress
router.get('/', protect, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = await Progress.create({
        userId: req.user.id,
        lessonsCompleted: [],
        quizScores: [],
        timeSpentSeconds: 0
      });
    }
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save a completed anatomical structure lesson
router.post('/complete-lesson', protect, async (req, res) => {
  const { lessonName } = req.body;
  if (!lessonName) {
    return res.status(400).json({ error: 'lessonName is required.' });
  }

  try {
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new Progress({ userId: req.user.id });
    }

    if (!progress.lessonsCompleted.includes(lessonName)) {
      progress.lessonsCompleted.push(lessonName);
      await progress.save();
    }
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save quiz score
router.post('/quiz-score', protect, async (req, res) => {
  const { organName, score, total, difficulty } = req.body;
  if (!organName || score === undefined || !total) {
    return res.status(400).json({ error: 'organName, score, and total are required.' });
  }

  try {
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new Progress({ userId: req.user.id });
    }

    progress.quizScores.push({
      organName,
      score,
      total,
      difficulty,
      date: new Date()
    });

    await progress.save();
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Increment cumulative study time
router.post('/track-time', protect, async (req, res) => {
  const { seconds } = req.body;
  if (seconds === undefined) {
    return res.status(400).json({ error: 'seconds is required.' });
  }

  try {
    let progress = await Progress.findOne({ userId: req.user.id });
    if (!progress) {
      progress = new Progress({ userId: req.user.id, timeSpentSeconds: 0 });
    }

    progress.timeSpentSeconds = (progress.timeSpentSeconds || 0) + seconds;
    await progress.save();
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
