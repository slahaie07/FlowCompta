import { useEffect } from 'react';

interface PageMeta {
  title: string;
  description: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  keywords?: string;
  geoRegion?: string;
  geoPlacename?: string;
}

function setMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const prev = document.title;
    document.title = meta.title;

    setMetaTag('description', meta.description);
    if (meta.keywords) setMetaTag('keywords', meta.keywords);
    if (meta.geoRegion) setMetaTag('geo.region', meta.geoRegion);
    if (meta.geoPlacename) setMetaTag('geo.placename', meta.geoPlacename);

    setMetaTag('og:title', meta.ogTitle ?? meta.title, 'property');
    setMetaTag('og:description', meta.ogDescription ?? meta.description, 'property');
    if (meta.canonical) {
      setMetaTag('og:url', meta.canonical, 'property');
      setLinkTag('canonical', meta.canonical);
    }

    setMetaTag('twitter:title', meta.ogTitle ?? meta.title, 'name');
    setMetaTag('twitter:description', meta.ogDescription ?? meta.description, 'name');

    return () => {
      document.title = prev;
    };
  }, [meta.title, meta.description, meta.canonical, meta.keywords, meta.geoRegion, meta.geoPlacename, meta.ogTitle, meta.ogDescription]);
}
