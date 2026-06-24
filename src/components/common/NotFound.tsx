import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';

export function NotFound() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const copy = {
    code: '404',
    title: lang === 'en' ? 'Page not found' : lang === 'ar' ? 'الصفحة غير موجودة' : 'Page introuvable',
    desc: lang === 'en'
      ? "The page you're looking for doesn't exist or has been moved."
      : lang === 'ar'
        ? 'الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
        : "La page que vous cherchez n'existe pas ou a été déplacée.",
    cta: lang === 'en' ? 'Back to home' : lang === 'ar' ? 'العودة إلى الرئيسية' : "Retour à l'accueil",
  };

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans flex flex-col items-center justify-center px-6">
      <div className="aurora-bg opacity-20 pointer-events-none fixed inset-0" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center space-y-8 max-w-lg"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-gold/30 flex items-center justify-center">
            <Search size={32} className="text-gold/60" />
          </div>
          <span className="text-8xl font-serif font-bold text-gold/20">{copy.code}</span>
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-serif font-bold">{copy.title}</h1>
          <p className="text-silver text-sm font-light leading-relaxed">{copy.desc}</p>
        </div>
        <Button variant="gold" onClick={() => navigate('/')} className="gap-2">
          <ArrowLeft size={16} />
          {copy.cta}
        </Button>
      </motion.div>
    </div>
  );
}
