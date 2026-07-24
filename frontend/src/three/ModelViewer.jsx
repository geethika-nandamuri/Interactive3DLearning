import React, { useState, useRef, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Grid, 
  Center, 
  useGLTF, 
  Html, 
  useProgress, 
  Environment 
} from '@react-three/drei';
import { 
  RotateCw, 
  Compass, 
  Grid3X3, 
  RefreshCcw, 
  Maximize2, 
  Minimize2,
  Box,
  Flame
} from 'lucide-react';
import * as THREE from 'three';
import gsap from 'gsap';
import { useSelectedMesh } from '@contexts/SelectedMeshContext';

// HTML Custom Loading Spinner inside the R3F Canvas
function CanvasLoader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center justify-center p-6 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-40 text-center select-none font-sans">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-slate-700/50 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-sm font-bold text-white font-mono mt-4">
          {Math.round(progress)}%
        </p>
        <p className="text-[10px] text-slate-400 font-extrabold tracking-widest uppercase mt-1">
          Loading Model
        </p>
      </div>
    </Html>
  );
}

// GSAP Camera Controller for Smooth Resets
function CameraController({ resetTrigger }) {
  const { camera, controls } = useThree();
  
  useEffect(() => {
    if (resetTrigger > 0) {
      gsap.to(camera.position, {
        x: 0,
        y: 0,
        z: 4,
        duration: 0.8,
        ease: 'power2.out'
      });

      if (controls) {
        gsap.to(controls.target, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.8,
          ease: 'power2.out',
          onUpdate: () => controls.update()
        });
      }
    }
  }, [resetTrigger, camera, controls]);

  return null;
}

