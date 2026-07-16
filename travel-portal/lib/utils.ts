export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(price: number, currency = 'CAD') {
  return new Intl.NumberFormat('fr-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatCountdown(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return {
    hours: String(h).padStart(2, '0'),
    minutes: String(m).padStart(2, '0'),
    seconds: String(s).padStart(2, '0'),
  };
}

export function getRandomFluctuation(base: number, range = 0.03) {
  return Math.round(base * (1 + (Math.random() - 0.5) * range));
}
