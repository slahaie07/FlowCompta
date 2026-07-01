import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { SITE } from '../../lib/canadaNetwork';
import { useLanguage } from '../../hooks/useLanguage';
import { usePageMeta } from '../../hooks/usePageMeta';
import { BLOG_ARTICLES, getArticle } from '../../lib/blogContent';

const CATEGORY_LABELS_FR: Record<string, string> = {
  fiscal: 'Fiscal',
  comptabilite: 'Comptabilité',
  logiciel: 'Logiciels',
  paie: 'Paie',
  demarrage: 'Démarrage',
};
const CATEGORY_LABELS_EN: Record<string, string> = {
  fiscal: 'Tax',
  comptabilite: 'Accounting',
  logiciel: 'Software',
  paie: 'Payroll',
  demarrage: 'Startup',
};

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleDateString(lang === 'fr' ? 'fr-CA' : 'en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Simple markdown-lite renderer (bold, headings, lists, links)
function renderBody(body: string) {
  const lines = body.trim().split('\n');
  const els: React.ReactElement[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      els.push(<h2 key={i} className="text-2xl font-serif font-bold text-white mt-10 mb-4">{line.slice(3)}</h2>);
    } else if (line.startsWith('### ')) {
      els.push(<h3 key={i} className="text-xl font-serif font-semibold text-gold mt-7 mb-3">{line.slice(4)}</h3>);
    } else if (line.startsWith('#### ')) {
      els.push(<h4 key={i} className="text-lg font-semibold text-white mt-5 mb-2">{line.slice(5)}</h4>);
    } else if (line.startsWith('- ')) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith('- ')) {
        items.push(lines[i].slice(2));
        i++;
      }
      els.push(
        <ul key={`ul-${i}`} className="list-disc list-inside space-y-1 text-silver text-sm leading-relaxed my-3 pl-2">
          {items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />)}
        </ul>
      );
      continue;
    } else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\. /)) {
        items.push(lines[i].replace(/^\d+\. /, ''));
        i++;
      }
      els.push(
        <ol key={`ol-${i}`} className="list-decimal list-inside space-y-1 text-silver text-sm leading-relaxed my-3 pl-2">
          {items.map((item, j) => <li key={j} dangerouslySetInnerHTML={{ __html: inlineFormat(item) }} />)}
        </ol>
      );
      continue;
    } else if (line.startsWith('---')) {
      els.push(<hr key={i} className="border-white/10 my-8" />);
    } else if (line.startsWith('| ')) {
      // table — skip for simplicity
    } else if (line.trim() === '') {
      // skip blank lines
    } else {
      els.push(<p key={i} className="text-silver text-sm leading-relaxed my-3" dangerouslySetInnerHTML={{ __html: inlineFormat(line) }} />);
    }
    i++;
  }
  return els;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineFormat(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label: string, url: string) =>
      /^(https?:\/\/|\/)/i.test(url)
        ? `<a href="${url}" class="text-gold hover:underline">${label}</a>`
        : label
    );
}