// Inner model loader that handles mesh traversals, hover glows, selections, and camera zooms
function ModelLoader({ modelName, wireframe, originalPositionsRef, isAnimating }) {
  const modelPath = `/models/${modelName}.glb`;
  const { scene } = useGLTF(modelPath);
  const { camera, controls } = useThree();
  const { selectedMeshInfo, selectMesh, availableMeshes, setAvailableMeshes, explosionFactor } = useSelectedMesh();
  const originalMaterialsRef = useRef(new Map());
  const [hasMeshes, setHasMeshes] = useState(true);

  // Traverse scene and cache original material variables
  useEffect(() => {
    if (!scene) return;
    
    originalMaterialsRef.current.clear();
    const meshesList = [];
    const geometryCenters = [];

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Cache original position strictly once
        if (!originalPositionsRef.current.has(child.uuid)) {
          originalPositionsRef.current.set(child.uuid, child.position.clone());
        }

        if (child.material) {
          originalMaterialsRef.current.set(child.uuid, {
            color: child.material.color ? child.material.color.clone() : new THREE.Color(1, 1, 1),
            emissive: child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0, 0, 0),
            emissiveIntensity: child.material.emissiveIntensity || 0
          });
          child.material.wireframe = wireframe;
        }

        const geomCenter = new THREE.Vector3();
        if (child.geometry) {
          if (!child.geometry.boundingBox) {
            child.geometry.computeBoundingBox();
          }
          if (child.geometry.boundingBox) {
            child.geometry.boundingBox.getCenter(geomCenter);
          }
        }
        geomCenter.applyMatrix4(child.matrix);

        geometryCenters.push({
          mesh: child,
          geomCenter
        });
      }
    });

    if (geometryCenters.length === 0) {
      setHasMeshes(false);
      return;
    } else {
      setHasMeshes(true);
    }

    const localModelCenter = new THREE.Vector3();
    if (geometryCenters.length > 0) {
      geometryCenters.forEach(gc => localModelCenter.add(gc.geomCenter));
      localModelCenter.divideScalar(geometryCenters.length);
    }

    geometryCenters.forEach(({ mesh, geomCenter }) => {
      const originalPos = originalPositionsRef.current.get(mesh.uuid) || mesh.position.clone();
      const direction = new THREE.Vector3().subVectors(geomCenter, localModelCenter).normalize();
      
      if (direction.lengthSq() < 0.01) {
        direction.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      }

      const box = new THREE.Box3().setFromObject(mesh);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);

      meshesList.push({
        mesh,
        uuid: mesh.uuid,
        name: mesh.name ? mesh.name.replace(/_/g, ' ') : 'Unnamed Structure',
        boundingBox: box,
        center: { x: center.x, y: center.y, z: center.z },
        size: { x: size.x, y: size.y, z: size.z },
        materialType: mesh.material?.type || 'MeshStandardMaterial',
        originalPos,
        direction,
        originalMaterial: originalMaterialsRef.current.get(mesh.uuid)
      });
    });

    setAvailableMeshes(meshesList);
  }, [scene, wireframe, setAvailableMeshes]);

  // Sync slider drag directly when not running button animations
  useEffect(() => {
    if (isAnimating) return; // Do not overwrite active button animations!
    if (!availableMeshes || !availableMeshes.length) return;

    availableMeshes.forEach((item) => {
      const { mesh, originalPos, direction } = item;
      if (!mesh || !originalPos || !direction) return;
      
      const targetPos = originalPos.clone().add(
        direction.clone().multiplyScalar(explosionFactor * 1.5)
      );
      mesh.position.copy(targetPos);
    });
  }, [explosionFactor, availableMeshes, isAnimating]);

  // Handle highlights when selection context updates
  useEffect(() => {
    if (!scene) return;

    originalMaterialsRef.current.forEach((original, uuid) => {
      const child = scene.getObjectByProperty('uuid', uuid);
      if (child && child.material) {
        child.material.emissive.copy(original.emissive);
        child.material.emissiveIntensity = original.emissiveIntensity;
      }
    });

    if (selectedMeshInfo?.mesh) {
      const selectedMesh = selectedMeshInfo.mesh;
      const matchedObject = scene.getObjectByProperty('uuid', selectedMesh.uuid);
      
      if (matchedObject && matchedObject.material) {
        if (!matchedObject.material.emissive) {
          matchedObject.material.emissive = new THREE.Color(0, 0, 0);
        }
        matchedObject.material.emissive.set('#14B8A6');
        matchedObject.material.emissiveIntensity = 0.9;
      }
    }
  }, [selectedMeshInfo, scene]);

  // Smoothly focus camera coordinates on selected mesh center
  useEffect(() => {
    if (selectedMeshInfo?.mesh && selectedMeshInfo?.boundingBox) {
      const box = selectedMeshInfo.boundingBox;
      const center = new THREE.Vector3();
      box.getCenter(center);

      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      const distance = maxDim * 2.2 || 2.5;

      if (controls) {
        gsap.to(controls.target, {
          x: center.x,
          y: center.y,
          z: center.z,
          duration: 1.0,
          ease: 'power3.out',
          onUpdate: () => controls.update()
        });
      }

      gsap.to(camera.position, {
        x: center.x + distance * 0.6,
        y: center.y + distance * 0.6,
        z: center.z + distance,
        duration: 1.0,
        ease: 'power3.out'
      });
    }
  }, [selectedMeshInfo, camera, controls]);

  const handlePointerOver = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    if (mesh.isMesh) {
      document.body.style.cursor = 'pointer';
      
      if (selectedMeshInfo?.mesh?.uuid !== mesh.uuid && mesh.material) {
        if (!mesh.material.emissive) {
          mesh.material.emissive = new THREE.Color(0, 0, 0);
        }
        mesh.material.emissive.set('#2563EB');
        mesh.material.emissiveIntensity = 0.5;
      }
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    if (mesh.isMesh) {
      document.body.style.cursor = 'default';
      
      if (selectedMeshInfo?.mesh?.uuid !== mesh.uuid && mesh.material) {
        const original = originalMaterialsRef.current.get(mesh.uuid);
        if (original) {
          mesh.material.emissive.copy(original.emissive);
          mesh.material.emissiveIntensity = original.emissiveIntensity;
        }
      }
    }
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    if (mesh.isMesh) {
      const box = new THREE.Box3().setFromObject(mesh);
      const center = new THREE.Vector3();
      box.getCenter(center);
      const size = new THREE.Vector3();
      box.getSize(size);
      
      selectMesh({
        mesh: mesh,
        uuid: mesh.uuid,
        name: mesh.name.replace(/_/g, ' '),
        boundingBox: box,
        center: { x: center.x, y: center.y, z: center.z },
        size: { x: size.x, y: size.y, z: size.z },
        materialType: mesh.material?.type || 'MeshStandardMaterial',
        originalMaterial: originalMaterialsRef.current.get(mesh.uuid)
      });
    }
  };

  if (!hasMeshes) {
    return (
      <Html center>
        <div className="flex flex-col items-center justify-center p-6 bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl w-48 text-center select-none font-sans">
          <p className="text-sm font-bold text-red-400">No meshes found</p>
        </div>
      </Html>
    );
  }

  return (
    <Center>
      <primitive 
        object={scene} 
        scale={2.6}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onPointerDown={handlePointerDown}
      />
    </Center>
  );
}

