import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  User,
  Radio,
  Package,
  GitBranch,
} from 'lucide-react';
import { RiskEvent } from '@/types';
import { getRiskLevelInfo } from '@/utils/formatters';

interface RiskCardProps {
  event: RiskEvent;
  index: number;
  showScenarioButton?: boolean;
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

export default function RiskCard({ event, index, showScenarioButton = false }: RiskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const levelInfo = getRiskLevelInfo(event.level);
  const Icon = iconMap[event.level];
  const sectionTitle = titleMap[event.level];

  return (
    <div
      className={`glass-card border-t-4 ${levelInfo.borderClass} 
        opacity-0 animate-fade-in-up animate-delay-${(index + 1) * 100}
        overflow-hidden`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl ${levelInfo.bgLightClass} flex items-center justify-center ${levelInfo.shadowClass}`}
            >
              <Icon className={`w-5 h-5 ${levelInfo.textClass}`} />
            </div>
            <div>
              <div className={`text-xs font-semibold uppercase tracking-wider ${levelInfo.textClass}`}>
                {sectionTitle}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${levelInfo.bgLightClass} ${levelInfo.textClass} font-medium`}
                >
                  {levelInfo.label}
                </span>
                <span className="text-xs text-slate-500">{event.updatedAt}</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-serif font-semibold text-slate-800 mb-3 leading-snug">
          {event.title}
        </h3>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-1.5 h-1.5 rounded-full ${levelInfo.bgClass}`} />
              <span className="text-xs font-medium text-slate-500">发生了什么</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pl-2.5">{event.summary}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className={`w-1.5 h-1.5 rounded-full bg-amber-500`} />
              <span className="text-xs font-medium text-slate-500">为什么影响品牌</span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed pl-2.5">{event.brandImpact}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className={`w-1.5 h-1.5 rounded-full bg-sky-500`} />
              <span className="text-xs font-medium text-slate-500">处置进度 · {event.progressPercent}%</span>
            </div>
            <div className="progress-bar pl-2.5">
              <div
                className={`progress-fill ${levelInfo.bgClass}`}
                style={{ width: `${event.progressPercent}%` }}
              />
            </div>
            <p className="text-sm text-slate-600 mt-1.5 pl-2.5">{event.progress}</p>
          </div>
        </div>

        {event.pendingItems && event.pendingItems.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-risk-warningLight/50 border border-risk-warning/20">
            <div className="text-xs font-semibold text-risk-warning mb-2">待拍板事项</div>
            <ul className="space-y-1">
              {event.pendingItems.map((item, i) => (
                <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                  <span className="text-risk-warning mt-0.5">●</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {event.resolvedSummary && (
          <div className="mb-4 p-3 rounded-xl bg-risk-safeLight/50 border border-risk-safe/20">
            <div className="text-xs font-semibold text-risk-safe mb-1">处理结果</div>
            <p className="text-sm text-slate-700">{event.resolvedSummary}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-navy-700 transition-colors"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" /> 收起详情
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" /> 查看详情
                </>
              )}
            </button>
          </div>

          {showScenarioButton && (
            <button
              onClick={() => navigate(`/scenario/${event.id}`)}
              className="px-4 py-2 text-sm font-medium text-white bg-navy-900 rounded-lg hover:bg-navy-800 transition-colors flex items-center gap-1.5"
            >
              <GitBranch className="w-4 h-4" />
              情景推演
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
                <Package className="w-3.5 h-3.5" /> 涉及产品/业务
              </div>
              <div className="flex flex-wrap gap-1.5">
                {event.products.map((p, i) => (
                  <span key={i} className="tag-chip bg-navy-50 text-navy-700 text-xs">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
                <Radio className="w-3.5 h-3.5" /> 传播渠道
              </div>
              <div className="flex flex-wrap gap-1.5">
                {event.channels.map((c, i) => (
                  <span key={i} className="tag-chip bg-slate-100 text-slate-600 text-xs">
                    {c}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
                <User className="w-3.5 h-3.5" /> 处置责任人
              </div>
              <div className="text-sm text-slate-700">{event.owner}</div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-slate-500 mb-3">事件时间线</div>
            <div className="relative pl-4">
              <div className="absolute left-1.5 top-1 bottom-1 w-px bg-slate-200" />
              {event.timeline.map((t, i) => (
                <div key={i} className="relative flex items-start gap-3 mb-3 last:mb-0">
                  <div
                    className={`absolute -left-2.5 w-2.5 h-2.5 rounded-full ${
                      i === event.timeline.length - 1 ? levelInfo.bgClass : 'bg-slate-300'
                    } mt-1.5 ring-4 ring-white`}
                  />
                  <div className="flex-1">
                    <div className="text-xs font-mono text-slate-400">{t.time}</div>
                    <div className="text-sm text-slate-700">{t.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
