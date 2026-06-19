import { AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { RiskEvent } from '@/types';
import { getRiskLevelInfo } from '@/utils/formatters';

interface EventSidebarProps {
  events: RiskEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  annotationCounts: Record<string, number>;
}

const iconMap = {
  critical: AlertTriangle,
  warning: Clock,
  resolved: CheckCircle2,
};

export default function EventSidebar({
  events,
  selectedId,
  onSelect,
  annotationCounts,
}: EventSidebarProps) {
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-3 border-b border-slate-100">
        <h3 className="font-semibold text-slate-800">今日风险事件</h3>
        <p className="text-xs text-slate-500 mt-0.5">共 {events.length} 条事件</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {events.map((event) => {
          const levelInfo = getRiskLevelInfo(event.level);
          const Icon = iconMap[event.level];
          const isSelected = selectedId === event.id;
          const count = annotationCounts[event.id] || 0;

          return (
            <button
              key={event.id}
              onClick={() => onSelect(event.id)}
              className={`w-full text-left px-4 py-3 transition-all duration-200 border-l-4 ${
                isSelected
                  ? `${levelInfo.borderClass} bg-slate-50`
                  : 'border-transparent hover:bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg ${levelInfo.bgLightClass} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className={`w-4 h-4 ${levelInfo.textClass}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${levelInfo.bgLightClass} ${levelInfo.textClass} font-medium`}
                    >
                      {levelInfo.label}
                    </span>
                    {count > 0 && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-navy-100 text-navy-700 font-medium">
                        {count}条意见
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 text-sm text-slate-800 font-medium line-clamp-2 leading-snug">
                    {event.title}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">{event.updatedAt}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
