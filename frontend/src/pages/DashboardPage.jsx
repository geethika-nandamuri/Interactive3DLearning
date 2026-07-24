import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { fetchProgress } from '@services/progressService';
import { useAuth } from '@contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress()
      .then(data => {
        if (data.success) {
          setProgress(data.progress);
        }
      })
      .catch(err => console.error('Error fetching progress in dashboard:', err.message))
      .finally(() => setLoading(false));
  }, []);

  const getQuizAverage = () => {
    if (!progress || !progress.quizScores || progress.quizScores.length === 0) return '0%';
    const totalPct = progress.quizScores.reduce((acc, q) => acc + (q.score / q.total), 0);
    return `${Math.round((totalPct / progress.quizScores.length) * 100)}%`;
  };

  const getCompletedLessonsCount = () => {
    return progress?.lessonsCompleted?.length || 0;
  };

  const getStudyTime = () => {
    if (!progress) return '0.0h';
    const hours = progress.timeSpentSeconds / 3600;
    return `${hours.toFixed(1)}h`;
  };

  const stats = [
    { 
      title: 'Completed Lessons', 
      value: loading ? '...' : `${getCompletedLessonsCount()} parts`, 
      icon: BookOpen, 
      color: 'text-primary bg-primary/10' 
    },
    { 
      title: 'Quiz Score Average', 
      value: loading ? '...' : getQuizAverage(), 
      icon: Award, 
      color: 'text-accent bg-accent/10' 
    },
    { 
      title: 'Time Invested', 
      value: loading ? '...' : getStudyTime(), 
      icon: Clock, 
      color: 'text-yellow-600 bg-yellow-500/10' 
    },
  ];

  const modules = [
    { name: 'Anatomy', path: '/dashboard/anatomy', desc: 'Heart Structure, Ventricles, and Valvular systems.', parts: 7, active: true },
    { name: 'Biology', path: '/dashboard/biology', desc: 'DNA double helix, cellular mitosis, and organelle structures.', parts: 0, active: false },
    { name: 'Engineering', path: '/dashboard/engineering', desc: 'Internal combustion engines, gearboxes, and spatial mechanical systems.', parts: 0, active: false },
    { name: 'Chemistry', path: '/dashboard/chemistry', desc: 'Organic molecular bonds, crystal structures, and electron density spheres.', parts: 0, active: false },
    { name: 'Architecture', path: '/dashboard/architecture', desc: 'BIM models, structural load-bearing frames, and space dividers.', parts: 0, active: false },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-primary to-accent text-white shadow-soft">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'Student'}!</h2>
        <p className="text-white/80 max-w-xl text-sm leading-relaxed">
          Embark on interactive learning Journeys. Dive into high-fidelity 3D spatial models designed for deep spatial comprehension and structural analysis.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card-theme p-6 rounded-2xl flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">{stat.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  {loading ? (
                    <Loader2 className="h-5 w-5 text-slate-400 animate-spin" />
                  ) : (
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Learning Modules */}
      <div>
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">Learning Modules</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <div key={mod.name} className="card-theme p-6 rounded-2xl flex flex-col justify-between h-48">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{mod.name}</h4>
                  {mod.active ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent/15 text-accent dark:text-accent-dark">
                      Interactive
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                      Coming Soon
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-xs font-medium text-slate-400">
                  {mod.parts > 0 ? `${mod.parts} interactable meshes` : '0 parts'}
                </span>
                {mod.active && (
                  <Link
                    to={mod.path}
                    className="text-primary hover:text-primary-hover dark:text-primary-dark font-semibold text-sm flex items-center gap-1 group"
                  >
                    Enter Module
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
