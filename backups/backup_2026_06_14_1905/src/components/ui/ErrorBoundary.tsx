import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-midnight flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto text-red-500 border border-red-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <h1 className="text-3xl font-serif text-silver italic">Oups. Une erreur est survenue.</h1>
            <p className="text-slate-500 text-sm">Le portail a rencontré une difficulté technique. Veuillez rafraîchir la page ou contacter le support.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-gold text-midnight rounded-2xl font-bold uppercase tracking-widest text-xs shadow-glow"
            >
              Rafraîchir le Portail
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
