import { createContext, useContext, type ReactNode } from 'react';
import { useCanadaNetwork, type CanadaNetworkState } from '../hooks/useCanadaNetwork';

const CanadaNetworkContext = createContext<CanadaNetworkState | null>(null);

export function CanadaNetworkProvider({ children }: { children: ReactNode }) {
  const network = useCanadaNetwork();
  return (
    <CanadaNetworkContext.Provider value={network}>
      {children}
    </CanadaNetworkContext.Provider>
  );
}

export function useCanadaNetworkContext(): CanadaNetworkState {
  const ctx = useContext(CanadaNetworkContext);
  if (!ctx) {
    throw new Error('useCanadaNetworkContext must be used within CanadaNetworkProvider');
  }
  return ctx;
}
