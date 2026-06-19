import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Eye,
  GitBranch,
} from 'lucide-react';
import { RiskEvent, RiskLevel } from '@/types';
import { getRiskLevelInfo } from '@/utils/formatters';
import { useAppStore } from '@/store/useAppStore';

interface OverviewCardProps {
  level: RiskLevel;
  events: RiskEvent[];
  index: number;
  onViewDetail: (eventId: string) => void;
}

const iconMap = {
  critical: AlertTriangle,
  warning: Clock,
  resolved: CheckCircle2,
};

const titleMap = {
  critical: '今日最热风险',
  warning: '需要拍板事项',
  resolved: '已降温事件',
};

export default function OverviewCard({ level, events, index, onViewDetail }: OverviewCardProps) {
  const navigate = useNavigate();
  const toggleMeetingEvent = useAppStore((s) => s.toggleMeetingEvent);
  const meetingSelectedIds = useAppStore((s) => s.meeting.selectedEventIds);
  const isMeetingActive = useAppStore((s) => s.meeting.isActive);

  const levelInfo = getRiskLevelInfo(level);
  const Icon = iconMap[level];
  const title = titleMap[level];

  if (events.length === 0) {
    return (
      <div
        className={`glass-card border-t-4 ${levelInfo.borderClass} 
        opacity-0 animate-fade-in-up animate-delay-${(index + 1) * 100}
        overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`w-11 h-11 rounded-xl ${levelInfo.bgLightClass} flex items-center justify-center ${levelInfo.shadowClass}`}
            >
              <Icon className={`w-5 h-5 ${levelInfo.textClass}`} />
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${levelInfo.textClass}`}>
                {title}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">共 0 条事件</div>
            </div>
          </div>
          <div className="py-8 text-center">
            <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500">暂无相关风险事件</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`glass-card border-t-4 ${levelInfo.borderClass} 
        opacity-0 animate-fade-in-up animate-delay-${(index + 1) * 100}
        overflow-hidden`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl ${levelInfo.bgLightClass} flex items-center justify-center ${levelInfo.shadowClass}`}
            >
              <Icon className={`w-5 h-5 ${levelInfo.textClass}`} />
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${levelInfo.textClass}`}>
                {title}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${levelInfo.bgLightClass} ${levelInfo.textClass} font-medium`}
                >
                  {levelInfo.label}
                </span>
                <span className="text-xs text-slate-500">共 {events.length} 条事件</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {events.map((event, idx) => {
            const isSelected = meetingSelectedIds.includes(event.id);
            return (
              <div
                key={event.id}
                className={`group p-3 rounded-xl transition-all duration-200 ${
                  isSelected ? `${levelInfo.bgLightClass} ring-2 ${levelInfo.borderClass.replace('border-', 'ring-')}` : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isMeetingActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMeetingEvent(event.id);
                      }}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? `${levelInfo.bgClass} border-transparent`
                          : 'border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">
                        {event.title}
                      </h4>
                      <span className="text-xs text-slate-400 flex-shrink-0">{event.updatedAt}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {event.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1">
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${levelInfo.bgClass}`}
                            style={{ width: `${event.progressPercent}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {event.progressPercent}%
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2 pl-0">
                  <button
                    onClick={() => onViewDetail(event.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    查看详情
                  </button>
                  {level !== 'resolved' && (
                    <button
                      onClick={() => navigate(`/scenario/${event.id}`)}
                      className="flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-navy-900 text-white hover:bg-navy-800 transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5" />
                      推演
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {events.length > 3 && (
          <div className="text-center pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">还有 {events.length - 3} 条事件请秘书补充</span>
          </div>
        )}
      </div>
    </div>
  );
}
