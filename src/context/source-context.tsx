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

interface SourceProviderProps {
  children: ReactNode;
  initialValue?: Location | null;
}

export const SourceProvider = ({
  children,
  initialValue = null,
}: SourceProviderProps) => {
  const [source, setSource] = useState<Location | null>(initialValue);

  return (
    <SourceContext.Provider value={{ source, setSource }}>
      {children}
    </SourceContext.Provider>
  );
};
