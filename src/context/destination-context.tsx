"use client";
import { createContext, useState, ReactNode } from "react";
import { Location } from "./source-context";

type DestinationContextType = {
  destination: Location | null;
  setDestination: (destination: Location | null) => void;
};

export const DestinationContext = createContext<DestinationContextType>({
  destination: null,
  setDestination: () => {},
});

interface DestinationProviderProps {
  children: ReactNode;
  initialValue?: Location | null;
}

export const DestinationProvider = ({
  children,
  initialValue = null,
}: DestinationProviderProps) => {
  const [destination, setDestination] = useState<Location | null>(initialValue);

  return (
    <DestinationContext.Provider value={{ destination, setDestination }}>
      {children}
    </DestinationContext.Provider>
  );
};
