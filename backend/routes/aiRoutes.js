import express from 'express';
import { protect } from '../middleware/auth.js';
import { explainStructure, generateQuiz } from '../services/gemini.js';

const router = express.Router();

router.post('/explain', protect, async (req, res) => {
  const { partName } = req.body;
  
  if (!partName) {
    return res.status(400).json({ error: 'partName is required in request body.' });
  }

  try {
    const explanation = await explainStructure(partName);
    res.json({ success: true, explanation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/quiz-generate', protect, async (req, res) => {
  const { organName, difficulty } = req.body;

  if (!organName) {
    return res.status(400).json({ error: 'organName is required in request body.' });
  }

  try {
    const questions = await generateQuiz(organName, difficulty || 'Medium');
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
