import api from './api';

export const fetchProgress = async () => {
  const response = await api.get('/progress');
  return response.data;
};

export const completeLesson = async (lessonName) => {
  const response = await api.post('/progress/complete-lesson', { lessonName });
  return response.data;
};

export const saveQuizScore = async (organName, score, total, difficulty) => {
  const response = await api.post('/progress/quiz-score', { organName, score, total, difficulty });
  return response.data;
};

export const trackStudyTime = async (seconds) => {
  const response = await api.post('/progress/track-time', { seconds });
  return response.data;
};
