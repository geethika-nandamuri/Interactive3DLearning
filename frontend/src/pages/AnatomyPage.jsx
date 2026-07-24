import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HeartViewer from '@three/HeartViewer';
import ViewerToolbar from '@components/ViewerToolbar';
import AnatomySidebar from '@components/AnatomySidebar';
import InformationPanel from '@components/InformationPanel';
import { Menu, FileText } from 'lucide-react';
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
  const { 
    selectedMeshInfo, 
    selectMesh, 
    availableMeshes,
    clearSelection,
    explosionFactor,
    setExplosionFactor
  } = useSelectedMesh();

  // Search and mobile view toggles
  const [searchQuery, setSearchQuery] = useState('');
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);

  // R3F Viewer option states
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef();

  // AI Diagnostic states
  const [activeSource, setActiveSource] = useState('static'); // 'static' | 'ai'
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);

  // Speech synthesis custom hook
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

  // Listen to selection updates and log completed lessons
  useEffect(() => {
    setActiveSource('static');
    setAiExplanation(null);
    setAiError(null);
    stop();
    
    setIsLeftOpen(false);
    setIsRightOpen(false);

    if (selectedMeshInfo?.name) {
      completeLesson(selectedMeshInfo.name).catch((err) =>
        console.error('Failed to log completed lesson:', err.message)
      );
    }
  }, [selectedMeshInfo]);

  useEffect(() => {
    return () => stop();
  }, []);

  // Sync fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(err => console.error(`Error entering fullscreen: ${err.message}`));
    } else {
      document.exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(err => console.error(`Error exiting fullscreen: ${err.message}`));
    }
  };

  // UNIFIED POSITION CONTROLLERS (Sole components managing mesh position)
  
  // Slider change direct assignment (no delay, no conflicting useEffect loops)
  const handleSliderChange = (val) => {
    setExplosionFactor(val);
    if (!availableMeshes) return;
    availableMeshes.forEach(item => {
      const { mesh, originalPos, direction } = item;
      if (mesh && originalPos && direction) {
        gsap.killTweensOf(mesh.position);
        mesh.position.copy(originalPos).addScaledVector(direction, val * 1.5);
      }
    });
  };

  // Button transitions using GSAP
  const animateExplosion = (targetVal) => {
    if (!availableMeshes || !availableMeshes.length) return;

    // Animate slider value
    const tempObj = { value: explosionFactor };
    gsap.to(tempObj, {
      value: targetVal,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => setExplosionFactor(tempObj.value)
    });

    // Animate mesh positions
    availableMeshes.forEach(item => {
      const { mesh, originalPos, direction } = item;
      if (mesh && originalPos && direction) {
        gsap.killTweensOf(mesh.position);
        const targetPos = originalPos.clone().addScaledVector(direction, targetVal * 1.5);
        
        gsap.to(mesh.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 1.2,
          ease: 'power2.inOut',
          onComplete: () => {
            if (targetVal === 0) {
              mesh.position.copy(originalPos); // Zero-drift copy lock
            }
          }
        });
      }
    });
  };

  const handleExplode = () => animateExplosion(1.0);
  const handleAssemble = () => animateExplosion(0.0);
  const handleReset = () => {
    clearSelection();
    setResetTrigger(prev => prev + 1);
  };

  const handleAIDeepDive = async () => {
    if (!selectedMeshInfo) return;
    
    setAiLoading(true);
    setAiError(null);
    setActiveSource('ai');
    stop();

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

  const handleStartSpeaking = () => {
    const textToSpeak = activeSource === 'ai' && aiExplanation
      ? `${aiExplanation.name || selectedMeshInfo.name}. Description: ${aiExplanation.description || ''}. Function: ${aiExplanation.function || ''}. Clinical Significance: ${aiExplanation.clinicalImportance || ''}`
      : `${activeDetails.name}. Description: ${activeDetails.description}. Function: ${activeDetails.function}. Clinical Importance: ${activeDetails.clinical}`;
    
    speak(textToSpeak);
  };

  // Inline markdown renderer helper
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
          <li key={`li-${idx}`} className="text-slate-655 dark:text-slate-400">
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
            <p key={`p-${idx}`} className="mb-2 text-slate-655 dark:text-slate-400 leading-relaxed font-sans">
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
    <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden relative font-sans text-slate-800 dark:text-slate-100">
      
      {/* LEFT SIDEBAR (25%) */}
      <AnatomySidebar isLeftOpen={isLeftOpen} onClose={() => setIsLeftOpen(false)} />

      {/* CENTER VIEWPORT CONTAINER (55%) */}
      <main ref={containerRef} className="flex-1 h-full flex flex-col relative min-w-0">
        
        {/* Mobile Viewport drawers toggles */}
        <div className="absolute top-4 right-4 flex gap-2 z-20 lg:hidden">
          <button
            onClick={() => {
              setIsLeftOpen(prev => !prev);
              setIsRightOpen(false);
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white shadow-lg flex items-center gap-1.5"
          >
            <Menu size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Parts</span>
          </button>
          <button
            onClick={() => {
              setIsRightOpen(prev => !prev);
              setIsLeftOpen(false);
            }}
            className="p-2.5 rounded-xl bg-slate-900/80 backdrop-blur-md border border-white/10 text-white shadow-lg flex items-center gap-1.5"
          >
            <FileText size={16} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Info</span>
          </button>
        </div>

        {/* 3D Heart Canvas */}
        <div className="flex-1 w-full h-full relative">
          <HeartViewer
            wireframe={wireframe}
            resetTrigger={resetTrigger}
            autoRotate={autoRotate}
            showGrid={showGrid}
          />

          {/* Floating Viewer Toolbar */}
          <ViewerToolbar
            autoRotate={autoRotate}
            setAutoRotate={setAutoRotate}
            wireframe={wireframe}
            setWireframe={setWireframe}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            handleReset={handleReset}
            toggleFullscreen={toggleFullscreen}
            isFullscreen={isFullscreen}
            explosionFactor={explosionFactor}
            handleSliderChange={handleSliderChange}
            handleExplode={handleExplode}
            handleAssemble={handleAssemble}
          />
        </div>
      </main>

      {/* RIGHT INFORMATION PANEL (20%) */}
      <InformationPanel
        selectedMeshInfo={selectedMeshInfo}
        activeSource={activeSource}
        setActiveSource={setActiveSource}
        aiLoading={aiLoading}
        aiError={aiError}
        aiExplanation={aiExplanation}
        activeDetails={activeDetails}
        handleAIDeepDive={handleAIDeepDive}
        handleStartSpeaking={handleStartSpeaking}
        isPlaying={isPlaying}
        isPaused={isPaused}
        resume={resume}
        pause={pause}
        stop={stop}
        voices={voices}
        selectedVoiceName={selectedVoiceName}
        setSelectedVoiceName={setSelectedVoiceName}
        rate={rate}
        setRate={setRate}
        renderMarkdown={renderMarkdown}
        isRightOpen={isRightOpen}
        onClose={() => setIsRightOpen(false)}
        navigate={navigate}
      />

    </div>
  );
};

export default AnatomyPage;
