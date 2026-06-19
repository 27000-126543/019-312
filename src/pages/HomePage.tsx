import { useMemo } from 'react';
import { AlertTriangle, Clock, CheckCircle2, Play, Square, ListChecks } from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import OverviewCard from '@/components/cards/OverviewCard';
import EventDetailModal from '@/components/modals/EventDetailModal';
import MeetingControlBar from '@/components/meeting/MeetingControlBar';
import { useAppStore } from '@/store/useAppStore';
import { RiskLevel } from '@/types';

export default function HomePage() {
  const events = useAppStore((s) => s.events);
  const meeting = useAppStore((s) => s.meeting);
  const detailModalEventId = useAppStore((s) => s.detailModalEventId);
  const setDetailModalEventId = useAppStore((s) => s.setDetailModalEventId);
  const toggleMeetingEvent = useAppStore((s) => s.toggleMeetingEvent);
  const startMeeting = useAppStore((s) => s.startMeeting);
  const endMeeting = useAppStore((s) => s.endMeeting);
  const setMeetingSelectedEvents = useAppStore((s) => s.setMeetingSelectedEvents);
  const getEventById = useAppStore((s) => s.getEventById);

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

  const detailEvent = detailModalEventId ? getEventById(detailModalEventId) : undefined;

  const handleSelectAllForMeeting = () => {
    const allIds = [...grouped.critical, ...grouped.warning].map((e) => e.id);
    setMeetingSelectedEvents(allIds);
  };

  const handleStartMeeting = () => {
    if (meeting.selectedEventIds.length === 0) {
      handleSelectAllForMeeting();
    }
    setTimeout(() => startMeeting(), 100);
  };

  const cardConfigs: { level: RiskLevel; events: typeof grouped.critical; index: number }[] = [
    { level: 'critical', events: grouped.critical, index: 0 },
    { level: 'warning', events: grouped.warning, index: 1 },
    { level: 'resolved', events: grouped.resolved, index: 2 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 container px-8 py-6 pb-28">
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

            <div className="flex items-center gap-4">
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

              <div className="h-10 w-px bg-slate-200" />

              {!meeting.isActive ? (
                <div className="flex items-center gap-2">
                  <div className="text-right mr-2">
                    <div className="text-sm font-medium text-slate-700">
                      已选 {meeting.selectedEventIds.length} 项上会议题
                    </div>
                    <button
                      onClick={handleSelectAllForMeeting}
                      className="text-xs text-navy-600 hover:text-navy-700"
                    >
                      一键全选未解决事件
                    </button>
                  </div>
                  <button
                    onClick={handleStartMeeting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-gold text-navy-950 font-medium hover:bg-brand-goldLight transition-all shadow-lg shadow-brand-gold/20"
                  >
                    <Play className="w-4 h-4" />
                    开始晨会
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-risk-safeLight border border-risk-safe/30">
                  <ListChecks className="w-5 h-5 text-risk-safe" />
                  <div>
                    <div className="text-sm font-medium text-risk-safe">晨会进行中</div>
                    <div className="text-xs text-slate-500">
                      议题 {meeting.currentEventIndex + 1}/{meeting.selectedEventIds.length}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!meeting.isActive && meeting.selectedEventIds.length > 0 && (
            <div className="mt-4 p-3 rounded-xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-brand-gold" />
                <span className="text-sm text-brand-gold font-medium">
                  已勾选 {meeting.selectedEventIds.length} 项议题，点击卡片上的勾选框可增减
                </span>
              </div>
              <button
                onClick={() => setMeetingSelectedEvents([])}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                清空选择
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cardConfigs.map((config) => (
            <OverviewCard
              key={config.level}
              level={config.level}
              events={config.events}
              index={config.index}
              onViewDetail={setDetailModalEventId}
            />
          ))}
        </div>
      </main>

      {detailEvent && (
        <EventDetailModal event={detailEvent} onClose={() => setDetailModalEventId(null)} />
      )}

      <MeetingControlBar />
    </div>
  );
}
