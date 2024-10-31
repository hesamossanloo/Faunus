import React, { createContext, ReactNode, useContext, useState } from "react";

interface PropertyContextProps {
  isShapeSelected: boolean;
  toggleShapeSelection: () => void;
  isCommentVisible: boolean;
  setCommentVisible: (visible: boolean) => void;
}

const PropertyContext = createContext<PropertyContextProps | undefined>(
  undefined,
);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isShapeSelected, setIsShapeSelected] = useState(false);
  const [isCommentVisible, setCommentVisible] = useState(false);

  const toggleShapeSelection = () => {
    setIsShapeSelected((prev) => !prev);
  };

  return (
    <PropertyContext.Provider
      value={{
        isShapeSelected,
        toggleShapeSelection,
        isCommentVisible,
        setCommentVisible,
      }}
    >
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
