import { useMemo } from 'react';
import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import RiskCard from '@/components/cards/RiskCard';
import { useAppStore } from '@/store/useAppStore';

export default function HomePage() {
  const events = useAppStore((s) => s.events);

  const grouped = useMemo(() => {
    return {
      critical: events.filter((e) => e.level === 'critical'),
      warning: events.filter((e) => e.level === 'warning'),
      resolved: events.filter((e) => e.level === 'resolved'),
    };
  }, [events]);

  const stats = useMemo(() => {
    return [
      {
        label: '紧急风险',
        count: grouped.critical.length,
        icon: AlertTriangle,
        color: 'text-risk-critical',
        bg: 'bg-risk-criticalLight',
      },
      {
        label: '待决策',
        count: grouped.warning.length,
        icon: Clock,
        color: 'text-risk-warning',
        bg: 'bg-risk-warningLight',
      },
      {
        label: '已降温',
        count: grouped.resolved.length,
        icon: CheckCircle2,
        color: 'text-risk-safe',
        bg: 'bg-risk-safeLight',
      },
    ];
  }, [grouped]);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 container px-8 py-6">
        <div className="mb-6 opacity-0 animate-fade-in-up">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-serif font-semibold text-slate-800">
                今日声誉风险概览
              </h2>
              <p className="text-slate-500 mt-1">
                聚焦核心风险，三分钟掌握重点 · 建议优先处理紧急和待决策事项
              </p>
            </div>
            <div className="flex items-center gap-3">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white shadow-card"
                  >
                    <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-2xl font-mono font-bold text-slate-800 leading-none">
                        {stat.count}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {grouped.critical.length > 0 && (
            <RiskCard event={grouped.critical[0]} index={0} showScenarioButton />
          )}
          {grouped.warning.map((event, idx) => (
            <RiskCard key={event.id} event={event} index={idx + 1} showScenarioButton />
          ))}
          {grouped.resolved.length > 0 && (
            <RiskCard
              event={grouped.resolved[0]}
              index={grouped.warning.length + 1}
            />
          )}
        </div>

        {grouped.resolved.length > 1 && (
          <div className="mt-6">
            <h3 className="text-lg font-serif font-semibold text-slate-700 mb-4 opacity-0 animate-fade-in-up animate-delay-500">
              其他已降温事件
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {grouped.resolved.slice(1).map((event, idx) => (
                <RiskCard key={event.id} event={event} index={idx + 6} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
