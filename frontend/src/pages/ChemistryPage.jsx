import React from 'react';
import { FlaskConical, Construction } from 'lucide-react';

const ChemistryPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 font-sans">
      <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 mb-6 animate-pulse">
        <FlaskConical size={32} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Chemistry 3D Model Viewer</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
        Molecular crystal lattices and electron density bonds are being processed into dynamic R3F particle sets.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
        <Construction size={14} />
        Module Under Development
      </div>
    </div>
  );
};

export default ChemistryPage;
