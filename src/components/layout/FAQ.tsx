import { HelpCircle, ShieldCheck, Lock, Globe, FileText, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export function FAQ() {
  const [openIndex, setSetOpenIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  const faqs = [
    {
      question: "Mes données financières sont-elles en sécurité ?",
      answer: "Absolument. ComptaFlow utilise le chiffrement AES-256 (niveau bancaire) pour tous vos documents. Vos données sont isolées via des politiques RLS (Row Level Security) garantissant que seul vous et votre comptable professionnel assigné pouvez y accéder.",
      icon: Lock
    },
    {
      question: "Où sont hébergés mes fichiers ?",
      answer: "Toutes les données et fichiers justificatifs sont stockés sur des serveurs sécurisés situés au Canada (Région Canada-Central). Cela garantit la conformité totale avec les lois canadiennes sur la protection des renseignements personnels.",
      icon: Globe
    },
    {
      question: "Comment fonctionne la liaison avec mon comptable ?",
      answer: "Dès que vous téléversez un document ou saisissez une transaction, votre comptable professionnel est notifié. Les échanges se font via notre canal direct chiffré, éliminant les risques liés aux courriels non sécurisés.",
      icon: ShieldCheck
    },
    {
      question: "Respectez-vous la Loi 25 (Québec) ?",
      answer: "Oui. Nous avons nommé un responsable de la protection des données et mis en place des protocoles de gestion des incidents. Chaque accès est tracé et audité pour assurer une transparence totale.",
      icon: FileText
    },
    {
      question: "Pourquoi un délai de 48h pour l'ouverture du dossier ?",
      answer: "Chaque nouveau client fait l'objet d'une vérification de conformité manuelle par notre équipe pour s'assurer de l'exactitude des informations fiscales (NEQ/NAS) avant d'activer les outils d'automatisation.",
      icon: HelpCircle
    }
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-20">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-medium text-silver tracking-tight">Centre de <span className="text-gold italic">Transparence.</span></h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Sécurité • Confidentialité • Support</p>
      </header>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i} className="p-0 overflow-hidden border-white/5 bg-white/[0.01]">
            <button 
              onClick={() => setSetOpenIndex(openIndex === i ? null : i)}
              className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold">
                  <faq.icon size={20} />
                </div>
                <span className="text-sm font-bold text-silver uppercase tracking-widest">{faq.question}</span>
              </div>
              <ChevronDown className={`text-slate-600 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} size={20} />
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-20 pb-8 text-sm text-slate-400 font-light leading-relaxed italic"
                >
                  {faq.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      <Card className="p-10 border-sapphire/20 bg-sapphire/[0.02] text-center space-y-6">
         <h3 className="text-xl font-serif text-silver italic">Encore des questions ?</h3>
         <p className="text-sm text-slate-500 max-w-lg mx-auto">Notre équipe de support technique et nos comptables professionnels sont disponibles pour vous répondre sous 24 heures.</p>
         <Button variant="secondary" className="px-10 h-12 uppercase tracking-widest text-[10px] font-bold" onClick={() => navigate('/dashboard/support')}>Ouvrir un ticket de support</Button>
      </Card>
    </div>
  );
}
