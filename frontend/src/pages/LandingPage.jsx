import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  Heart, 
  Dna, 
  Award, 
  BrainCircuit, 
  Volume2, 
  ShieldAlert, 
  UserCheck, 
  Users, 
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';

const LandingPage = () => {
  // Animation presets
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  const subjects = [
    { name: 'Anatomy', icon: Heart, count: '12 structures', color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' },
    { name: 'Biology', icon: Dna, count: '8 genomes', color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/20' },
    { name: 'Chemistry', icon: Sparkles, count: '15 lattices', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20' },
    { name: 'Engineering', icon: Layers, count: '9 assemblies', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
  ];

  const features = [
    {
      title: 'Exploded View System',
      description: 'Disassemble structures dynamically in 3D. Control distances to observe internal spatial mappings.',
      icon: Layers
    },
    {
      title: 'AI Clinical Explanations',
      description: 'Interact with Gemini AI to generate specific anatomical descriptions, functions, and clinical warnings.',
      icon: BrainCircuit
    },
    {
      title: 'Text-To-Speech Narrator',
      description: 'Listen to explanations read aloud through browser speech synthesis, optimizing accessibility.',
      icon: Volume2
    },
  ];

  const testimonials = [
    {
      quote: "This platform changed how I study cardiac physiology. Visualizing the ventricles and aorta in exploded view clarified spatial flows instantly.",
      author: "Sarah Jenkins",
      role: "Medical Student, Johns Hopkins",
      avatar: "SJ"
    },
    {
      quote: "As an anatomy lecturer, I find the interactive mesh selection invaluable. It bridges the gap between text diagrams and physical models.",
      author: "Dr. Marcus Vance",
      role: "Associate Professor of Anatomy",
      avatar: "MV"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Floating Navigation */}
      <header className="sticky top-0 z-50 w-full px-6 py-4">
        <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between rounded-2xl border border-slate-200/50 bg-white/75 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/75 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold shadow-md shadow-primary/20">
              3D
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">SpatialLearn</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Features</a>
            <a href="#subjects" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Subjects</a>
            <a href="#testimonials" className="hover:text-primary dark:hover:text-primary-dark transition-colors">Testimonials</a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/15"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-24 grid md:grid-cols-2 gap-16 items-center relative z-10">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 dark:border-primary/30 text-xs font-semibold tracking-wide text-primary"
          >
            <Sparkles size={12} className="animate-spin" style={{ animationDuration: '4s' }} />
            Premium Medical Visualization
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none"
          >
            Spatial Learning <br />
            For Modern <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Medical Science
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-lg"
          >
            Explore microscopic and macroscopic structures in high-fidelity interactive 3D. Inspect systems using exploded configurations, dynamic clipping, and AI guidance.
          </motion.p>

          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/dashboard/anatomy"
              className="px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-sm inline-flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
            >
              Explore Anatomy
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-200 font-bold text-sm transition-all"
            >
              Get Started
            </Link>
          </motion.div>

          {/* Mini Stats Banner */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 dark:border-slate-800"
          >
            {[
              { val: '100%', label: 'Mesh Labeled' },
              { val: '7+', label: 'Heart Parts' },
              { val: 'Gemini', label: 'AI Diagnoses' }
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">{stat.val}</p>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Pulsating 3D Showcase Holographic Placeholder */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative aspect-square flex items-center justify-center bg-white/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-850 rounded-[2.5rem] shadow-soft overflow-hidden glass-panel"
        >
          {/* Hologram details */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.05),transparent_60%)] pointer-events-none" />
          
          <div className="text-center p-8 space-y-6 relative z-10">
            {/* Pulsating heart SVG hologram */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.12, 1] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                className="absolute inset-0 bg-rose-500/10 dark:bg-rose-500/5 rounded-full border border-rose-500/20 blur-md"
              />
              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                className="w-32 h-32 rounded-full border border-rose-500/30 flex items-center justify-center bg-rose-500/5 shadow-[0_0_40px_rgba(239,68,68,0.15)]"
              >
                <Heart size={56} className="text-rose-500 fill-rose-500/20 animate-pulse" />
              </motion.div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center justify-center gap-2">
                Interactive Heart Model
                <span className="flex h-2.5 w-2.5 rounded-full bg-accent animate-ping" />
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                React Three Fiber canvas executes dynamically on viewer route activation.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-200 dark:border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold text-accent uppercase tracking-widest">Core Capabilities</span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Designed for Scientific Rigor
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            A premium educational environment packing advanced 3D shaders, real-time spatial calculations, and AI diagnostics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div 
                key={i} 
                className="p-8 rounded-2xl bg-white border border-slate-200/50 hover:border-slate-300 dark:bg-slate-900/30 dark:border-slate-850 dark:hover:border-slate-800 transition-all duration-300 shadow-soft hover:-translate-y-1 flex flex-col justify-between"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-white">{feat.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Subjects Grid */}
      <section id="subjects" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-200 dark:border-slate-900">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest">Multi-Disciplinary</span>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Supported Engineering & Science Fields
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((subj, i) => {
            const Icon = subj.icon;
            return (
              <div 
                key={i}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-800 transition-all shadow-soft flex items-center gap-4 group"
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${subj.color}`}>
                  <Icon size={20} className="transform group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">{subj.name}</h4>
                  <p className="text-xs text-slate-400 font-semibold">{subj.count}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-200 dark:border-slate-900 bg-white/20 dark:bg-slate-900/10 rounded-[3rem]">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-extrabold text-primary uppercase tracking-widest">User Feedback</span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
            Endorsed by Researchers & Students
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((test, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-850 shadow-soft relative">
              <span className="absolute top-6 right-8 text-6xl text-primary/10 font-serif leading-none">“</span>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 italic relative z-10">
                "{test.quote}"
              </p>
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm">
                  {test.avatar}
                </div>
                <div>
                  <p className="font-bold text-slate-950 dark:text-white text-sm">{test.author}</p>
                  <p className="text-xs text-slate-400 font-semibold">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-950 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 items-center text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-extrabold">
                3D
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">SpatialLearn</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              An advanced spatial educational tool designed for major IEEE final-year portfolios.
            </p>
          </div>

          <div className="flex justify-center gap-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#subjects" className="hover:text-primary transition-colors">Subjects</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
          </div>

          <div className="text-center md:text-right">
            <p className="text-xs text-slate-400 font-bold">© 2026 SpatialLearn Project Group. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
