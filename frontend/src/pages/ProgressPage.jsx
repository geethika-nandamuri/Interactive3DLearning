import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, CheckCircle2, Trophy, Loader2, Calendar } from 'lucide-react';
import { fetchProgress } from '@services/progressService';

const ProgressPage = () => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress()
      .then(data => {
        if (data.success) {
          setProgress(data.progress);
        }
      })
      .catch(err => console.error('Error fetching progress:', err.message))
      .finally(() => setLoading(false));
  }, []);

  const getStudyTimeStr = () => {
    if (!progress) return '0.0 Hours';
    const hours = progress.timeSpentSeconds / 3600;
    return `${hours.toFixed(1)} Hours`;
  };

  const getLessonsCount = () => {
    return progress?.lessonsCompleted?.length || 0;
  };

  const getQuizAverageStr = () => {
    if (!progress || !progress.quizScores || progress.quizScores.length === 0) return '0%';
    const totalPct = progress.quizScores.reduce((acc, q) => acc + (q.score / q.total), 0);
    return `${Math.round((totalPct / progress.quizScores.length) * 100)}%`;
  };

  const getQuizScoresCount = () => {
    return progress?.quizScores?.length || 0;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Loading Overlay */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-sm text-slate-450 dark:text-slate-500 font-extrabold tracking-widest uppercase animate-pulse">
            Loading Progress Report...
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { label: 'Time Studied', value: getStudyTimeStr(), icon: Clock, color: 'text-primary' },
              { label: 'Lessons Completed', value: `${getLessonsCount()} parts`, icon: CheckCircle2, color: 'text-accent' },
              { label: 'Average Quiz Score', value: getQuizAverageStr(), icon: Trophy, color: 'text-yellow-500' },
              { label: 'Quizzes Taken', value: `${getQuizScoresCount()} tests`, icon: BarChart3, color: 'text-purple-500' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="card-theme p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{item.label}</span>
                    <Icon size={18} className={item.color} />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{item.value}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Visual SVG Chart Card */}
            <div className="lg:col-span-8 card-theme p-8 rounded-2xl flex flex-col justify-between min-h-[350px]">
              <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Quiz Performance History</h3>
                <p className="text-xs text-slate-450 dark:text-slate-550 mb-6">Percentage scores of your last 7 quiz attempts.</p>
              </div>
              
              {/* Dynamic SVG chart based on actual database scores */}
              <div className="h-56 relative flex items-end justify-between gap-4 pt-4 border-b border-l border-slate-200 dark:border-slate-800 pl-4 pb-4">
                {(!progress?.quizScores || progress.quizScores.length === 0) ? (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-450 text-xs italic select-none">
                    No quiz data available yet. Complete a quiz to view scores history.
                  </div>
                ) : (
                  progress.quizScores.slice(-7).map((attempt, i) => {
                    const percent = Math.round((attempt.score / attempt.total) * 100);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div 
                          className="w-full bg-primary/20 hover:bg-primary/45 dark:bg-primary/30 dark:hover:bg-primary/50 border border-primary/30 dark:border-primary/20 rounded-t-lg transition-all duration-300 relative group"
                          style={{ height: `${percent}%` }}
                        >
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none font-bold">
                            {percent}% ({attempt.score}/{attempt.total})
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-450 uppercase truncate max-w-16">
                          {attempt.organName}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* List of completed lessons */}
            <div className="lg:col-span-4 card-theme p-6 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                  Completed Structures
                </h3>
                <div className="overflow-y-auto max-h-[220px] pr-1 space-y-2.5">
                  {!progress?.lessonsCompleted || progress.lessonsCompleted.length === 0 ? (
                    <p className="text-xs text-slate-450 italic select-none text-center pt-8">
                      No structures selected yet. Visit the Anatomy module to begin!
                    </p>
                  ) : (
                    progress.lessonsCompleted.map((lesson, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-850/50">
                        <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                          {lesson}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Quiz attempts database logs table */}
          {progress?.quizScores && progress.quizScores.length > 0 && (
            <div className="card-theme p-6 rounded-2xl">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
                Quiz Logs History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-205 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3">Subject / Organ</th>
                      <th className="pb-3">Score</th>
                      <th className="pb-3">Difficulty</th>
                      <th className="pb-3">Date Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {progress.quizScores.map((attempt, idx) => (
                      <tr key={idx} className="text-slate-700 dark:text-slate-350 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">
                        <td className="py-3 font-semibold">{attempt.organName}</td>
                        <td className="py-3 font-bold text-primary dark:text-primary-dark">
                          {attempt.score} / {attempt.total} ({Math.round((attempt.score / attempt.total) * 100)}%)
                        </td>
                        <td className="py-3 font-semibold">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            attempt.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500' :
                            attempt.difficulty === 'Medium' ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {attempt.difficulty || 'Medium'}
                          </span>
                        </td>
                        <td className="py-3 text-slate-450 flex items-center gap-1.5">
                          <Calendar size={12} />
                          {new Date(attempt.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProgressPage;
