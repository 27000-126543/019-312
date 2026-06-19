import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { TrendDirection } from '@/types';

interface TrendChartProps {
  trend: TrendDirection;
  score?: number;
  height?: number;
}

export default function TrendChart({ trend, score, height = 80 }: TrendChartProps) {
  const points = generatePath(trend);

  const strokeColor =
    trend === 'positive' ? '#059669' : trend === 'negative' ? '#DC2626' : '#64748B';
  const fillColor =
    trend === 'positive'
      ? 'url(#gradient-positive)'
      : trend === 'negative'
      ? 'url(#gradient-negative)'
      : 'url(#gradient-neutral)';

  const Icon = trend === 'positive' ? TrendingUp : trend === 'negative' ? TrendingDown : Minus;

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 200 80" className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="gradient-positive" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradient-negative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gradient-neutral" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#64748B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#64748B" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={`M0,80 L${points} L200,80 Z`} fill={fillColor} />
        <path
          d={`M${points}`}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {score !== undefined && (
          <g transform={`translate(${180}, ${trend === 'positive' ? 15 : trend === 'negative' ? 60 : 40})`}>
            <circle r="10" fill={strokeColor} />
          </g>
        )}
      </svg>

      <div className="absolute top-2 right-2">
        <Icon
          className={`w-5 h-5 ${
            trend === 'positive'
              ? 'text-risk-safe'
              : trend === 'negative'
              ? 'text-risk-critical'
              : 'text-slate-500'
          }`}
        />
      </div>
    </div>
  );
}

function generatePath(trend: TrendDirection): string {
  if (trend === 'positive') {
    return '0,65 20,60 40,55 60,58 80,45 100,40 120,30 140,25 160,18 180,12 200,10';
  } else if (trend === 'negative') {
    return '0,15 20,20 40,25 60,28 80,38 100,45 120,55 140,60 160,66 180,70 200,72';
  } else {
    return '0,40 20,38 40,42 60,39 80,41 100,40 120,42 140,38 160,41 180,39 200,40';
  }
}
