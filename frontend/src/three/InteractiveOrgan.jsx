import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

// Labeled parts for the fallback procedural model
const FALLBACK_PARTS = [
  { name: 'Aorta', color: '#E11D48', pos: [-0.1, 0.9, 0.1], scale: [0.25, 0.8, 0.25], shape: 'cylinder', rot: [0.2, 0, -0.3] },
  { name: 'Left_Ventricle', color: '#9F1239', pos: [-0.35, -0.3, 0], scale: [0.55, 0.7, 0.55], shape: 'sphere', rot: [0, 0, 0.1] },
  { name: 'Right_Ventricle', color: '#BE123C', pos: [0.3, -0.4, 0.1], scale: [0.5, 0.65, 0.5], shape: 'sphere', rot: [0, 0, -0.15] },
  { name: 'Left_Atrium', color: '#FDA4AF', pos: [-0.4, 0.4, -0.1], scale: [0.4, 0.4, 0.4], shape: 'sphere', rot: [0, 0, 0] },
  { name: 'Right_Atrium', color: '#FECDD3', pos: [0.45, 0.3, 0], scale: [0.38, 0.38, 0.38], shape: 'sphere', rot: [0, 0, 0] },
  { name: 'Pulmonary_Artery', color: '#2563EB', pos: [-0.35, 0.7, 0.35], scale: [0.18, 0.7, 0.18], shape: 'cylinder', rot: [0.3, 0.2, 0.1] },
  { name: 'Superior_Vena_Cava', color: '#1D4ED8', pos: [0.35, 0.8, -0.2], scale: [0.15, 0.8, 0.15], shape: 'cylinder', rot: [-0.1, 0, -0.2] }
];

export default function InteractiveOrgan({ 
  modelPath = '/models/heart.glb', 
  selectedPart, 
  onSelectPart,
  explosionFactor = 0,
  wireframe = false
}) {
  const groupRef = useRef();
  const { camera } = useThree();
  
  const [hoveredPart, setHoveredPart] = useState(null);
  const [useFallback, setUseFallback] = useState(false);
  const [loadedMeshes, setLoadedMeshes] = useState([]);
  const meshDataRef = useRef([]);

  // Attemp to pre-load GLB model, fallback if it does not exist or fails
  let gltf = null;
  try {
    gltf = useGLTF(modelPath);
  } catch (err) {
    // Suppressed: falls back dynamically
  }

  useEffect(() => {
    if (gltf?.scene) {
      setUseFallback(false);
      const meshesList = [];
      const data = [];
      
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = new THREE.Vector3();
      box.getCenter(center);

      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          const originalPos = child.position.clone();
          const meshWorldPos = new THREE.Vector3();
          child.getWorldPosition(meshWorldPos);
          
          const direction = new THREE.Vector3().subVectors(meshWorldPos, center).normalize();
          if (direction.lengthSq() < 0.01) {
            direction.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
          }

          meshesList.push(child.name);
          data.push({
            name: child.name,
            mesh: child,
            originalPos,
            direction,
            originalColor: child.material.color.getHex()
          });
        }
      });
      
      setLoadedMeshes(meshesList);
      meshDataRef.current = data;
    } else {
      setUseFallback(true);
      // Initialize fallback data
      const data = [];
      FALLBACK_PARTS.forEach((part) => {
        data.push({
          name: part.name,
          originalPos: new THREE.Vector3(...part.pos),
          direction: new THREE.Vector3(...part.pos).normalize(),
          originalColor: parseInt(part.color.replace('#', '0x'))
        });
      });
      meshDataRef.current = data;
      setLoadedMeshes(FALLBACK_PARTS.map(p => p.name));
    }
  }, [gltf]);

  // Listen to explosion slider (explosionFactor changes)
  useEffect(() => {
    if (!meshDataRef.current.length) return;

    meshDataRef.current.forEach((item) => {
      // Find the actual 3D object reference inside the group (works for both GLB and Fallback)
      const obj = groupRef.current?.getObjectByName(item.name);
      if (obj) {
        const targetPos = item.originalPos.clone().add(
          item.direction.clone().multiplyScalar(explosionFactor * 1.5)
        );

        gsap.to(obj.position, {
          x: targetPos.x,
          y: targetPos.y,
          z: targetPos.z,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    });
  }, [explosionFactor]);

  // Listen for search / detail click highlights and zoom focuses
  useEffect(() => {
    if (!selectedPart || !meshDataRef.current.length) return;

    const item = meshDataRef.current.find(m => m.name.toLowerCase() === selectedPart.toLowerCase());
    if (item) {
      const obj = groupRef.current?.getObjectByName(item.name);
      if (obj) {
        // Smoothly focus camera coordinates on target mesh
        const worldPos = new THREE.Vector3();
        obj.getWorldPosition(worldPos);
        
        gsap.to(camera.position, {
          x: worldPos.x * 1.5,
          y: worldPos.y * 1.5,
          z: worldPos.z + 2.5,
          duration: 1.0,
          ease: 'power3.out'
        });
      }
    }
  }, [selectedPart, camera]);

  const handlePointerOver = (e, name) => {
    e.stopPropagation();
    setHoveredPart(name);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHoveredPart(null);
    document.body.style.cursor = 'default';
  };

  const handlePointerDown = (e, name) => {
    e.stopPropagation();
    onSelectPart(name);
  };

  const getMeshColor = (name, baseHex) => {
    if (selectedPart && selectedPart.toLowerCase() === name.toLowerCase()) {
      return '#14B8A6'; // Theme accent glow/color
    }
    if (hoveredPart === name) {
      return '#2563EB'; // Hover highlighting
    }
    return baseHex;
  };

  if (useFallback) {
    return (
      <group ref={groupRef}>
        {FALLBACK_PARTS.map((part) => (
          <mesh
            key={part.name}
            name={part.name}
            position={part.pos}
            rotation={part.rot || [0, 0, 0]}
            onPointerOver={(e) => handlePointerOver(e, part.name)}
            onPointerOut={handlePointerOut}
            onPointerDown={(e) => handlePointerDown(e, part.name)}
          >
            {part.shape === 'sphere' ? (
              <sphereGeometry args={[part.scale[0], 32, 32]} />
            ) : (
              <cylinderGeometry args={[part.scale[0], part.scale[0], part.scale[1], 32]} />
            )}
            <meshStandardMaterial
              color={getMeshColor(part.name, part.color)}
              wireframe={wireframe}
              roughness={0.3}
              metalness={0.1}
            />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group ref={groupRef}>
      <primitive 
        object={gltf.scene} 
        onClick={(e) => {
          e.stopPropagation();
          if (e.object?.name) {
            onSelectPart(e.object.name);
          }
        }}
      />
    </group>
  );
}
