import React from 'react';
import { useSelectedMesh } from '@contexts/SelectedMeshContext';

export default function AnatomySidebar({ isLeftOpen, onClose }) {
  const { availableMeshes, selectedMeshInfo, selectMesh } = useSelectedMesh();

  return (
    <aside className={`w-full lg:w-[25%] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 flex flex-col gap-6 overflow-hidden shadow-soft h-full transition-all duration-300 lg:translate-x-0 ${
      isLeftOpen ? 'absolute inset-y-0 left-0 z-40 w-72 translate-x-0 shadow-2xl' : 'absolute lg:relative -translate-x-full lg:translate-x-0'
    }`}>
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div>
          <h2 className="text-lg font-black tracking-tight">Anatomy Parts</h2>
          <p className="text-[10px] text-slate-450 dark:text-slate-500 font-extrabold tracking-wider uppercase mt-0.5">
            {availableMeshes.length} Structures Discovered
          </p>
        </div>
        {isLeftOpen && (
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 text-xs font-bold"
          >
            Close
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin">
        {availableMeshes.map((meshItem) => {
          const isSelected = selectedMeshInfo?.uuid === meshItem.uuid;
          return (
            <button
              key={meshItem.uuid}
              onClick={() => selectMesh(meshItem)}
              className={`w-full text-left py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${
                isSelected 
                  ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[0.98]' 
                  : 'text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-850/50'
              }`}
            >
              {meshItem.name}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
