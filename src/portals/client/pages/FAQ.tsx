import { HelpCircle, Lock, Globe, FileText, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../../../hooks/useLanguage';
import { usePortalNavigate } from '../../../hooks/usePortalNavigate';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const portalNavigate = usePortalNavigate();
  const { t } = useLanguage();

  const faqs = [
    { question: t('faqPortal.q1'), answer: t('faqPortal.a1'), icon: Lock },
    { question: t('faqPortal.q2'), answer: t('faqPortal.a2'), icon: Globe },
    { question: t('faqPortal.q3'), answer: t('faqPortal.a3'), icon: FileText },
    { question: t('faqPortal.q4'), answer: t('faqPortal.a4'), icon: FileText },
    { question: t('faqPortal.q5'), answer: t('faqPortal.a5'), icon: HelpCircle },
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto pb-20">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-serif font-medium text-ivoire tracking-tight">
          {t('faqPortal.title')} <span className="text-gold italic">{t('faqPortal.titleAccent')}</span>
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs">{t('faqPortal.subtitle')}</p>
      </header>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <Card key={i} className="p-0 overflow-hidden border-white/5 bg-white/[0.01]">
            <button 
              type="button"
              aria-expanded={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full p-6 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors focus-ring"
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
                  className="px-6 md:px-20 pb-8 text-sm text-slate-400 font-light leading-relaxed"
                >
                  {faq.answer}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        ))}
      </div>

      <Card className="p-10 border-gold/20 bg-gold/[0.02] text-center space-y-6">
         <h3 className="text-xl font-serif text-ivoire italic">{t('faqPortal.moreQuestions')}</h3>
         <p className="text-sm text-slate-500 max-w-lg mx-auto">{t('faqPortal.moreDesc')}</p>
         <Button variant="secondary" className="px-10 h-12 uppercase tracking-widest text-xs font-bold" onClick={() => portalNavigate('support')}>
           {t('faqPortal.openTicket')}
         </Button>
      </Card>
    </div>
  );
}
