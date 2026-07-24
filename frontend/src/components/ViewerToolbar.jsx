import React from 'react';
import { 
  RotateCw, 
  Compass, 
  Grid3X3, 
  RefreshCcw, 
  Maximize2, 
  Minimize2,
  Flame
} from 'lucide-react';

export default function ViewerToolbar({
  autoRotate,
  setAutoRotate,
  wireframe,
  setWireframe,
  showGrid,
  setShowGrid,
  handleReset,
  toggleFullscreen,
  isFullscreen,
  explosionFactor,
  handleSliderChange,
  handleExplode,
  handleAssemble
}) {
  return (
    <div className="absolute bottom-4 left-4 right-4 flex flex-col md:flex-row justify-between items-center gap-3.5 z-10 pointer-events-none">
      
      {/* Visual Camera Toolbar */}
      <div className="flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 pointer-events-auto shadow-lg">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title="Toggle Auto Rotate"
          className={`p-2.5 rounded-xl transition-all ${autoRotate ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <RotateCw size={16} />
        </button>

        <button
          onClick={() => setWireframe(!wireframe)}
          title="Toggle Wireframe"
          className={`p-2.5 rounded-xl transition-all ${wireframe ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Compass size={16} />
        </button>

        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid Helper"
          className={`p-2.5 rounded-xl transition-all ${showGrid ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
        >
          <Grid3X3 size={16} />
        </button>

        <button
          onClick={handleReset}
          title="Reset View & Deselect"
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <RefreshCcw size={16} />
        </button>

        <button
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border-l border-white/5 pl-3 transition-all"
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Explosion Control Overlay */}
      <div className="flex items-center gap-3.5 bg-slate-900/85 backdrop-blur-md p-3.5 rounded-2xl border border-white/5 pointer-events-auto shadow-lg">
        <div className="flex items-center gap-2 text-slate-350 select-none">
          <Flame size={14} className="text-primary animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Exploded View</span>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExplode}
            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[10px] font-bold transition-all shadow-md shadow-primary/20"
          >
            Explode
          </button>
          <button
            onClick={handleAssemble}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-all"
          >
            Assemble
          </button>
          <div className="flex items-center gap-2">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={explosionFactor}
              onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
              className="accent-primary h-1 bg-slate-750 rounded-lg appearance-none cursor-pointer w-24"
            />
            <span className="text-[10px] font-mono font-bold text-slate-400 w-8 text-right">
              {Math.round(explosionFactor * 100)}%
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
