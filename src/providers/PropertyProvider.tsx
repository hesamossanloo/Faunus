import React, { createContext, ReactNode, useContext, useState } from "react";

interface SelectedShapeContextProps {
  isShapeSelected: boolean;
  toggleShapeSelection: () => void;
}

const PropertyContext = createContext<SelectedShapeContextProps | undefined>(
  undefined,
);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isShapeSelected, setIsShapeSelected] = useState(false);

  const toggleShapeSelection = () => {
    setIsShapeSelected((prev) => !prev);
  };

  return (
    <PropertyContext.Provider value={{ isShapeSelected, toggleShapeSelection }}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = () => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error("useProperty must be used within a PropertyProvider");
  }
  return context;
};
