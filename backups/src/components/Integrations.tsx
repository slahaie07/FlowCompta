import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logoutGoogle } from '../lib/googleAuth';
import { Mail, Calendar, FileText, CheckSquare, MessageSquare, Contact, Database, ExternalLink } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

export function Integrations() {
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setUser(user);
        setNeedsAuth(false);
        setIsLoading(false);
      },
      () => {
        setNeedsAuth(true);
        setIsLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const connectors = [
    { name: 'Gmail', description: 'Envoi automatisé de bilans et factures', icon: Mail, color: 'text-red-500' },
    { name: 'Google Calendar', description: 'Planification des consultations CPA', icon: Calendar, color: 'text-blue-500' },
    { name: 'Google Docs / Sheets', description: 'Génération de lettres et tableaux de bord', icon: FileText, color: 'text-green-500' },
    { name: 'Google Tasks', description: 'Synchronisation des tâches administratives', icon: CheckSquare, color: 'text-blue-400' },
    { name: 'Google Chat & Meet', description: 'Communication et réunions équipes/clients', icon: MessageSquare, color: 'text-emerald-500' },
    { name: 'Contacts', description: 'Importation CRM simplifiée', icon: Contact, color: 'text-indigo-400' },
  ];

  if (isLoading) return <div className="h-96 flex items-center justify-center text-slate-500">Synchronisation des services...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-serif font-medium text-silver tracking-tight">Connecteurs <span className="text-gold">Cloud</span></h1>
        <p className="text-slate-400 mt-2 text-sm font-medium uppercase tracking-widest">Intégrations & Productivité</p>
      </header>

      <Card className="p-12 relative overflow-hidden" glow={needsAuth ? 'gold' : 'none'}>
        {needsAuth ? (
          <div className="text-center space-y-8 max-w-lg mx-auto">
            <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto border border-gold/20">
               <Database size={32} className="text-gold" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-serif text-silver italic">Lier Google Workspace</h2>
              <p className="text-sm text-slate-400 font-light leading-relaxed">
                Authentifiez-vous pour activer la synchronisation bidirectionnelle avec vos outils de productivité habituels.
              </p>
            </div>
            <Button variant="gold" className="gap-3 px-10 h-14" onClick={handleLogin} isLoading={isLoggingIn}>
               Lancer l'authentification <ExternalLink size={18}/>
            </Button>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                    <CheckSquare size={20} />
                 </div>
                 <div>
                   <h3 className="text-lg font-bold text-silver">Workspace Synchronisé</h3>
                   <p className="text-xs text-slate-500">{user?.email}</p>
                 </div>
              </div>
              <Button variant="ghost" size="sm" onClick={logoutGoogle}>Réinitialiser la connexion</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connectors.map((c, i) => (
                <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-gold/30 transition-all group">
                  <div className={`w-12 h-12 rounded-2xl bg-midnight flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${c.color}`}>
                    <c.icon size={24} strokeWidth={1.5} />
                  </div>
                  <h4 className="text-silver font-bold text-sm mb-2">{c.name}</h4>
                  <p className="text-slate-500 text-xs font-light leading-relaxed mb-6">{c.description}</p>
                  <Badge variant="success">Actif</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
