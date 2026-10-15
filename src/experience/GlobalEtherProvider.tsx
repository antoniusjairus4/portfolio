'use client';

import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';

export type EtherMode = 'enabled' | 'paused' | 'disabled';

interface GlobalEtherControl {
  mode: EtherMode;
  setMode: (mode: EtherMode) => void;
}

const EtherContext = createContext<GlobalEtherControl>({
  mode: 'enabled',
  setMode: () => {},
});

export function GlobalEtherProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<EtherMode>('enabled');
  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return <EtherContext.Provider value={value}>{children}</EtherContext.Provider>;
}

/** Future chapters can explicitly pause, resume, or fully unmount the legacy Ether renderer. */
export function useGlobalEther() {
  return useContext(EtherContext);
}
