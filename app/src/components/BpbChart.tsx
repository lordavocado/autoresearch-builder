import type { Experiment } from '../lib/supabase';

interface BpbChartProps {
  experiments: Experiment[];
}

export function BpbChart({ experiments }: BpbChartProps) {
  const validExps = experiments.filter(e => e.val_bpb > 0);
  if (validExps.length < 2) return null;

  const width = 260;
  const height = 80;
  const padding = { top: 8, right: 8, bottom: 16, left: 36 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = validExps.map(e => e.val_bpb);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 0.001;

  const scaleX = (i: number) => padding.left + (i / (validExps.length - 1)) * chartW;
  const scaleY = (v: number) => padding.top + ((v - minVal) / range) * chartH;

  // Running best line (frontier)
  let runningBest = validExps[0].val_bpb;
  const frontier: { x: number; y: number }[] = [];
  validExps.forEach((exp, i) => {
    if (exp.status === 'keep' && exp.val_bpb <= runningBest) {
      runningBest = exp.val_bpb;
    }
    frontier.push({ x: scaleX(i), y: scaleY(runningBest) });
  });

  const frontierPath = frontier.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');

  return (
    <div>
      <p className="text-[9px] text-slate-text uppercase tracking-wider mb-1">val_bpb progress</p>
      <svg width={width} height={height} className="w-full" viewBox={`0 0 ${width} ${height}`}>
        {/* Y-axis labels */}
        <text x={padding.left - 4} y={padding.top + 4} textAnchor="end" className="fill-slate-text" fontSize="8" fontFamily="IBM Plex Mono, monospace">
          {maxVal.toFixed(3)}
        </text>
        <text x={padding.left - 4} y={padding.top + chartH + 2} textAnchor="end" className="fill-slate-text" fontSize="8" fontFamily="IBM Plex Mono, monospace">
          {minVal.toFixed(3)}
        </text>

        {/* Grid lines */}
        <line x1={padding.left} y1={padding.top} x2={padding.left + chartW} y2={padding.top} stroke="#e3e4e8" strokeWidth="0.5" />
        <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke="#e3e4e8" strokeWidth="0.5" />

        {/* Frontier line */}
        <path d={frontierPath} fill="none" stroke="#44b48b" strokeWidth="1.5" strokeLinecap="round" />

        {/* Data points */}
        {validExps.map((exp, i) => {
          const cx = scaleX(i);
          const cy = scaleY(exp.val_bpb);
          const color = exp.status === 'keep' ? '#44b48b' : exp.status === 'discard' ? '#ec652b' : '#d94040';
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={2}
              fill={color}
              opacity={0.8}
            />
          );
        })}

        {/* X-axis label */}
        <text x={padding.left + chartW / 2} y={height - 2} textAnchor="middle" className="fill-slate-text" fontSize="8">
          experiments →
        </text>
      </svg>
    </div>
  );
}