// Exported Reusable ModelViewer Component
export default function ModelViewer({ model = 'heart' }) {
  const containerRef = useRef();
  const originalPositionsRef = useRef(new Map());
  const [isAnimating, setIsAnimating] = useState(false);
  
  const { 
    clearSelection, 
    availableMeshes, 
    explosionFactor, 
    setExplosionFactor 
  } = useSelectedMesh();
  
  const [autoRotate, setAutoRotate] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleResetCamera = () => {
    clearSelection();
    setResetTrigger(prev => prev + 1);
  };

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

  // Explode animation using GSAP
  const handleExplode = () => {
    if (!availableMeshes || !availableMeshes.length) return;

    // Cancel active tweens to prevent conflicts
    availableMeshes.forEach(item => {
      if (item.mesh) gsap.killTweensOf(item.mesh.position);
    });

    setIsAnimating(true);

    // Tween the explosionFactor state in parallel
    const tempObj = { value: explosionFactor };
    gsap.to(tempObj, {
      value: 1.0,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => setExplosionFactor(tempObj.value)
    });

    // Animate every mesh outward
    let completedCount = 0;
    availableMeshes.forEach((item) => {
      const { mesh, originalPos, direction } = item;
      const targetPos = originalPos.clone().add(
        direction.clone().multiplyScalar(1.5)
      );

      gsap.to(mesh.position, {
        x: targetPos.x,
        y: targetPos.y,
        z: targetPos.z,
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
          completedCount++;
          if (completedCount === availableMeshes.length) {
            setIsAnimating(false);
          }
        }
      });
    });
  };

  // Assemble animation returning meshes back to exact stored positions
  const handleAssemble = () => {
    if (!availableMeshes || !availableMeshes.length) return;

    availableMeshes.forEach(item => {
      if (item.mesh) gsap.killTweensOf(item.mesh.position);
    });

    setIsAnimating(true);

    const tempObj = { value: explosionFactor };
    gsap.to(tempObj, {
      value: 0.0,
      duration: 1.2,
      ease: 'power2.inOut',
      onUpdate: () => setExplosionFactor(tempObj.value)
    });

    let completedCount = 0;
    availableMeshes.forEach((item) => {
      const { mesh, originalPos } = item;

      // Animate back to exact stored original positions
      gsap.to(mesh.position, {
        x: originalPos.x,
        y: originalPos.y,
        z: originalPos.z,
        duration: 1.2,
        ease: 'power2.inOut',
        onComplete: () => {
          completedCount++;
          if (completedCount === availableMeshes.length) {
            setIsAnimating(false);
            // Lock position directly to prevent drifting
            mesh.position.copy(originalPos);
          }
        }
      });
    });
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative bg-slate-950 rounded-3xl overflow-hidden border border-slate-200/10 shadow-glass-dark select-none font-sans"
    >
      {/* 3D R3F Canvas */}
      <div className="absolute inset-0 z-0">
        <Canvas
          shadows
          camera={{ position: [0, 0, 4], fov: 45 }}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
        >
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[5, 10, 5]} 
            intensity={1.2} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
          <directionalLight 
            position={[-5, 5, -5]} 
            intensity={0.4} 
          />

          <Environment preset="city" />

          <Suspense fallback={<CanvasLoader />}>
            <ModelLoader 
              modelName={model} 
              wireframe={wireframe} 
              originalPositionsRef={originalPositionsRef} 
              isAnimating={isAnimating}
            />
          </Suspense>

          <CameraController resetTrigger={resetTrigger} />

          {showGrid && (
            <Grid
              position={[0, -1.8, 0]}
              args={[10, 10]}
              cellSize={0.5}
              cellThickness={0.5}
              cellColor="#475569"
              sectionSize={2}
              sectionThickness={1.0}
              sectionColor="#1e293b"
              fadeDistance={20}
              infiniteGrid
            />
          )}

          <OrbitControls 
            makeDefault 
            autoRotate={autoRotate}
            autoRotateSpeed={1.0}
            enableDamping
            dampingFactor={0.05}
            minDistance={1.5}
            maxDistance={8}
          />
        </Canvas>
      </div>

      {/* Floating Header Banner */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/5 z-10 pointer-events-none">
        <Box size={14} className="text-primary animate-pulse" />
        <span className="text-[10px] font-bold text-slate-300 tracking-widest uppercase">
          3D {model} Model
        </span>
      </div>

      {/* Floating Action control overlay for Explode / Assemble */}
      <div className="absolute bottom-16 left-4 right-4 md:left-auto md:right-4 flex flex-col md:flex-row items-center gap-3.5 bg-slate-900/85 backdrop-blur-md p-4 rounded-2xl border border-white/5 z-10">
        <div className="flex items-center gap-2 text-slate-350">
          <Flame size={14} className="text-primary animate-pulse" />
          <span className="text-[10px] font-bold tracking-wider uppercase">Exploded View</span>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleExplode}
            className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-[10px] font-bold transition-all shadow-md"
          >
            Explode
          </button>
          <button
            onClick={handleAssemble}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-all"
          >
            Assemble
          </button>
          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01"
              value={explosionFactor}
              onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
              disabled={isAnimating}
              className="accent-primary h-1 bg-slate-750 rounded-lg appearance-none cursor-pointer w-24 disabled:opacity-50"
            />
            <span className="text-[10px] font-mono font-bold text-slate-400 w-8 text-right">
              {Math.round(explosionFactor * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Floating Control Toolbar */}
      <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 z-10">
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
          onClick={handleResetCamera}
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
    </div>
  );
}
