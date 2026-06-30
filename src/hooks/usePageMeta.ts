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

/** Sets a meta tag's content and returns the previous content (or null if the tag didn't exist), for cleanup restoration. */
function setMetaTag(name: string, content: string, attr: 'name' | 'property' = 'name'): string | null {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  const prev = el ? el.getAttribute('content') : null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return prev;
}

function restoreMetaTag(name: string, prev: string | null, attr: 'name' | 'property' = 'name') {
  const el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) return;
  if (prev === null) el.remove();
  else el.setAttribute('content', prev);
}

/** Sets a link tag's href and returns the previous href (or null if the tag didn't exist), for cleanup restoration. */
function setLinkTag(rel: string, href: string): string | null {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  const prev = el ? el.getAttribute('href') : null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  return prev;
}

function restoreLinkTag(rel: string, prev: string | null) {
  const el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) return;
  if (prev === null) el.remove();
  else el.setAttribute('href', prev);
}

export function usePageMeta(meta: PageMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = meta.title;

    const prevDescription = setMetaTag('description', meta.description);
    const prevKeywords = meta.keywords ? setMetaTag('keywords', meta.keywords) : null;
    const prevGeoRegion = meta.geoRegion ? setMetaTag('geo.region', meta.geoRegion) : null;
    const prevGeoPlacename = meta.geoPlacename ? setMetaTag('geo.placename', meta.geoPlacename) : null;

    const prevOgTitle = setMetaTag('og:title', meta.ogTitle ?? meta.title, 'property');
    const prevOgDescription = setMetaTag('og:description', meta.ogDescription ?? meta.description, 'property');
    let prevOgUrl: string | null = null;
    let prevCanonical: string | null = null;
    if (meta.canonical) {
      prevOgUrl = setMetaTag('og:url', meta.canonical, 'property');
      prevCanonical = setLinkTag('canonical', meta.canonical);
    }

    const prevTwitterTitle = setMetaTag('twitter:title', meta.ogTitle ?? meta.title, 'name');
    const prevTwitterDescription = setMetaTag('twitter:description', meta.ogDescription ?? meta.description, 'name');

    return () => {
      document.title = prevTitle;
      restoreMetaTag('description', prevDescription);
      if (meta.keywords) restoreMetaTag('keywords', prevKeywords);
      if (meta.geoRegion) restoreMetaTag('geo.region', prevGeoRegion);
      if (meta.geoPlacename) restoreMetaTag('geo.placename', prevGeoPlacename);
      restoreMetaTag('og:title', prevOgTitle, 'property');
      restoreMetaTag('og:description', prevOgDescription, 'property');
      if (meta.canonical) {
        restoreMetaTag('og:url', prevOgUrl, 'property');
        restoreLinkTag('canonical', prevCanonical);
      }
      restoreMetaTag('twitter:title', prevTwitterTitle, 'name');
      restoreMetaTag('twitter:description', prevTwitterDescription, 'name');
    };
  }, [meta.title, meta.description, meta.canonical, meta.keywords, meta.geoRegion, meta.geoPlacename, meta.ogTitle, meta.ogDescription]);
}
