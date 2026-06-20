import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Toaster } from 'sonner';
import App from './App.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { checkSystemHealth } from './lib/config';
import './index.css';

checkSystemHealth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
      <Toaster position="top-right" richColors theme="dark" expand={false} />
    </ErrorBoundary>
  </StrictMode>,
);
