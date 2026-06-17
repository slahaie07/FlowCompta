import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Showcase() {
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col bg-noir text-ivoire overflow-hidden">
      {/* Header bar with Back button */}
      <div className="h-14 bg-noir/90 border-b border-gold/10 px-6 flex items-center justify-between shrink-0 z-50">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-silver hover:text-gold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Retour à l'accueil
        </button>
        <span className="text-sm font-serif text-gold tracking-widest italic">ComptaFlow Design Showcase</span>
        <div className="w-24" /> {/* Spacer */}
      </div>

      {/* Embedded static showcase page */}
      <div className="flex-1 w-full h-full relative">
        <iframe
          src="/showcase.html"
          title="ComptaFlow Design Showcase"
          className="w-full h-full border-none"
        />
      </div>
    </div>
  );
}
