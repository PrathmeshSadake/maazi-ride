"use client";
import React, { createContext, useState } from "react";

interface SourceContextType {
  source: { name: string } | null;
  setSource: React.Dispatch<React.SetStateAction<{ name: string } | null>>;
}

const defaultSourceContext: SourceContextType = {
  source: null,
  setSource: () => null,
};

export const SourceContext = createContext<SourceContextType>(defaultSourceContext);

export const SourceProvider: React.FC<{
  children: React.ReactNode;
  initialValue?: { name: string } | null;
}> = ({ children, initialValue = null }) => {
  const [source, setSource] = useState<{ name: string } | null>(initialValue);

  return (
    <SourceContext.Provider value={{ source, setSource }}>
      {children}
    </SourceContext.Provider>
  );
};
