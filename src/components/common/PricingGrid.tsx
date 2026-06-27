import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles, LogIn } from 'lucide-react';
import { Button } from '../ui/Button';
import { useLanguage } from '../../hooks/useLanguage';

export function PricingGrid() {
  const navigate = useNavigate();
  const { lang } = useLanguage();

  const handleCtaClick = () => {
    navigate('/login?next=/onboarding&register=1');
  };

  const tiers = [
    {
      name: lang === 'en' ? 'Students' : lang === 'ar' ? 'الطلاب' : 'Étudiants',
      price: lang === 'en' ? '$49.99' : '49.99 $',
      period: lang === 'en' ? '/ filing' : lang === 'ar' ? '/ الإقرار' : '/ déclaration',
      desc: lang === 'en'
        ? 'Ideal for college or university students with simple income structures.'
        : lang === 'ar'
        ? 'مثالي لطلاب الكليات أو الجامعات ذوي الدخل البسيط.'
        : 'Idéal pour les étudiants du niveau collégial ou universitaire avec revenus simples.',
      features: lang === 'en'
        ? [
            'T1 & TP1 tax returns',
            'Electronic transmission (EFILE)',
            'Tuition credit optimization',
            'RL-8 / RL-31 slips',
            'Email support included'
          ]
        : lang === 'ar'
        ? [
            'إقرارات ضريبة T1 و TP1',
            'الإرسال الإلكتروني (TED)',
            'تحسين الإعفاءات الضريبية للتعليم',
            'قسائم Relevé 8 / Relevé 31',
            'الدعم عبر البريد الإلكتروني مشمول'
          ]
        : [
            'Déclarations fiscales T1 & TP1',
            'Transmission électronique (TED)',
            'Optimisation des crédits de scolarité',
            'Relevé 8 / Relevé 31',
            'Support courriel inclus'
          ],
      popular: false
    },
    {
      name: lang === 'en' ? 'Individuals' : lang === 'ar' ? 'الأفراد' : 'Particuliers',
      price: lang === 'en' ? '$89.99' : '89.99 $',
      period: lang === 'en' ? '/ filing' : lang === 'ar' ? '/ الإقرار' : '/ déclaration',
      desc: lang === 'en'
        ? 'Designed for employees, retirees, and families with standard returns.'
        : lang === 'ar'
        ? 'مصمم للموظفين والمتقاعدين والعائلات ذوي الإقرارات العادية.'
        : 'Conçu pour les salariés, retraités et familles ayant des déclarations standards.',
      features: lang === 'en'
        ? [
            'T1 & TP1 tax returns',
            'Employment, retirement & unemployment income',
            'Medical expenses & charitable donations',
            'Family deductions & childcare',
            'Fast EFILE transmission (24-48h)'
          ]
        : lang === 'ar'
        ? [
            'إقرارات ضريبة T1 و TP1',
            'دخل العمل والتقاعد والبطالة',
            'المصاريف الطبية والتبرعات الخيرية',
            'الخصومات العائلية ورعاية الأطفال',
            'إرسال TED سريع خلال 24-48 ساعة'
          ]
        : [
            'Déclarations fiscales T1 & TP1',
            'Revenus d’emploi, retraite & chômage',
            'Frais médicaux & dons de charité',
            'Déductions familiales & garde d’enfants',
            'Transmission TED rapide (24-48h)'
          ],
      popular: false
    },
    {
      name: lang === 'en' ? 'Self-Employed' : lang === 'ar' ? 'العاملون لحسابهم الخاص' : 'Travailleurs Autonomes',
      price: lang === 'en' ? '$199.99' : '199.99 $',
      period: lang === 'en' ? '/ filing' : lang === 'ar' ? '/ الإقرار' : '/ déclaration',
      desc: lang === 'en'
        ? 'Our most popular package for freelancers and independent professionals.'
        : lang === 'ar'
        ? 'باقاتنا الأكثر شعبية للمهنيين المستقلين والمستقلين.'
        : 'Notre forfait le plus populaire pour les professionnels indépendants et pigistes.',
      features: lang === 'en'
        ? [
            'Complete T1 & TP1 tax returns',
            'T2125 business expense form',
            'Home office expense calculation',
            'Business asset depreciation',
            'Custom tax optimization'
          ]
        : lang === 'ar'
        ? [
            'إقرارات ضريبية T1 و TP1 كاملة',
            'استمارة مصاريف الأعمال T2125',
            'حساب مصاريف المكتب المنزلي',
            'استهلاك أصول الشركة',
            'تحسين ضريبي مخصص'
          ]
        : [
            'Déclarations fiscales T1 & TP1 complètes',
            'Formulaire de dépenses T2125',
            'Calcul des dépenses de bureau à domicile',
            'Amortissement des actifs d’entreprise',
            'Optimisation fiscale sur mesure'
          ],
      popular: true
    },
    {
      name: lang === 'en' ? 'Bookkeeping & Taxes' : lang === 'ar' ? 'مسك الدفاتر والضرائب' : 'Tenue de livres & Taxes',
      price: lang === 'en' ? '$249.99' : '249.99 $',
      period: lang === 'en' ? '/ month' : lang === 'ar' ? '/ شهر' : '/ mois',
      desc: lang === 'en'
        ? 'For SMEs and sole proprietorships looking to delegate their monthly management.'
        : lang === 'ar'
        ? 'للشركات الصغيرة والمتوسطة والمؤسسات الفردية التي ترغب في تفويض إدارتها الشهرية.'
        : 'Pour les PME et entreprises individuelles souhaitant déléguer leur gestion mensuelle.',
      features: lang === 'en'
        ? [
            'Simplified submission on Dext (photos)',
            'Monthly bank reconciliation',
            'GST & HST report filings',
            'Quarterly financial statements',
            'Priority support by SMS/Email'
          ]
        : lang === 'ar'
        ? [
            'إرسال مبسط على Dext (صور)',
            'مطابقة الحسابات البنكية الشهرية',
            'تقديم تقارير ضريبة السلع والخدمات والضرائب الإقليمية',
            'بيانات مالية ربع سنوية',
            'دعم ذو أولوية عبر الرسائل القصيرة/البريد الإلكتروني'
          ]
        : [
            'Saisie simplifiée sur Dext (photos)',
            'Conciliation bancaire mensuelle',
            'Production des rapports de TPS & TVQ',
            'États financiers trimestriels',
            'Support prioritaire par SMS/Courriel'
          ],
      popular: false
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden bg-noir">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-gold text-xs font-black tracking-[0.4em] uppercase">
            {lang === 'en' ? 'Transparent Pricing' : lang === 'ar' ? 'أسعار شفافة' : 'Tarifs Transparents'}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-ivoire tracking-tight italic">
            {lang === 'en' ? (
              <>Fixed prices, <span className="text-gold">no surprises.</span></>
            ) : lang === 'ar' ? (
              <>أسعار ثابتة، <span className="text-gold">بلا مفاجآت.</span></>
            ) : (
              <>Des prix fixes, <span className="text-gold">sans surprise.</span></>
            )}
          </h2>
          <p className="text-silver font-light text-base leading-relaxed">
            {lang === 'en'
              ? 'Find the package that matches your tax reality and accounting needs.'
              : lang === 'ar'
              ? 'اعثر على الباقة التي تتناسب مع واقعك الضريبي واحتياجاتك المحاسبية.'
              : 'Trouvez le forfait qui correspond à votre réalité fiscale et à vos besoins comptables.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {tiers.map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`rounded-3xl p-8 flex flex-col justify-between relative transition-all duration-500 ${
                tier.popular
                  ? 'glass-card premium-border-gold shadow-[0_0_50px_rgba(212,175,55,0.15)] scale-105 md:scale-105 z-10'
                  : 'glass-card'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gold text-noir text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-gold/20">
                  <Sparkles size={10} />
                  <span>{lang === 'en' ? 'Popular' : lang === 'ar' ? 'شائع' : 'Populaire'}</span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-serif text-ivoire font-bold">{tier.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed min-h-[40px]">{tier.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  {(tier.name === 'Tenue de livres & Taxes' || tier.name === 'Bookkeeping & Taxes' || tier.name === 'مسك الدفاتر والضرائب') && (
                    <span className="text-slate-400 text-xs font-semibold mr-1">
                      {lang === 'en' ? 'From' : lang === 'ar' ? 'ابتداءً من' : 'À partir de'}
                    </span>
                  )}
                  <span className="text-3xl md:text-4xl font-serif font-bold text-gold">{tier.price}</span>
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">{tier.period}</span>
                </div>

                <ul className="space-y-3 pt-4 border-t border-white/5">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-xs text-silver leading-relaxed">
                      <Check size={14} className="text-gold shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                <Button
                  variant={tier.popular ? 'gold' : 'secondary'}
                  className="w-full gap-2 text-xs font-bold uppercase tracking-widest h-12 rounded-2xl"
                  onClick={handleCtaClick}
                >
                  {lang === 'en' ? 'Choose this package' : lang === 'ar' ? 'اختر هذه الباقة' : 'Choisir ce forfait'} <ArrowRight size={14} />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom Service Callout */}
        <div className="max-w-4xl mx-auto bg-white/[0.01] border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-gold/20 transition-all duration-300">
          <div className="space-y-2 text-left">
            <h4 className="text-lg font-serif text-ivoire font-bold">
              {lang === 'en' ? 'Need custom services?' : lang === 'ar' ? 'هل تحتاج إلى خدمات مخصصة؟' : 'Besoin de services sur mesure ?'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-xl">
              {lang === 'en'
                ? 'Whether for multi-employee payroll, corporate registration, or advanced tax advisory, our team is ready to adapt to your challenges.'
                : lang === 'ar'
                ? 'سواء كان ذلك لإدارة كشوف المرتبات لعدة موظفين، أو تسجيل الشركات، أو الاستشارات الضريبية المتقدمة، فإن فريقنا مستعد للتكيف مع تحدياتك.'
                : 'Que ce soit pour la gestion de la paie multi-employés, l’incorporation d’entreprise ou un accompagnement fiscal avancé, notre équipe est prête à s’adapter à vos défis.'}
            </p>
          </div>
          <a
            href="mailto:compta-flow@outlook.com"
            className="px-6 py-4 rounded-2xl border border-gold/30 bg-gold/5 text-xs font-bold uppercase tracking-widest text-gold hover:bg-gold/10 hover:border-gold/60 transition-all duration-300 shrink-0"
          >
            {lang === 'en' ? 'Contact' : lang === 'ar' ? 'اتصل بـ' : 'Contacter'} compta-flow@outlook.com
          </a>
        </div>

        {/* Existing client login callout */}
        <div className="max-w-md mx-auto text-center p-6 border border-gold/15 bg-gold/[0.02] rounded-2xl shadow-[0_4px_24px_rgba(212,175,55,0.05)] hover:border-gold/35 transition-all duration-300">
          <p className="text-xs text-silver flex flex-col sm:flex-row items-center justify-center gap-2 font-light">
            <span>
              {lang === 'en'
                ? 'Already have a client account?'
                : lang === 'ar'
                ? 'هل لديك حساب عميل بالفعل؟'
                : 'Vous avez déjà un compte client ?'}
            </span>
            <button
              onClick={() => navigate('/login')}
              className="text-gold font-bold hover:underline hover:text-gold-light flex items-center gap-1.5 cursor-pointer focus:outline-none transition-colors"
            >
              <LogIn size={12} />
              {lang === 'en' ? 'Sign in to your Portal' : lang === 'ar' ? 'سجل الدخول إلى حسابك' : 'Connectez-vous à votre Espace'}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
}
