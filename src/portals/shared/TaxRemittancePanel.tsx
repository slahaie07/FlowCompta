import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../../components/ui/Card';

interface TaxRemittancePanelProps {
  netRevenue: number;
  province?: string;
}

function getQuarterDeadlines(year: number) {
  return [
    { label: 'T1 (jan–mars)', deadline: `30 avr. ${year}`, months: [0, 1, 2] },
    { label: 'T2 (avr–juin)', deadline: `31 juil. ${year}`, months: [3, 4, 5] },
    { label: 'T3 (juil–sept)', deadline: `31 oct. ${year}`, months: [6, 7, 8] },
    { label: 'T4 (oct–déc)', deadline: `28 fév. ${year + 1}`, months: [9, 10, 11] },
  ];
}

export function TaxRemittancePanel({ netRevenue, province = 'QC' }: TaxRemittancePanelProps) {
  const now = new Date();
  const year = now.getFullYear();
  const currentMonth = now.getMonth();
  const quarters = getQuarterDeadlines(year);

  const tpsRate = 0.05;
  const tvqRate = province === 'QC' ? 0.09975 : 0;
  const tvhRate = ['ON', 'NB', 'NL', 'NS', 'PE'].includes(province) ? 0.13 : 0;

  const tpsOwed = netRevenue * tpsRate;
  const tvqOwed = netRevenue * tvqRate;
  const tvhOwed = netRevenue * tvhRate;
  const totalOwed = tpsOwed + tvqOwed + tvhOwed;

  const currentQuarterIdx = quarters.findIndex((q) => q.months.includes(currentMonth));
  const deadlineDate = new Date(now.getFullYear(), quarters[currentQuarterIdx]?.months[2] + 1, 30);
  const daysLeft = Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / 86400000));
  const isUrgent = daysLeft <= 30;

  return (
    <Card className={`p-6 space-y-5 ${isUrgent ? 'border-amber-500/40 bg-amber-500/5' : 'glass-card'}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
          {isUrgent ? <AlertTriangle size={14} className="text-amber-400" /> : <CheckCircle size={14} className="text-green-400" />}
          Remises de taxes ARC/RQ
        </h3>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${isUrgent ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-slate-500'}`}>
          {quarters[currentQuarterIdx]?.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tpsOwed > 0 && (
          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">TPS (5%)</p>
            <p className="text-lg font-serif font-bold text-gold mt-1">{tpsOwed.toFixed(2)} $</p>
          </div>
        )}
        {tvqOwed > 0 && (
          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">TVQ (9.975%)</p>
            <p className="text-lg font-serif font-bold text-gold mt-1">{tvqOwed.toFixed(2)} $</p>
          </div>
        )}
        {tvhOwed > 0 && (
          <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5 col-span-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">TVH ({province})</p>
            <p className="text-lg font-serif font-bold text-gold mt-1">{tvhOwed.toFixed(2)} $</p>
          </div>
        )}
        <div className="col-span-2 p-3 bg-gold/5 rounded-xl border border-gold/20">
          <p className="text-[10px] uppercase tracking-widest text-gold/60 font-bold">Total à remettre</p>
          <p className="text-2xl font-serif font-bold text-gold mt-1">{totalOwed.toFixed(2)} $</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-1.5">
          <Clock size={11} /> Prochaines échéances fiscales
        </p>
        {quarters.map((q, i) => {
          const isPast = i < currentQuarterIdx;
          const isCurrent = i === currentQuarterIdx;
          return (
            <div key={q.label} className={`flex justify-between items-center text-xs py-1.5 px-3 rounded-lg ${isCurrent ? 'bg-gold/5 border border-gold/20' : 'opacity-40'}`}>
              <span className={`font-bold ${isCurrent ? 'text-gold' : 'text-slate-500'}`}>{q.label}</span>
              <span className={`font-mono ${isPast ? 'line-through text-slate-600' : isCurrent ? 'text-amber-300 font-bold' : 'text-slate-500'}`}>
                {q.deadline}
              </span>
              {isCurrent && daysLeft > 0 && (
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${daysLeft <= 14 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-300'}`}>
                  J-{daysLeft}
                </span>
              )}
              {isPast && <CheckCircle size={12} className="text-green-500/50" />}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
