import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  isRecovering: boolean;
}

/**
 * 🛡️ DEEP GUARD : AUTO-HEALING ERROR BOUNDARY
 * Protège l'application contre les crashs React complets et tente une auto-restauration.
 */
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    isRecovering: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true, isRecovering: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DEEP GUARD] Crash détecté:', error, errorInfo);
    
    // Envoi de la télémétrie au bot Warden en arrière-plan
    fetch('/api/bot/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'ERROR',
        table: 'system',
        record: { error: error.message, stack: errorInfo.componentStack }
      })
    }).catch(() => {}); // Fire and forget
  }

  private handleAutoRecover = () => {
    this.setState({ isRecovering: true });
    
    // Simulation d'une purge de cache local avant rechargement
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 1500);
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-noir flex items-center justify-center p-6">
          <Card className="max-w-md w-full p-10 text-center space-y-6" glow="error">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto text-red-500 animate-pulse">
              <AlertTriangle size={32} />
            </div>
            
            <div>
              <h2 className="text-2xl font-serif text-ivoire mb-2 italic">Deep Guard <span className="text-red-500">Activé</span>.</h2>
              <p className="text-silver text-sm font-light">Une instabilité du flux a été détectée. Le protocole de protection a gelé l'interface pour prévenir toute corruption de données.</p>
            </div>

            <Button 
              variant="secondary" 
              className="w-full gap-2 border-red-500/20 hover:border-red-500/50 hover:bg-red-500/10 transition-colors"
              onClick={this.handleAutoRecover}
              isLoading={this.state.isRecovering}
            >
              {this.state.isRecovering ? 'Restauration en cours...' : <><RefreshCw size={16} /> Auto-Réparation du Flux</>}
            </Button>
            
            <p className="text-[9px] uppercase tracking-widest text-slate-600 font-bold">SAS V5.0 • Autonomous SRE</p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
