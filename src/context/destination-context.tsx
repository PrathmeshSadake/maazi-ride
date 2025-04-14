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

export const DestinationProvider = ({ children }: { children: ReactNode }) => {
  const [destination, setDestination] = useState<Location | null>(null);

  return (
    <DestinationContext.Provider value={{ destination, setDestination }}>
      {children}
    </DestinationContext.Provider>
  );
};
