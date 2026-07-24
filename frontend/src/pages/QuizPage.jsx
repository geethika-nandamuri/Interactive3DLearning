import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchQuizQuestions } from '@services/aiService';
import { saveQuizScore } from '@services/progressService';
import { 
  Award, 
  Clock, 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Sliders, 
  ChevronRight,
  BookOpen
} from 'lucide-react';

const QuizPage = () => {
  const navigate = useNavigate();

  // Settings screen states
  const [organ, setOrgan] = useState('Heart');
  const [difficulty, setDifficulty] = useState('Medium');
  const [gameState, setGameState] = useState('setup'); // 'setup' | 'loading' | 'quiz' | 'summary'
  
  // Quiz play states
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);

  // Timer states
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef(null);
  const playTimeRef = useRef(null);

  // Load quiz from backend
  const handleStartQuiz = async () => {
    setGameState('loading');
    try {
      const data = await fetchQuizQuestions(organ, difficulty);
      if (data.success && data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setScore(0);
        setSelectedOption(null);
        setIsAnswered(false);
        setTimeLeft(30);
        setTimeSpent(0);
        setGameState('quiz');
      } else {
        throw new Error('No quiz questions returned from service.');
      }
    } catch (err) {
      alert(`Error loading quiz: ${err.message}. Loading demo quiz instead.`);
      // Mock questions in case of network/key failures to guarantee execution!
      setQuestions([
        {
          id: 1,
          type: 'mcq',
          question: 'Which chamber of the heart pumps oxygenated blood to the body systems?',
          options: ['Left Atrium', 'Left Ventricle', 'Right Atrium', 'Right Ventricle'],
          answer: 'Left Ventricle',
          explanation: 'The left ventricle has thick muscular walls to pump oxygenated blood under high pressure through the aorta to the systemic circulation.'
        },
        {
          id: 2,
          type: 'boolean',
          question: 'The Aorta is the largest artery in the human body.',
          options: ['True', 'False'],
          answer: 'True',
          explanation: 'True. The aorta is the largest artery, carrying oxygenated blood from the left ventricle to all body parts.'
        },
        {
          id: 3,
          type: 'mcq',
          question: 'What is the function of the superior vena cava?',
          options: ['Carry blood to the lungs', 'Return blood from the upper body to the heart', 'Pump blood to the body', 'Carry oxygenated blood from lungs'],
          answer: 'Return blood from the upper body to the heart',
          explanation: 'The superior vena cava returns deoxygenated venous blood from the head, neck, arms, and chest to the right atrium.'
        },
        {
          id: 4,
          type: 'boolean',
          question: 'The pulmonary artery is the only artery that carries oxygen-depleted blood.',
          options: ['True', 'False'],
          answer: 'True',
          explanation: 'True. Unlike other arteries that carry oxygenated blood, the pulmonary artery carries deoxygenated blood from the right ventricle to the lungs.'
        },
        {
          id: 5,
          type: 'mcq',
          question: 'Which node located in the right atrium acts as the heart\'s natural pacemaker?',
          options: ['AV Node', 'SA Node', 'Purkinje Fibers', 'Bundle of His'],
          answer: 'SA Node',
          explanation: 'The Sinoatrial (SA) node, situated in the upper wall of the right atrium, generates electrical impulses that spread through cardiac muscle to set the pace.'
        }
      ]);
      setCurrentIndex(0);
      setScore(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
      setTimeSpent(0);
      setGameState('quiz');
    }
  };

  // Timer effect for overall play time and 30-sec limit per question
  useEffect(() => {
    if (gameState === 'quiz') {
      // Overall play time counter
      playTimeRef.current = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);

      // Question countdown
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto fail question on timeout
            handleAnswerSelect('TIMEOUT_EXPIRED');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
      clearInterval(playTimeRef.current);
    }

    return () => {
      clearInterval(timerRef.current);
      clearInterval(playTimeRef.current);
    };
  }, [gameState, currentIndex]);

  const handleAnswerSelect = (option) => {
    if (isAnswered) return;

    clearInterval(timerRef.current); // Stop timer immediately
    setSelectedOption(option);
    setIsAnswered(true);

    const currentQuestion = questions[currentIndex];
    if (option === currentQuestion.answer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(30);
    } else {
      setGameState('summary');
      saveQuizScore(organ, score, questions.length, difficulty).catch(err =>
        console.error('Failed to persist quiz score:', err.message)
      );
    }
  };

  const handleRestartSetup = () => {
    setGameState('setup');
    setQuestions([]);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-4xl mx-auto font-sans relative">
      <AnimatePresence mode="wait">
        
        {/* Setup Screen */}
        {gameState === 'setup' && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-8"
          >
            <div className="text-center max-w-lg mx-auto space-y-3">
              <div className="h-14 w-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto">
                <Sliders size={28} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Configure AI Assessment</h2>
              <p className="text-sm text-slate-500 dark:text-slate-450 leading-relaxed">
                Choose your target organ and test difficulty. Gemini AI will compile a specialized MCQ assessment.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 p-8 rounded-3xl shadow-soft">
              {/* Organ Select */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Target Discipline / Organ
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Heart', 'Brain', 'Lungs', 'Kidneys'].map((org) => (
                    <button
                      key={org}
                      onClick={() => setOrgan(org)}
                      className={`py-3 px-4 rounded-xl border text-sm font-semibold transition-all ${
                        organ === org 
                          ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                          : 'border-slate-205 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {org}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty Selector */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`py-3 px-2.5 rounded-xl border text-xs font-bold transition-all ${
                        difficulty === diff 
                          ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2 pt-4">
                <button
                  onClick={handleStartQuiz}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
                >
                  Generate AI Quiz
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading Spinner Screen */}
        {gameState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[40vh] space-y-4"
          >
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-sm text-slate-450 dark:text-slate-500 font-extrabold tracking-widest uppercase animate-pulse">
              Compiling Quiz Questions...
            </p>
          </motion.div>
        )}

        {/* Active Quiz Question Screen */}
        {gameState === 'quiz' && currentQuestion && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Header info */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 px-6 py-4 rounded-2xl shadow-soft">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Question <span className="text-primary font-bold">{currentIndex + 1}</span> of {questions.length}
              </span>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-350">
                <Clock size={16} className={timeLeft <= 10 ? 'text-red-500 animate-bounce' : 'text-slate-400'} />
                <span className={`text-sm font-mono font-bold ${timeLeft <= 10 ? 'text-red-500 font-black' : ''}`}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Timer countdown progress bar */}
            <div className="w-full bg-slate-100 dark:bg-slate-850 h-1.5 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${timeLeft <= 10 ? 'bg-red-500' : 'bg-primary'}`}
                animate={{ width: `${(timeLeft / 30) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>

            {/* Question Card */}
            <div className="card-theme p-8 rounded-3xl space-y-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
                {currentQuestion.question}
              </h3>

              {/* Options list */}
              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  let btnStyle = 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850';
                  let icon = null;

                  if (isAnswered) {
                    if (option === currentQuestion.answer) {
                      // Correct option state (always highlighted green)
                      btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-450';
                      icon = <CheckCircle2 size={16} className="text-emerald-500" />;
                    } else if (option === selectedOption) {
                      // Incorrect option state (highlighted red if user clicked it)
                      btnStyle = 'border-red-500 bg-red-500/10 text-red-600 dark:text-red-450';
                      icon = <XCircle size={16} className="text-red-500" />;
                    } else {
                      btnStyle = 'border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-600 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full text-left py-3.5 px-5 rounded-2xl border text-sm font-semibold transition-all flex justify-between items-center ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {icon}
                    </button>
                  );
                })}
              </div>

              {/* Explanation panel revealed on submit */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 space-y-2 overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <BookOpen size={14} className="text-primary" />
                      <span>Anatomical Explanation</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {selectedOption === 'TIMEOUT_EXPIRED' && (
                        <strong className="text-red-500 block mb-1">Time expired! </strong>
                      )}
                      {currentQuestion.explanation}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Footer navigation */}
              {isAnswered && (
                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-primary/10"
                  >
                    {currentIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Quiz Summary Screen */}
        {gameState === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            {/* Top Score Circle */}
            <div className="card-theme p-8 rounded-3xl text-center space-y-4">
              <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto shadow-inner">
                <Award size={36} />
              </div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-white">Assessment Complete!</h2>
              <div className="flex justify-center gap-12 pt-2 pb-4">
                <div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{score} / {questions.length}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Final Score</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{Math.round((score / questions.length) * 100)}%</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Accuracy</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">{formatTime(timeSpent)}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mt-1">Time Taken</p>
                </div>
              </div>

              <div className="flex gap-4 max-w-md mx-auto pt-2">
                <button
                  onClick={handleStartQuiz}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} />
                  Retake Quiz
                </button>
                <button
                  onClick={handleRestartSetup}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
                >
                  Change Settings
                </button>
              </div>
            </div>

            {/* Questions Review list */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Question Review</h3>
              {questions.map((q, idx) => (
                <div key={q.id} className="card-theme p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-relaxed">
                      {q.id}. {q.question}
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      Correct Answer: <strong className="text-emerald-500 font-bold">{q.answer}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-slate-450 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-xl border border-slate-200/30 dark:border-slate-800/40">
                    {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

// Loader Icon fallback since we are using lucide icons
const Loader2 = ({ className }) => (
  <svg 
    className={`animate-spin ${className}`} 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default QuizPage;
