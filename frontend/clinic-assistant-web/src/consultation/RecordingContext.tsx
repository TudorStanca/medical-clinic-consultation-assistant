import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";

interface RecordingContextValue {
  isActive: boolean;
  setIsActive: (v: boolean) => void;
}

const RecordingContext = createContext<RecordingContextValue>({
  isActive: false,
  setIsActive: () => {},
});

export const RecordingProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const set = useCallback((v: boolean) => setIsActive(v), []);

  return (
    <RecordingContext.Provider value={{ isActive, setIsActive: set }}>
      {children}
    </RecordingContext.Provider>
  );
};

export const useRecording = () => useContext(RecordingContext);
