import React from 'react';
import { Loader2, AlertCircle, ArrowLeft, BrainCircuit, HelpCircle } from 'lucide-react';

export default function InformationPanel({
  selectedMeshInfo,
  activeSource,
  setActiveSource,
  aiLoading,
  aiError,
  aiExplanation,
  activeDetails,
  handleAIDeepDive,
  handleStartSpeaking,
  isPlaying,
  isPaused,
  resume,
  pause,
  stop,
  voices,
  selectedVoiceName,
  setSelectedVoiceName,
  rate,
  setRate,
  renderMarkdown,
  isRightOpen,
  onClose,
  navigate
}) {
  return (
    <aside className={`w-full lg:w-[20%] bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-soft h-full transition-all duration-300 lg:translate-x-0 ${
      isRightOpen ? 'absolute inset-y-0 right-0 z-40 w-80 translate-x-0 shadow-2xl' : 'absolute lg:relative translate-x-full lg:translate-x-0'
    }`}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800 mb-4 flex-shrink-0">
          <div>
            <span className="text-[9px] font-extrabold text-primary uppercase tracking-widest">
              {activeSource === 'ai' ? 'AI Diagnostic Summary' : selectedMeshInfo ? 'Selected Part' : 'Standard Guide'}
            </span>
            <h3 className="text-xl font-black text-slate-850 dark:text-white mt-0.5 truncate max-w-60">
              {activeSource === 'ai' ? aiExplanation?.name || selectedMeshInfo?.name : activeDetails.name}
            </h3>
          </div>
          {isRightOpen && (
            <button 
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 text-xs font-bold"
            >
              Close
            </button>
          )}
        </div>

        {/* Speech Settings Control */}
        {selectedMeshInfo && !aiLoading && !aiError && (
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 space-y-3 flex-shrink-0">
            <div className="flex gap-2">
              {!isPlaying ? (
                <button
                  onClick={handleStartSpeaking}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-primary hover:bg-primary-hover text-white text-[10px] font-bold transition-all shadow-sm"
                >
                  Speak Info
                </button>
              ) : isPaused ? (
                <button
                  onClick={resume}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold transition-all"
                >
                  Resume
                </button>
              ) : (
                <button
                  onClick={pause}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-[10px] font-bold transition-all"
                >
                  Pause
                </button>
              )}

              {isPlaying && (
                <button
                  onClick={stop}
                  className="py-1.5 px-3 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold transition-all"
                >
                  Stop
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/50">
              <select
                value={selectedVoiceName}
                onChange={(e) => setSelectedVoiceName(e.target.value)}
                className="w-full text-[9px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-1.5 focus:outline-none"
              >
                {voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name.split(' - ')[0]} ({voice.lang})
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1.5 justify-between">
                <span className="text-[8px] font-bold text-slate-400 uppercase">Rate: {rate.toFixed(1)}x</span>
                <input
                  type="range"
                  min="0.6"
                  max="1.8"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value))}
                  className="accent-primary h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer w-14"
                />
              </div>
            </div>
          </div>
        )}

        {/* Scrollable details text */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          {activeSource === 'ai' ? (
            aiLoading ? (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-[9px] text-slate-450 dark:text-slate-500 font-extrabold tracking-widest uppercase animate-pulse">
                  Querying Gemini...
                </p>
              </div>
            ) : aiError ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 space-y-2.5">
                <div className="flex items-center gap-1.5">
                  <AlertCircle size={16} />
                  <span className="font-bold text-xs">API Error</span>
                </div>
                <p className="text-[10px] leading-relaxed">{aiError}</p>
                <button
                  onClick={handleAIDeepDive}
                  className="px-3 py-1 rounded-lg bg-red-500 text-white font-bold text-[10px] hover:bg-red-650 transition-colors"
                >
                  Retry Query
                </button>
              </div>
            ) : aiExplanation ? (
              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide text-[10px] mb-1">Description</h4>
                  <div className="text-slate-600 dark:text-slate-400">{renderMarkdown(aiExplanation.description)}</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide text-[10px] mb-1">Function</h4>
                  <div className="text-slate-600 dark:text-slate-400">{renderMarkdown(aiExplanation.function)}</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide text-[10px] mb-1">Clinical Significance</h4>
                  <div className="text-slate-600 dark:text-slate-400">{renderMarkdown(aiExplanation.clinicalImportance)}</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide text-[10px] mb-1">Associated Diseases</h4>
                  <div className="text-slate-600 dark:text-slate-400">{renderMarkdown(aiExplanation.diseases)}</div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide text-[10px] mb-1">Trivia / Facts</h4>
                  <div className="text-slate-600 dark:text-slate-400 italic">"{renderMarkdown(aiExplanation.facts)}"</div>
                </div>
              </div>
            ) : null
          ) : (
            <div className="space-y-4 text-xs leading-relaxed">
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide text-[10px] mb-0.5">Description</h4>
                <p className="text-slate-600 dark:text-slate-400">{activeDetails.description}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide text-[10px] mb-0.5">Function</h4>
                <p className="text-slate-600 dark:text-slate-400">{activeDetails.function}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide text-[10px] mb-0.5">Clinical Importance</h4>
                <p className="text-slate-600 dark:text-slate-400">{activeDetails.clinical}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wide text-[10px] mb-0.5">Facts</h4>
                <p className="text-slate-600 dark:text-slate-400 italic">"{activeDetails.facts}"</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex-shrink-0">
        {activeSource === 'ai' ? (
          <button 
            onClick={() => {
              stop();
              setActiveSource('static');
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition-all"
          >
            <ArrowLeft size={12} />
            Default Guide
          </button>
        ) : (
          <button 
            onClick={handleAIDeepDive}
            disabled={!selectedMeshInfo}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-[10px] font-bold transition-all ${
              selectedMeshInfo 
                ? 'bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-dark cursor-pointer' 
                : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-750 cursor-not-allowed opacity-50'
            }`}
          >
            <BrainCircuit size={12} />
            AI Explain
          </button>
        )}
        <button 
          onClick={() => navigate('/dashboard/quiz')}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent dark:text-accent-dark text-[10px] font-bold transition-all"
        >
          <HelpCircle size={12} />
          Quiz Me
        </button>
      </div>
    </aside>
  );
}
