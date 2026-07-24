import api from './api';

export const fetchAIExplanation = async (partName) => {
  const response = await api.post('/ai/explain', { partName });
  return response.data;
};

export const fetchQuizQuestions = async (organName, difficulty) => {
  const response = await api.post('/ai/quiz-generate', { organName, difficulty });
  return response.data;
};
