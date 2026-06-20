import { Navigate, useLocation } from 'react-router-dom';

interface LegacyPortalSlugRedirectProps {
  /** Legacy URL segment (e.g. sub-admin) */
  fromSlug: string;
  /** Canonical portal segment (e.g. admin) */
  toSlug: string;
}

/** Redirects /portal/{fromSlug}/* → /portal/{toSlug}/* for role portal aliases */
export function LegacyPortalSlugRedirect({ fromSlug, toSlug }: LegacyPortalSlugRedirectProps) {
  const location = useLocation();
  const prefix = `/portal/${fromSlug}`;
  const targetPrefix = `/portal/${toSlug}`;
  const rest = location.pathname.startsWith(prefix)
    ? location.pathname.slice(prefix.length)
    : '';
  const target = `${targetPrefix}${rest || ''}`;

  return <Navigate to={target + location.search + location.hash} replace />;
}
