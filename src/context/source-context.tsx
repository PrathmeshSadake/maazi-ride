"use client";
import { createContext, useState, ReactNode } from "react";

export type Location = {
  lat: number;
  lng: number;
  name?: string;
  label?: string;
};

type SourceContextType = {
  source: Location | null;
  setSource: (source: Location | null) => void;
};

export const SourceContext = createContext<SourceContextType>({
  source: null,
  setSource: () => {},
});

export const SourceProvider = ({ children }: { children: ReactNode }) => {
  const [source, setSource] = useState<Location | null>(null);

  return (
    <SourceContext.Provider value={{ source, setSource }}>
      {children}
    </SourceContext.Provider>
  );
};
