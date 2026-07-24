import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import HeartModel from './HeartModel';
import { useSelectedMesh } from '@contexts/SelectedMeshContext';

function CameraRig({ resetTrigger }) {
  const { camera, controls } = useThree();
  const { selectedMeshInfo } = useSelectedMesh();

  // Reset Camera Viewport
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

  // Focus Camera coordinate zoom on selected mesh bounds
  useEffect(() => {
    if (selectedMeshInfo?.boundingBox) {
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

  return null;
}

export default function HeartViewer({ wireframe, resetTrigger, autoRotate, showGrid }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ antialias: true }}
      className="w-full h-full"
    >
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 10, 5]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.4} />
      <Environment preset="city" />

      <Suspense fallback={null}>
        <HeartModel wireframe={wireframe} />
      </Suspense>

      <CameraRig resetTrigger={resetTrigger} />

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
  );
}
