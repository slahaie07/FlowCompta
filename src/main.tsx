import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { Toaster } from 'sonner';
import App from './App.tsx';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { checkSystemHealth, CONFIG } from './lib/config';
import './index.css';

checkSystemHealth();

const PAYPAL_CLIENT_ID = CONFIG.PAYPAL_CLIENT_ID;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PayPalScriptProvider options={{ "client-id": PAYPAL_CLIENT_ID, currency: "CAD" }}>
        <App />
        <Toaster position="top-right" richColors theme="dark" expand={false} />
      </PayPalScriptProvider>
    </ErrorBoundary>
  </StrictMode>,
);