export function BlogListPage() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isFr = lang === 'fr';
  const catLabels = isFr ? CATEGORY_LABELS_FR : CATEGORY_LABELS_EN;

  usePageMeta({
    title: isFr
      ? 'Ressources comptables pour entrepreneurs canadiens | ComptaFlow'
      : 'Accounting Resources for Canadian Entrepreneurs | ComptaFlow',
    description: isFr
      ? 'Guides, articles et conseils pratiques sur la comptabilité, les taxes (TPS/TVQ/TVH), la paie et la gestion financière pour entrepreneurs canadiens.'
      : 'Guides, articles and practical advice on accounting, taxes (GST/QST/HST), payroll and financial management for Canadian entrepreneurs.',
    lang: isFr ? 'fr' : 'en',
    canonical: `${SITE.url}/ressources`,
    keywords: isFr
      ? 'ressources comptables Canada, guide TPS TVQ TVH, tenue de livres entrepreneur, comptabilité PME'
      : 'Canadian accounting resources, GST HST guide, bookkeeping entrepreneur, SMB accounting',
  });

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ComptaFlow', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: isFr ? 'Ressources' : 'Resources', item: `${SITE.url}/ressources` },
    ],
  };

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="bg-gradient-to-b from-[#111008] to-noir pt-8 pb-14 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-silver hover:text-gold transition-colors mb-8 group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            {isFr ? "Retour à l'accueil" : 'Back to home'}
          </button>

          <span className="text-xs font-bold tracking-[0.35em] uppercase text-gold/70 border border-gold/20 px-3 py-1 rounded-full">
            {isFr ? 'Ressources · ComptaFlow' : 'Resources · ComptaFlow'}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mt-4 mb-3">
            {isFr ? <>Guides <span className="text-gold italic">comptables</span> pour entrepreneurs</> : <>Accounting <span className="text-gold italic">guides</span> for entrepreneurs</>}
          </h1>
          <p className="text-silver text-lg font-light max-w-2xl">
            {isFr
              ? 'TPS/TVQ/TVH, tenue de livres, paie, démarrage d\'entreprise — tout ce qu\'il faut savoir pour gérer vos finances au Canada.'
              : 'GST/QST/HST, bookkeeping, payroll, business startup — everything you need to manage your finances in Canada.'}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid gap-6">
          {BLOG_ARTICLES.map((article) => (
            <article
              key={article.slug}
              className="p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-gold/20 transition-colors cursor-pointer group"
              onClick={() => navigate(`/ressources/${article.slug}`)}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
                  {catLabels[article.category]}
                </span>
                <span className="flex items-center gap-1 text-xs text-silver/50">
                  <Clock size={12} />
                  {article.readingMin} min
                </span>
                <span className="text-xs text-silver/40">{formatDate(article.dateIso, lang)}</span>
              </div>
              <h2 className="text-xl font-serif font-bold text-white mb-2 group-hover:text-gold transition-colors">
                {isFr ? article.titleFr : article.titleEn}
              </h2>
              <p className="text-silver text-sm leading-relaxed mb-4">
                {isFr ? article.excerptFr : article.excerptEn}
              </p>
              <span className="text-gold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                {isFr ? 'Lire l\'article' : 'Read article'} <ArrowRight size={14} />
              </span>
            </article>
          ))}
        </div>

        <div className="mt-14 p-8 rounded-2xl border border-gold/15 bg-gold/5 text-center">
          <h2 className="text-2xl font-serif font-bold text-white mb-2">
            {isFr ? 'Prêt à déléguer votre comptabilité ?' : 'Ready to delegate your accounting?'}
          </h2>
          <p className="text-silver text-sm mb-6">
            {isFr ? 'Nos experts comptables s\'occupent de tout — TPS, TVQ, paie, états financiers.' : 'Our accounting experts handle everything — GST, HST, payroll, financial statements.'}
          </p>
          <Button onClick={() => navigate('/login?next=/onboarding&register=1')} variant="gold">
            {isFr ? 'Ouvrir mon dossier (Gratuit) →' : 'Open My File (Free) →'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function BlogArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isFr = lang === 'fr';

  const article = getArticle(slug ?? '');

  useEffect(() => {
    if (!article) navigate('/ressources');
  }, [article, navigate]);

  const title = article ? (isFr ? article.titleFr : article.titleEn) : 'ComptaFlow';
  const excerpt = article ? (isFr ? article.excerptFr : article.excerptEn) : '';
  const body = article ? (isFr ? article.bodyFr : article.bodyEn) : '';

  usePageMeta({
    title: article ? `${title} | ComptaFlow` : 'ComptaFlow',
    description: excerpt,
    lang: isFr ? 'fr' : 'en',
    canonical: article ? `${SITE.url}/ressources/${article.slug}` : `${SITE.url}/ressources`,
    keywords: article ? article.keywordsFr.join(', ') : undefined,
  });

  if (!article) return null;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt,
    datePublished: article.dateIso,
    dateModified: article.dateIso,
    author: { '@type': 'Organization', name: 'ComptaFlow', url: SITE.url },
    publisher: { '@type': 'Organization', name: 'ComptaFlow', url: SITE.url },
    inLanguage: lang === 'fr' ? 'fr-CA' : 'en-CA',
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'ComptaFlow', item: SITE.url },
      { '@type': 'ListItem', position: 2, name: isFr ? 'Ressources' : 'Resources', item: `${SITE.url}/ressources` },
      { '@type': 'ListItem', position: 3, name: title, item: `${SITE.url}/ressources/${article.slug}` },
    ],
  };

  return (
    <div className="min-h-screen bg-noir text-ivoire font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="bg-gradient-to-b from-[#111008] to-noir pt-8 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-silver mb-8">
            <button onClick={() => navigate('/')} className="hover:text-gold transition-colors">ComptaFlow</button>
            <span>/</span>
            <button onClick={() => navigate('/ressources')} className="hover:text-gold transition-colors">{isFr ? 'Ressources' : 'Resources'}</button>
            <span>/</span>
            <span className="text-gold truncate max-w-xs">{title}</span>
          </div>

          <div className="flex items-center gap-3 mb-5">
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-gold/10 text-gold border border-gold/20">
              {(isFr ? CATEGORY_LABELS_FR : CATEGORY_LABELS_EN)[article.category]}
            </span>
            <span className="flex items-center gap-1 text-xs text-silver/50">
              <Clock size={12} />
              {article.readingMin} min
            </span>
            <time className="text-xs text-silver/40" dateTime={article.dateIso}>
              {formatDate(article.dateIso, lang)}
            </time>
          </div>

          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white leading-tight mb-4">{title}</h1>
          <p className="text-silver text-lg font-light leading-relaxed">{excerpt}</p>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 py-10">
        {renderBody(body)}

        <div className="mt-14 p-8 rounded-2xl border border-gold/15 bg-gold/5 text-center">
          <h2 className="text-xl font-serif font-bold text-white mb-2">
            {isFr ? 'Besoin d\'un expert comptable ?' : 'Need an accounting expert?'}
          </h2>
          <p className="text-silver text-sm mb-5">
            {isFr ? 'ComptaFlow gère votre comptabilité, vos taxes et votre paie — 100 % en ligne, données au Canada.' : 'ComptaFlow handles your accounting, taxes and payroll — 100% online, Canadian data.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/login?next=/onboarding&register=1')} variant="gold" size="lg">
              {isFr ? 'Ouvrir mon dossier (Gratuit) →' : 'Open My File (Free) →'}
            </Button>
            <Button onClick={() => navigate('/estimate')} variant="secondary" size="lg">
              {isFr ? 'Obtenir un devis' : 'Get a Quote'}
            </Button>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
          <button
            onClick={() => navigate('/ressources')}
            className="flex items-center gap-2 text-sm text-silver hover:text-gold transition-colors group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            {isFr ? 'Tous les articles' : 'All articles'}
          </button>
        </div>
      </article>
    </div>
  );
}
