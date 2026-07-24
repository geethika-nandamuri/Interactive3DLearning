import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModelViewer from '@three/ModelViewer';
import { 
  Search, 
  BrainCircuit, 
  HelpCircle,
  Flame,
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { useSelectedMesh } from '@contexts/SelectedMeshContext';
import { fetchAIExplanation } from '@services/aiService';
import { useSpeech } from '@hooks/useSpeech';
import { completeLesson } from '@services/progressService';
import gsap from 'gsap';

const HEART_DETAILS = {
  aorta: {
    name: 'Aorta',
    description: 'The largest artery in the human body, originating from the left ventricle of the heart.',
    function: 'Distributes oxygenated blood to all parts of the body through systemic circulation.',
    clinical: 'Susceptible to aneurysms or dissections, which are life-threatening conditions requiring emergency surgery.',
    facts: 'The aorta is almost as thick as a garden hose in adults!'
  },
  left_ventricle: {
    name: 'Left Ventricle',
    description: 'One of four chambers, located in the lower left portion of the heart below the left atrium.',
    function: 'Pumps oxygenated blood to the entire body via the aorta under high pressure.',
    clinical: 'Left ventricular hypertrophy (thickening) can occur due to chronic high blood pressure.',
    facts: 'The muscle wall of the left ventricle is about three times thicker than the right ventricle!'
  },
  right_ventricle: {
    name: 'Right Ventricle',
    description: 'The chamber in the lower right portion of the heart, adjacent to the left ventricle.',
    function: 'Pumps oxygen-poor blood to the lungs through the pulmonary artery for re-oxygenation.',
    clinical: 'Right-sided heart failure can cause fluid build-up in the abdomen and legs.',
    facts: 'It pumps the exact same volume of blood as the left ventricle, but under much lower pressure.'
  },
  left_atrium: {
    name: 'Left Atrium',
    description: 'One of the two upper chambers of the heart, located on the left side.',
    function: 'Receives oxygenated blood returning from the lungs via the pulmonary veins.',
    clinical: 'Atrial fibrillation commonly originates in the left atrium, increasing stroke risk.',
    facts: 'Oxygenated blood pooling here waits for the mitral valve to open before dropping to the ventricle.'
  },
  right_atrium: {
    name: 'Right Atrium',
    description: 'The upper right chamber of the heart.',
    function: 'Receives oxygen-depleted blood from the body tissues through the superior and inferior vena cava.',
    clinical: 'Houses the Sinoatrial (SA) node, the heart\'s natural pacemaker.',
    facts: 'The right atrium receives blood from both the top and bottom halves of your body simultaneously.'
  },
  pulmonary_artery: {
    name: 'Pulmonary Artery',
    description: 'The vessel emerging from the right ventricle that splits into left and right branches.',
    function: 'Transports deoxygenated blood from the heart to the lungs.',
    clinical: 'Pulmonary embolism occurs when a blood clot blocks this artery, which can be fatal.',
    facts: 'It is the only artery in the human body that carries oxygen-depleted (blue) blood.'
  },
  superior_vena_cava: {
    name: 'Superior Vena Cava',
    description: 'A large, short vein that empties into the right atrium.',
    function: 'Returns deoxygenated blood from the upper half of the body (head, neck, arms, chest) to the heart.',
    clinical: 'Superior Vena Cava Syndrome occurs when blood flow through this vein is blocked or compressed.',
    facts: 'It handles about one-third of the total venous return to the heart.'
  }
};

const AnatomyPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { 
    selectedMeshInfo, 
    selectMesh, 
    availableMeshes, 
    explosionFactor, 
    setExplosionFactor 
  } = useSelectedMesh();

  // AI Diagnostic states
  const [activeSource, setActiveSource] = useState('static'); // 'static' | 'ai'
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);

  // Speech Narrator Custom Hook
  const {
    voices,
    selectedVoiceName,
    setSelectedVoiceName,
    isPlaying,
    isPaused,
    rate,
    setRate,
    speak,
    pause,
    resume,
    stop
  } = useSpeech();

  // Reset AI and stop narrator when selection changes
  useEffect(() => {
    setActiveSource('static');
    setAiExplanation(null);
    setAiError(null);
    stop();
  }, [selectedMeshInfo]);

  // Log lesson completion to database when a structure is selected
  useEffect(() => {
    if (selectedMeshInfo?.name) {
      completeLesson(selectedMeshInfo.name).catch((err) =>
        console.error('Failed to log completed lesson:', err.message)
      );
    }
  }, [selectedMeshInfo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    
    // Find matching mesh in our dynamically discovered list
    const found = availableMeshes.find(
      m => m.name.toLowerCase() === query || 
           m.name.toLowerCase().replace(/_/g, ' ') === query ||
           m.name.toLowerCase().replace(/ /g, '_') === query
    );

    if (found) {
      selectMesh(found);
    } else {
      alert(`Structure "${searchQuery}" not found. Try: Aorta, Left Ventricle, Pulmonary Artery`);
    }
  };

  // Explode / Assemble GSAP actions
  const handleExplode = () => {
    const tempObj = { value: explosionFactor };
    gsap.to(tempObj, {
      value: 1.0,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => setExplosionFactor(tempObj.value)
    });
  };

  const handleAssemble = () => {
    const tempObj = { value: explosionFactor };
    gsap.to(tempObj, {
      value: 0.0,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => setExplosionFactor(tempObj.value)
    });
  };

  // Trigger backend AI analysis
  const handleAIDeepDive = async () => {
    if (!selectedMeshInfo) return;
    
    setAiLoading(true);
    setAiError(null);
    setActiveSource('ai');
    stop(); // stop any current narration

    try {
      const data = await fetchAIExplanation(selectedMeshInfo.name);
      if (data.success && data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        throw new Error(data.error || 'Unable to retrieve anatomical context.');
      }
    } catch (err) {
      setAiError(err.message || 'Failed to contact Gemini API server.');
    } finally {
      setAiLoading(false);
    }
  };

  // Narrator Speech Trigger
  const handleStartSpeaking = () => {
    const textToSpeak = activeSource === 'ai' && aiExplanation
      ? `${aiExplanation.name || selectedMeshInfo.name}. Description: ${aiExplanation.description || ''}. Function: ${aiExplanation.function || ''}. Clinical Significance: ${aiExplanation.clinicalImportance || ''}`
      : `${activeDetails.name}. Description: ${activeDetails.description}. Function: ${activeDetails.function}. Clinical Importance: ${activeDetails.clinical}`;
    
    speak(textToSpeak);
  };

  // Simple Markdown Formatter Helper
  const formatInlineMarkdown = (text) => {
    if (!text) return '';
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    const renderedElements = [];
    let currentList = [];

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const itemContent = trimmed.replace(/^[-*]\s+/, '');
        currentList.push(
          <li key={`li-${idx}`} className="text-slate-650 dark:text-slate-400">
            {formatInlineMarkdown(itemContent)}
          </li>
        );
      } else {
        if (currentList.length > 0) {
          renderedElements.push(
            <ul key={`ul-${idx}`} className="list-disc pl-5 my-2 space-y-1">
              {currentList}
            </ul>
          );
          currentList = [];
        }

        if (trimmed) {
          renderedElements.push(
            <p key={`p-${idx}`} className="mb-2 text-slate-650 dark:text-slate-400 leading-relaxed font-sans">
              {formatInlineMarkdown(trimmed)}
            </p>
          );
        }
      }
    });

    if (currentList.length > 0) {
      renderedElements.push(
        <ul key="ul-final" className="list-disc pl-5 my-2 space-y-1">
          {currentList}
        </ul>
      );
    }

    return renderedElements;
  };

  // Determine active details
  let activeDetails = {
    name: 'Anatomy Guide',
    description: 'Click on any structural mesh part of the 3D model to inspect its spatial coordinates, details, and functions.',
    function: 'Use the left mouse button to rotate the model, scroll to zoom, and right button to pan.',
    clinical: 'Toggle Grid, Wireframe, or Auto Rotate in the bottom left toolbar controls to enhance visualization.',
    facts: 'You can search for specific anatomical names (e.g. Aorta) in the sidebar search box.'
  };

  if (selectedMeshInfo && activeSource === 'static') {
    const key = selectedMeshInfo.name.toLowerCase().replace(/ /g, '_');
    if (HEART_DETAILS[key]) {
      activeDetails = HEART_DETAILS[key];
    } else {
      activeDetails = {
        name: selectedMeshInfo.name,
        description: `This is a dynamically detected mesh named "${selectedMeshInfo.name}" inside the 3D model.`,
        function: `Spatial coordinates of the center point are: X: ${selectedMeshInfo.center.x.toFixed(3)}, Y: ${selectedMeshInfo.center.y.toFixed(3)}, Z: ${selectedMeshInfo.center.z.toFixed(3)}.`,
        clinical: `Its calculated bounding size is: Width: ${selectedMeshInfo.size.x.toFixed(3)}, Height: ${selectedMeshInfo.size.y.toFixed(3)}, Depth: ${selectedMeshInfo.size.z.toFixed(3)}.`,
        facts: `This mesh is rendered as a ${selectedMeshInfo.materialType}. Use the AI controls to trigger automated learning reports.`
      };
    }
  }

  return (
    <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-10rem)] font-sans relative">
      {/* 3D Canvas Area */}
      <div className="lg:col-span-8 flex flex-col gap-4 h-full">
        <div className="flex-1 min-h-[350px]">
          <ModelViewer model="heart" />
        </div>

        {/* Explosion control panel */}
        <div className="card-theme p-5 rounded-2xl flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
              <Flame size={16} className="text-primary animate-pulse" />
              <span className="text-sm font-bold">
                Exploded View
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExplode}
                className="px-4 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-dark text-xs font-bold transition-all"
              >
                Explode
              </button>
              <button
                onClick={handleAssemble}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                Assemble
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={explosionFactor}
              onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
              className="flex-1 accent-primary h-1.5 bg-slate-200 dark:bg-slate-855 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-500 w-10 text-right">
              {Math.round(explosionFactor * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Information Panel Area */}
      <div className="lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto pr-2">
        {/* Anatomical search */}
        <div className="card-theme p-4 rounded-2xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search structure (e.g. Aorta)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-primary transition-colors"
            />
          </form>
        </div>

        {/* Structure Info Card */}
        <div className="card-theme p-6 rounded-2xl flex-1 flex flex-col justify-between min-h-[300px]">
          <div>
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                  {activeSource === 'ai' ? 'AI Diagnostic Report' : selectedMeshInfo ? 'Selected Structure' : 'General Guide'}
                </span>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                  {activeSource === 'ai' ? aiExplanation?.name || selectedMeshInfo?.name : activeDetails.name}
                </h3>
              </div>
            </div>

            {/* Speech synthesis controller inside Information Panel */}
            {selectedMeshInfo && !aiLoading && !aiError && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/80 space-y-3.5 shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    Narrator Settings
                  </span>
                  {isPlaying && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-accent animate-ping" />
                  )}
                </div>

                <div className="flex gap-2">
                  {!isPlaying ? (
                    <button
                      onClick={handleStartSpeaking}
                      className="flex-1 py-2 px-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all shadow-md shadow-primary/10"
                    >
                      Speak
                    </button>
                  ) : isPaused ? (
                    <button
                      onClick={resume}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={pause}
                      className="flex-1 py-2 px-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold transition-all"
                    >
                      Pause
                    </button>
                  )}

                  {isPlaying && (
                    <button
                      onClick={stop}
                      className="py-2 px-4 rounded-xl bg-red-500 hover:bg-red-655 text-white text-xs font-bold transition-all"
                    >
                      Stop
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-3 border-t border-slate-200/50 dark:border-slate-800/50">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Voice Actor</label>
                    <select
                      value={selectedVoiceName}
                      onChange={(e) => setSelectedVoiceName(e.target.value)}
                      className="w-full text-[10px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg p-1.5 focus:outline-none"
                    >
                      {voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name.split(' - ')[0]} ({voice.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      <span>Rate speed</span>
                      <span className="font-mono font-bold text-primary">{rate.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.8"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-full accent-primary h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Body Content */}
            <div className="overflow-y-auto max-h-[40vh] pr-1">
              {activeSource === 'ai' ? (
                // AI State Render
                aiLoading ? (
                  <div className="flex flex-col items-center justify-center h-48 space-y-4">
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <p className="text-xs text-slate-400 font-bold tracking-wider uppercase animate-pulse">
                      Querying Gemini API...
                    </p>
                  </div>
                ) : aiError ? (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={18} />
                      <span className="font-bold text-sm">Service Error</span>
                    </div>
                    <p className="text-xs leading-relaxed">{aiError}</p>
                    <button
                      onClick={handleAIDeepDive}
                      className="px-3.5 py-1.5 rounded-lg bg-red-500 text-white font-bold text-xs hover:bg-red-600 transition-colors"
                    >
                      Retry Query
                  </button>
                </div>
              ) : aiExplanation ? (
                <div className="space-y-4 text-sm leading-relaxed font-sans">
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider text-xs mb-1">Description</h4>
                    <div className="text-slate-655 dark:text-slate-400">{renderMarkdown(aiExplanation.description)}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider text-xs mb-1">Biological Function</h4>
                    <div className="text-slate-655 dark:text-slate-400">{renderMarkdown(aiExplanation.function)}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider text-xs mb-1">Clinical Significance</h4>
                    <div className="text-slate-655 dark:text-slate-400">{renderMarkdown(aiExplanation.clinicalImportance)}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider text-xs mb-1">Associated Pathologies</h4>
                    <div className="text-slate-655 dark:text-slate-400">{renderMarkdown(aiExplanation.diseases)}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-700 dark:text-slate-350 uppercase tracking-wider text-xs mb-1">Anatomical Trivia</h4>
                    <div className="text-slate-655 dark:text-slate-400 italic">"{renderMarkdown(aiExplanation.facts)}"</div>
                  </div>
                </div>
              ) : null
            ) : (
              // Static State Render
              <div className="space-y-4 text-sm leading-relaxed">
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs mb-1">Description</h4>
                  <p className="text-slate-600 dark:text-slate-400">{activeDetails.description}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs mb-1">
                    {selectedMeshInfo ? 'Biological Function' : 'How to Navigate'}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">{activeDetails.function}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs mb-1">
                    {selectedMeshInfo ? 'Clinical Importance' : 'Learning Resources'}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400">{activeDetails.clinical}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-xs mb-1">
                    {selectedMeshInfo ? 'Dynamic Fact' : 'Quick Tip'}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-400 italic">"{activeDetails.facts}"</p>
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Action Callouts */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
            {activeSource === 'ai' ? (
              <button 
                onClick={() => {
                  stop();
                  setActiveSource('static');
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
              >
                <ArrowLeft size={14} />
                Return to Guide
              </button>
            ) : (
              <button 
                onClick={handleAIDeepDive}
                disabled={!selectedMeshInfo}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${
                  selectedMeshInfo 
                    ? 'bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-dark cursor-pointer' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-700 cursor-not-allowed opacity-50'
                }`}
              >
                <BrainCircuit size={14} />
                AI Deep Dive
              </button>
            )}
            <button 
              onClick={() => navigate('/dashboard/quiz')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-accent/10 hover:bg-accent/20 text-accent dark:text-accent-dark text-xs font-bold transition-colors cursor-pointer"
            >
              <HelpCircle size={14} />
              Quiz Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnatomyPage;
