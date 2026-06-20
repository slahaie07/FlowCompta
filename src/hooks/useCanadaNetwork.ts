import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CANADIAN_REGIONS,
  getLegalRequirements,
  getRegion,
  normalizeProvinceCode,
  SITE,
  type CanadianRegion,
  type LegalPattern,
} from '../lib/canadaNetwork';
import type { ProvinceCode } from '../lib/financeUtils';

const STORAGE_KEY = 'comptaflow_region';
const COOKIE_KEY = 'comptaflow_cookies_accepted';

export interface CanadaNetworkState {
  region: CanadianRegion;
  provinceCode: ProvinceCode;
  legalRequirements: LegalPattern[];
  cookiesAccepted: boolean | null;
  loading: boolean;
  setProvince: (code: ProvinceCode) => void;
  acceptCookies: () => void;
  declineCookies: () => void;
}

async function fetchRegionFromApi(): Promise<ProvinceCode | null> {
  try {
    const res = await fetch('/api/network/region');
    if (!res.ok) return null;
    const data = (await res.json()) as { province?: string };
    return data.province ? normalizeProvinceCode(data.province) : null;
  } catch {
    return null;
  }
}

export function useCanadaNetwork(): CanadaNetworkState {
  const savedProvince = localStorage.getItem(STORAGE_KEY) as ProvinceCode | null;
  const [provinceCode, setProvinceCode] = useState<ProvinceCode>(
    savedProvince && CANADIAN_REGIONS[savedProvince] ? savedProvince : 'QC'
  );
  const [loading, setLoading] = useState(true);
  const [cookiesAccepted, setCookiesAccepted] = useState<boolean | null>(() => {
    const stored = localStorage.getItem(COOKIE_KEY);
    if (stored === 'accepted') return true;
    if (stored === 'declined') return false;
    return null;
  });

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      if (savedProvince && CANADIAN_REGIONS[savedProvince]) {
        setLoading(false);
        return;
      }

      const detected = await fetchRegionFromApi();
      if (!cancelled && detected) {
        setProvinceCode(detected);
        localStorage.setItem(STORAGE_KEY, detected);
      }
      if (!cancelled) setLoading(false);
    };

    void detect();
    return () => {
      cancelled = true;
    };
  }, [savedProvince]);

  const region = useMemo(() => getRegion(provinceCode), [provinceCode]);
  const legalRequirements = useMemo(() => getLegalRequirements(region), [region]);

  const setProvince = useCallback((code: ProvinceCode) => {
    setProvinceCode(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  const acceptCookies = useCallback(() => {
    localStorage.setItem(COOKIE_KEY, 'accepted');
    setCookiesAccepted(true);
  }, []);

  const declineCookies = useCallback(() => {
    localStorage.setItem(COOKIE_KEY, 'declined');
    setCookiesAccepted(false);
  }, []);

  return {
    region,
    provinceCode,
    legalRequirements,
    cookiesAccepted,
    loading,
    setProvince,
    acceptCookies,
    declineCookies,
  };
}

export { SITE };
