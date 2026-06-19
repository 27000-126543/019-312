import { X, User, Radio, Package, Clock, GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RiskEvent } from '@/types';
import { getRiskLevelInfo } from '@/utils/formatters';

interface EventDetailModalProps {
  event: RiskEvent;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const navigate = useNavigate();
  const levelInfo = getRiskLevelInfo(event.level);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden 
          animate-fade-in-up max-h-[85vh] flex flex-col"
      >
        <div className={`h-1 ${levelInfo.bgClass}`} />

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span
              className={`tag-chip text-xs ${levelInfo.bgLightClass} ${levelInfo.textClass}`}
            >
              {levelInfo.label}
            </span>
            <span className="text-sm text-slate-500">{event.updatedAt}</span>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-6">
            <h2 className="text-xl font-serif font-semibold text-slate-800 leading-snug">
              {event.title}
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className={`w-2 h-2 rounded-full ${levelInfo.bgClass}`} />
                  <span className="text-sm font-medium text-slate-700">发生了什么</span>
                </div>
                <p className="text-slate-700 leading-relaxed pl-3.5">{event.summary}</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-slate-700">为什么可能影响品牌</span>
                </div>
                <p className="text-slate-700 leading-relaxed pl-3.5">{event.brandImpact}</p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="text-sm font-medium text-slate-700">
                    现在处置到哪一步 · {event.progressPercent}%
                  </span>
                </div>
                <div className="progress-bar mb-2 ml-3.5">
                  <div
                    className={`progress-fill ${levelInfo.bgClass}`}
                    style={{ width: `${event.progressPercent}%` }}
                  />
                </div>
                <p className="text-slate-700 leading-relaxed pl-3.5">{event.progress}</p>
              </div>

              {event.pendingItems && event.pendingItems.length > 0 && (
                <div className="p-4 rounded-xl bg-risk-warningLight/30 border border-risk-warning/20">
                  <div className="text-sm font-semibold text-risk-warning mb-2">待拍板事项</div>
                  <ul className="space-y-1.5">
                    {event.pendingItems.map((item, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <span className="text-risk-warning mt-1">●</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {event.resolvedSummary && (
                <div className="p-4 rounded-xl bg-risk-safeLight/30 border border-risk-safe/20">
                  <div className="text-sm font-semibold text-risk-safe mb-2">处理结果</div>
                  <p className="text-sm text-slate-700">{event.resolvedSummary}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-2">
                    <Package className="w-3.5 h-3.5" /> 涉及产品
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
                    <User className="w-3.5 h-3.5" /> 责任人
                  </div>
                  <div className="text-sm text-slate-700">{event.owner}</div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-3">
                  <Clock className="w-4 h-4" /> 事件时间线
                </div>
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
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="text-sm text-slate-500">处置进度 {event.progressPercent}%</div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              关闭
            </button>
            {event.level !== 'resolved' && (
              <button
                onClick={() => {
                  onClose();
                  navigate(`/scenario/${event.id}`);
                }}
                className="px-4 py-2 text-sm font-medium text-white rounded-xl bg-navy-900 hover:bg-navy-800 transition-colors flex items-center gap-1.5"
              >
                <GitBranch className="w-4 h-4" />
                去推演
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
