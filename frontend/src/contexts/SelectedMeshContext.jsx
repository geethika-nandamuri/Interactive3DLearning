import React, { createContext, useContext, useState } from 'react';

const SelectedMeshContext = createContext();

export const SelectedMeshProvider = ({ children }) => {
  const [selectedMeshInfo, setSelectedMeshInfo] = useState(null); 
  const [availableMeshes, setAvailableMeshes] = useState([]);
  const [explosionFactor, setExplosionFactor] = useState(0); // Value from 0.0 (assembled) to 1.0 (fully exploded)

  const selectMesh = (meshInfo) => {
    setSelectedMeshInfo(meshInfo);
  };

  const clearSelection = () => {
    setSelectedMeshInfo(null);
  };

  return (
    <SelectedMeshContext.Provider value={{ 
      selectedMeshInfo, 
      selectMesh, 
      clearSelection,
      availableMeshes,
      setAvailableMeshes,
      explosionFactor,
      setExplosionFactor
    }}>
      {children}
    </SelectedMeshContext.Provider>
  );
};

export const useSelectedMesh = () => {
  const context = useContext(SelectedMeshContext);
  if (!context) {
    throw new Error('useSelectedMesh must be used within a SelectedMeshProvider');
  }
  return context;
};
