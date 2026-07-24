import React, { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useSelectedMesh } from '@contexts/SelectedMeshContext';

export default function HeartModel({ wireframe }) {
  const { scene } = useGLTF('/models/heart.glb');
  const { selectedMeshInfo, selectMesh, availableMeshes, setAvailableMeshes } = useSelectedMesh();
  const originalPositionsRef = useRef(new Map());

  // Discovery and caching loop (runs strictly once on model load)
  useEffect(() => {
    if (!scene) return;

    const meshesList = [];
    const geometryCenters = [];

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          child.material.wireframe = wireframe;
        }

        // Cache original position strictly once
        if (!originalPositionsRef.current.has(child.uuid)) {
          originalPositionsRef.current.set(child.uuid, child.position.clone());
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

    const localModelCenter = new THREE.Vector3();
    if (geometryCenters.length > 0) {
      geometryCenters.forEach(gc => localModelCenter.add(gc.geomCenter));
      localModelCenter.divideScalar(geometryCenters.length);
    }

    geometryCenters.forEach(({ mesh, geomCenter }) => {
      const originalPos = originalPositionsRef.current.get(mesh.uuid);
      
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
        direction
      });
    });

    setAvailableMeshes(meshesList);
  }, [scene, setAvailableMeshes]);

  // Highlight and hover visual glow controllers
  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        if (!child.userData.originalEmissive) {
          child.userData.originalEmissive = child.material.emissive ? child.material.emissive.clone() : new THREE.Color(0, 0, 0);
          child.userData.originalEmissiveIntensity = child.material.emissiveIntensity || 0;
        }

        if (selectedMeshInfo?.uuid === child.uuid) {
          child.material.emissive.set('#14B8A6'); // Teal Selected glow
          child.material.emissiveIntensity = 0.9;
        } else {
          child.material.emissive.copy(child.userData.originalEmissive);
          child.material.emissiveIntensity = child.userData.originalEmissiveIntensity;
        }
      }
    });
  }, [selectedMeshInfo, scene]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    if (mesh.isMesh) {
      const matched = availableMeshes.find(m => m.uuid === mesh.uuid);
      if (matched) {
        selectMesh(matched);
      }
    }
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    if (mesh.isMesh) {
      document.body.style.cursor = 'pointer';
      if (selectedMeshInfo?.uuid !== mesh.uuid && mesh.material) {
        mesh.material.emissive.set('#2563EB'); // Blue hover theme glow
        mesh.material.emissiveIntensity = 0.5;
      }
    }
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    const mesh = e.object;
    if (mesh.isMesh) {
      document.body.style.cursor = 'default';
      if (selectedMeshInfo?.uuid !== mesh.uuid && mesh.material && mesh.userData.originalEmissive) {
        mesh.material.emissive.copy(mesh.userData.originalEmissive);
        mesh.material.emissiveIntensity = mesh.userData.originalEmissiveIntensity;
      }
    }
  };

  return (
    <primitive 
      object={scene} 
      scale={2.6} // Heart fills ~70% of viewport
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    />
  );
}
