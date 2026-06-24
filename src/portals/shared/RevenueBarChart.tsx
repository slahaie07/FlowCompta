interface BarData {
  month: string;
  revenue: number;
}

interface RevenueBarChartProps {
  data: BarData[];
  height?: number;
  highlightColor?: string;
  label?: string;
}

export function RevenueBarChart({ data, height = 140, highlightColor = '#D4AF37', label }: RevenueBarChartProps) {
  if (!data || data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.revenue), 1);
  const barW = 100 / data.length;
  const gap = 0.8;

  const lastMonth = data[data.length - 1]?.revenue ?? 0;
  const prevMonth = data[data.length - 2]?.revenue ?? 0;
  const momPct = prevMonth === 0 ? null : ((lastMonth - prevMonth) / prevMonth) * 100;

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</span>
          {momPct !== null && (
            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${momPct >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
              {momPct >= 0 ? '+' : ''}{momPct.toFixed(1)}% M/M
            </span>
          )}
        </div>
      )}
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        {data.map((d, i) => {
          const barH = (d.revenue / max) * (height - 20);
          const x = i * barW + gap / 2;
          const w = barW - gap;
          const y = height - 20 - barH;
          const isLast = i === data.length - 1;
          return (
            <g key={d.month}>
              <rect
                x={`${x}%`}
                y={y}
                width={`${w}%`}
                height={barH}
                rx="2"
                fill={isLast ? highlightColor : `${highlightColor}40`}
                className="transition-all duration-500"
              />
              {isLast && barH > 0 && (
                <rect
                  x={`${x}%`}
                  y={y}
                  width={`${w}%`}
                  height={4}
                  rx="2"
                  fill={highlightColor}
                  opacity="0.8"
                />
              )}
              <text
                x={`${x + w / 2}%`}
                y={height - 4}
                textAnchor="middle"
                fontSize="3.5"
                fill="#64748b"
                fontFamily="monospace"
              >
                {d.month.split(' ')[0]}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-slate-600 font-mono">
        <span>0 $</span>
        <span>{(max / 1000).toFixed(0)}k $</span>
      </div>
    </div>
  );
}
