import { useMemo } from 'react';
import { Users, Shield, Heart, Lightbulb, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ScenarioResult } from '@/types';
import { getTrendInfo, getTrustInfo } from '@/utils/formatters';
import TrendChart from './TrendChart';

interface ResultPanelProps {
  result: ScenarioResult | null;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  const panels = useMemo(() => {
    if (!result) return null;

    const trendInfo = getTrendInfo(result.publicReaction.trend);
    const trustInfo = getTrustInfo(result.customerTrust.impact);

    const regRiskColor =
      result.regulatoryRisk.probability >= 70
        ? 'text-risk-critical'
        : result.regulatoryRisk.probability >= 40
        ? 'text-risk-warning'
        : 'text-risk-safe';
    const regRiskBg =
      result.regulatoryRisk.probability >= 70
        ? 'bg-risk-criticalLight'
        : result.regulatoryRisk.probability >= 40
        ? 'bg-risk-warningLight'
        : 'bg-risk-safeLight';

    return [
      {
        title: '舆论反应',
        icon: Users,
        badgeLabel: trendInfo.label,
        badgeClass: `${trendInfo.bgColor} ${trendInfo.color}`,
        content: (
          <div>
            <TrendChart trend={result.publicReaction.trend} />
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-mono font-bold text-slate-800">
                {result.publicReaction.sentimentScore > 0 ? '+' : ''}
                {result.publicReaction.sentimentScore}
              </span>
              <span className="text-sm text-slate-500">情绪指数</span>
            </div>
          </div>
        ),
        description: result.publicReaction.description,
      },
      {
        title: '监管关注概率',
        icon: Shield,
        badgeLabel: `${result.regulatoryRisk.probability}%`,
        badgeClass: `${regRiskBg} ${regRiskColor}`,
        content: (
          <div className="py-2">
            <div className="relative w-full h-4 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full ${
                  result.regulatoryRisk.probability >= 70
                    ? 'bg-risk-critical'
                    : result.regulatoryRisk.probability >= 40
                    ? 'bg-risk-warning'
                    : 'bg-risk-safe'
                } transition-all duration-1000 ease-out animate-count-up`}
                style={{ width: `${result.regulatoryRisk.probability}%` }}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-1 text-center text-xs text-slate-400">
              <span>低风险</span>
              <span>中风险</span>
              <span>高风险</span>
            </div>
          </div>
        ),
        description: result.regulatoryRisk.description,
      },
      {
        title: '客户信任影响',
        icon: Heart,
        badgeLabel: trustInfo.label,
        badgeClass: `${trustInfo.bgColor} ${trustInfo.color}`,
        content: (
          <div>
            <TrendChart
              trend={
                result.customerTrust.changePercent > 0
                  ? 'positive'
                  : result.customerTrust.changePercent < 0
                  ? 'negative'
                  : 'neutral'
              }
            />
            <div className="mt-2 flex items-baseline gap-1">
              <span
                className={`text-3xl font-mono font-bold ${
                  result.customerTrust.changePercent > 0
                    ? 'text-risk-safe'
                    : result.customerTrust.changePercent < 0
                    ? 'text-risk-critical'
                    : 'text-slate-600'
                }`}
              >
                {result.customerTrust.changePercent > 0 ? '+' : ''}
                {result.customerTrust.changePercent}%
              </span>
              <span className="text-sm text-slate-500">信任度变化</span>
            </div>
          </div>
        ),
        description: result.customerTrust.description,
      },
    ];
  }, [result]);

  if (!result) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center">
          <Lightbulb className="w-8 h-8 text-slate-400" />
        </div>
        <h3 className="text-lg font-medium text-slate-700 mb-2">选择应对动作</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          点击上方任意一种应对方式，系统将基于历史数据推演可能产生的舆论反应、监管风险和客户信任变化。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {panels!.map((panel, idx) => {
          const Icon = panel.icon;
          return (
            <div
              key={panel.title}
              className={`glass-card p-5 opacity-0 animate-fade-in-up animate-delay-${(idx + 1) * 100}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-700 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <span className="font-medium text-slate-800">{panel.title}</span>
                </div>
                <span className={`tag-chip text-xs ${panel.badgeClass}`}>{panel.badgeLabel}</span>
              </div>
              {panel.content}
              <p className="mt-3 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {panel.description}
              </p>
            </div>
          );
        })}
      </div>

      <div
        className="glass-card p-5 opacity-0 animate-fade-in-up animate-delay-400 
                    border-l-4 border-brand-gold bg-gradient-to-r from-amber-50/50 to-transparent"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-gold/10 text-brand-gold flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-800 mb-1">专家建议</div>
            <p className="text-slate-700 leading-relaxed">{result.expertAdvice}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
