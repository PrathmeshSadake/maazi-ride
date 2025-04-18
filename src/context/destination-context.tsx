"use client";
import React, { createContext, useState } from "react";

interface DestinationContextType {
  destination: { name: string } | null;
  setDestination: React.Dispatch<React.SetStateAction<{ name: string } | null>>;
}

const defaultDestinationContext: DestinationContextType = {
  destination: null,
  setDestination: () => null,
};

export const DestinationContext = createContext<DestinationContextType>(defaultDestinationContext);

export const DestinationProvider: React.FC<{
  children: React.ReactNode;
  initialValue?: { name: string } | null;
}> = ({ children, initialValue = null }) => {
  const [destination, setDestination] = useState<{ name: string } | null>(initialValue);

  return (
    <DestinationContext.Provider value={{ destination, setDestination }}>
      {children}
    </DestinationContext.Provider>
  );
};
