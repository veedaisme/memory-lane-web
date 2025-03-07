import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the disclosure levels
export enum DisclosureLevel {
  Minimal = 'minimal',   // Just content field and save button
  Standard = 'standard', // Add title and basic options
  Full = 'full'          // Show all options including tags, location, etc.
}

interface DisclosureContextType {
  level: DisclosureLevel;
  setLevel: (level: DisclosureLevel) => void;
  incrementLevel: () => void;
}

const DisclosureContext = createContext<DisclosureContextType | undefined>(undefined);

interface DisclosureProviderProps {
  children: ReactNode;
  initialLevel?: DisclosureLevel;
  isEditMode?: boolean;
}

export const DisclosureProvider: React.FC<DisclosureProviderProps> = ({ 
  children, 
  initialLevel = DisclosureLevel.Minimal,
  isEditMode = false
}) => {
  // If we're in edit mode, start with the full disclosure level
  const [level, setLevel] = useState<DisclosureLevel>(
    isEditMode ? DisclosureLevel.Full : initialLevel
  );

  const incrementLevel = () => {
    setLevel(currentLevel => {
      if (currentLevel === DisclosureLevel.Minimal) return DisclosureLevel.Standard;
      if (currentLevel === DisclosureLevel.Standard) return DisclosureLevel.Full;
      return currentLevel;
    });
  };

  return (
    <DisclosureContext.Provider value={{ level, setLevel, incrementLevel }}>
      {children}
    </DisclosureContext.Provider>
  );
};

export const useDisclosure = (): DisclosureContextType => {
  const context = useContext(DisclosureContext);
  if (context === undefined) {
    throw new Error('useDisclosure must be used within a DisclosureProvider');
  }
  return context;
}; 