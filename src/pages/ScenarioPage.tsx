import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  AlertTriangle,
  Clock,
  CheckCircle2,
  MessageSquare,
  GitBranch,
  BarChart3,
  ListTodo,
  Lightbulb,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import ActionSelector from '@/components/scenario/ActionSelector';
import ResultPanel from '@/components/scenario/ResultPanel';
import ComparisonView from '@/components/scenario/ComparisonView';
import MeetingControlBar from '@/components/meeting/MeetingControlBar';
import { useAppStore } from '@/store/useAppStore';
import { getRiskLevelInfo } from '@/utils/formatters';
import { ActionType } from '@/types';

const iconMap = {
  critical: AlertTriangle,
  warning: Clock,
  resolved: CheckCircle2,
};

type ViewMode = 'single' | 'comparison';

export default function ScenarioPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const getEventById = useAppStore((s) => s.getEventById);
  const computeScenarioResult = useAppStore((s) => s.computeScenarioResult);
  const computeAllScenarioResults = useAppStore((s) => s.computeAllScenarioResults);
  const resetScenarioState = useAppStore((s) => s.resetScenarioState);
  const currentScenarioResult = useAppStore((s) => s.currentScenarioResult);
  const allScenarioResults = useAppStore((s) => s.allScenarioResults);
  const selectedAction = useAppStore((s) => s.selectedAction);
  const events = useAppStore((s) => s.events);
  const meeting = useAppStore((s) => s.meeting);
  const setMeetingStep = useAppStore((s) => s.setMeetingStep);

  const event = eventId ? getEventById(eventId) : undefined;
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  useEffect(() => {
    if (eventId && event) {
      resetScenarioState();
      computeAllScenarioResults(eventId);
      if (meeting.isActive) {
        setMeetingStep('scenario');
      }
    }
    return () => {
      resetScenarioState();
    };
  }, [eventId]);

  const handleSelectAction = (action: ActionType) => {
    if (eventId) {
      computeScenarioResult(eventId, action);
      setViewMode('single');
    }
  };

  const handleSwitchEvent = (id: string) => {
    setSwitchingId(id);
    resetScenarioState();
    setTimeout(() => {
      navigate(`/scenario/${id}`);
      setSwitchingId(null);
    }, 150);
  };

  const handleToggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    if (mode === 'comparison' && eventId && !allScenarioResults) {
      computeAllScenarioResults(eventId);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-slate-500">未找到该事件</p>
        </main>
      </div>
    );
  }

  const levelInfo = getRiskLevelInfo(event.level);
  const Icon = iconMap[event.level];

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-1 container px-8 py-6 pb-28">
        <div className="mb-5 opacity-0 animate-fade-in-up">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 transition-colors mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            返回总览
          </button>

          <div className="flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl ${levelInfo.bgLightClass} ${levelInfo.shadowClass} flex items-center justify-center`}
              >
                <Icon className={`w-7 h-7 ${levelInfo.textClass}`} />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`tag-chip text-xs ${levelInfo.bgLightClass} ${levelInfo.textClass}`}
                  >
                    {levelInfo.label}
                  </span>
                  <span className="text-xs text-slate-500">{event.updatedAt}</span>
                </div>
                <h2 className="text-2xl font-serif font-semibold text-slate-800">
                  {event.title}
                </h2>
                <p className="text-slate-600 mt-2 max-w-3xl leading-relaxed">
                  {event.summary}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 p-1">
                <button
                  onClick={() => handleToggleViewMode('single')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    viewMode === 'single'
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <GitBranch className="w-4 h-4" />
                  单动作分析
                </button>
                <button
                  onClick={() => handleToggleViewMode('comparison')}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    viewMode === 'comparison'
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  四动作对比
                </button>
              </div>

              <button
                onClick={() => navigate('/annotations')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
              >
                <MessageSquare className="w-4 h-4" />
                记录决策
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 opacity-0 animate-fade-in-up animate-delay-100">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-base font-semibold text-slate-700">切换推演事件</h3>
            <span className="text-xs text-slate-400">点击切换（已自动加载对比数据）</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {events
              .filter((e) => e.level !== 'resolved')
              .map((e) => {
                const eLevelInfo = getRiskLevelInfo(e.level);
                const isActive = e.id === event.id;
                const isSwitching = switchingId === e.id;
                return (
                  <button
                    key={e.id}
                    onClick={() => handleSwitchEvent(e.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all ${
                      isActive
                        ? `${eLevelInfo.bgLightClass} ${eLevelInfo.textClass} font-medium ring-2 ring-offset-1 ${eLevelInfo.borderClass.replace('border-', 'ring-')}`
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                    } ${isSwitching ? 'scale-95 opacity-60' : ''}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${eLevelInfo.bgClass}`} />
                    {e.title.length > 20 ? e.title.slice(0, 20) + '...' : e.title}
                  </button>
                );
              })}
          </div>
        </div>

        {viewMode === 'single' ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 opacity-0 animate-fade-in-up animate-delay-200">
              <div className="mb-3">
                <h3 className="text-base font-semibold text-slate-700">选择应对动作</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  选择一种应对方式，查看可能的影响推演
                </p>
              </div>
              <ActionSelector
                selectedAction={selectedAction}
                onSelect={handleSelectAction}
              />

              {!currentScenarioResult && (
                <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-navy-50 text-navy-700 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-800 text-sm mb-1">也可以看看对比视图</div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        点击上方"四动作对比"按钮，可一次性查看所有应对方案的效果差异，更便于比较决策。
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-3 opacity-0 animate-fade-in-up animate-delay-300">
              <div className="mb-3">
                <h3 className="text-base font-semibold text-slate-700">推演结果预判</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  基于历史同类事件数据模型的预测参考
                </p>
              </div>
              <ResultPanel result={currentScenarioResult} />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <ComparisonView
              results={allScenarioResults}
              onSelectAction={handleSelectAction}
              selectedAction={selectedAction}
            />
          </div>
        )}
      </main>

      <MeetingControlBar />
    </div>
  );
}
