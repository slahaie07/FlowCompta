import {StrictMode, Suspense, lazy, useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import { Analytics } from '@vercel/analytics/react';
import App from './App.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { checkSystemHealth } from './lib/config';
import './index.css';

checkSystemHealth();

// Toaster (sonner) chargé en différé : un visiteur public ne déclenche aucun
// toast, donc sonner ne doit pas peser sur le paquet initial. Le montage a
// lieu au premier temps mort du navigateur (repli : délai nul). Les appels
// toast() sont émis par les composants applicatifs, indépendamment du montage.
const LazyToaster = lazy(() =>
  import('sonner').then((module) => ({ default: module.Toaster })),
);

function DeferredToaster() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let idleId: number | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => setReady(true), { timeout: 2000 });
    } else {
      timer = setTimeout(() => setReady(true), 0);
    }
    return () => {
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timer !== undefined) {
        clearTimeout(timer);
      }
    };
  }, []);

  if (!ready) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <LazyToaster position="top-right" richColors theme="dark" expand={false} />
    </Suspense>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Analytics />
      <DeferredToaster />
    </ErrorBoundary>
  </StrictMode>,
);
