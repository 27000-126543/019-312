import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  LayoutDashboard,
  GitBranch,
  MessageSquare,
  CheckCircle2,
  MessageSquareText,
  ListTodo,
  ChevronRight,
  CalendarClock,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MeetingStep, RiskEvent } from '@/types';
import { getRiskLevelInfo } from '@/utils/formatters';

interface MeetingAgendaPanelProps {
  onClose: () => void;
}

const steps: { key: MeetingStep; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: '总览', icon: LayoutDashboard },
  { key: 'scenario', label: '推演', icon: GitBranch },
  { key: 'annotations', label: '批注', icon: MessageSquare },
];

export default function MeetingAgendaPanel({ onClose }: MeetingAgendaPanelProps) {
  const navigate = useNavigate();
  const meeting = useAppStore((s) => s.meeting);
  const getMeetingEvents = useAppStore((s) => s.getMeetingEvents);
  const getAnnotationsByEventId = useAppStore((s) => s.getAnnotationsByEventId);
  const getTodosByEventId = useAppStore((s) => s.getTodosByEventId);
  const setCurrentMeetingEventIndex = useAppStore((s) => s.setCurrentMeetingEventIndex);
  const setMeetingStep = useAppStore((s) => s.setMeetingStep);
  const resetScenarioState = useAppStore((s) => s.resetScenarioState);

  const events = getMeetingEvents();

  const getEventProgress = (event: RiskEvent, index: number): { currentStep: MeetingStep; isCompleted: boolean } => {
    if (meeting.discussedEventIds.includes(event.id)) {
      return { currentStep: 'annotations', isCompleted: true };
    }
    if (index === meeting.currentEventIndex) {
      return { currentStep: meeting.currentStep, isCompleted: false };
    }
    return { currentStep: 'overview', isCompleted: false };
  };

  const navigateToStep = (step: MeetingStep, eventId: string) => {
    if (step === 'overview') {
      navigate('/');
    } else if (step === 'scenario') {
      resetScenarioState();
      navigate(`/scenario/${eventId}`);
    } else if (step === 'annotations') {
      navigate('/annotations');
    }
  };

  const handleJumpToEvent = (event: RiskEvent, index: number) => {
    const progress = getEventProgress(event, index);
    setCurrentMeetingEventIndex(index, progress.currentStep);
    setMeetingStep(progress.currentStep);
    navigateToStep(progress.currentStep, event.id);
    onClose();
  };

  const discussedCount = meeting.discussedEventIds.length;
  const totalCount = events.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-navy-900 to-navy-800 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-brand-gold" />
              会议议程
            </h3>
            <p className="text-xs text-navy-300 mt-0.5">
              已讨论 {discussedCount}/{totalCount} 项 · 点击任一项可跳转继续
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-navy-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="divide-y divide-slate-100">
            {events.map((event, index) => {
              const levelInfo = getRiskLevelInfo(event.level);
              const progress = getEventProgress(event, index);
              const annotationCount = getAnnotationsByEventId(event.id).length;
              const todoCount = getTodosByEventId(event.id).length;
              const isCurrent = index === meeting.currentEventIndex;

              return (
                <div
                  key={event.id}
                  className={`px-6 py-4 transition-colors ${
                    isCurrent ? 'bg-brand-gold/5 border-l-4 border-brand-gold' : 'hover:bg-slate-50 border-l-4 border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold ${
                          progress.isCompleted
                            ? 'bg-risk-safe/10 text-risk-safe'
                            : isCurrent
                            ? 'bg-brand-gold text-navy-950'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {progress.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`tag-chip text-[10px] ${levelInfo.bgLightClass} ${levelInfo.textClass}`}
                            >
                              {levelInfo.label}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-medium">
                                当前讨论
                              </span>
                            )}
                            {progress.isCompleted && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-risk-safe/10 text-risk-safe font-medium">
                                已完成
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-medium text-slate-800 leading-snug">
                            {event.title}
                          </h4>
                        </div>

                        <button
                          onClick={() => handleJumpToEvent(event, index)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-50 text-navy-700 hover:bg-navy-100 transition-colors flex-shrink-0"
                        >
                          跳转
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500">进度：</span>
                          <div className="flex items-center gap-1">
                            {steps.map((step) => {
                              const StepIcon = step.icon;
                              const stepIndex = steps.findIndex((s) => s.key === step.key);
                              const currentStepIndex = steps.findIndex(
                                (s) => s.key === progress.currentStep
                              );
                              const isStepPassed =
                                progress.isCompleted || stepIndex < currentStepIndex;
                              const isStepCurrent =
                                !progress.isCompleted && step.key === progress.currentStep;

                              return (
                                <div
                                  key={step.key}
                                  className={`flex items-center ${
                                    stepIndex < steps.length - 1 ? 'pr-2' : ''
                                  }`}
                                >
                                  <div
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${
                                      isStepCurrent
                                        ? 'bg-brand-gold/20 text-brand-gold'
                                        : isStepPassed
                                        ? 'bg-risk-safe/10 text-risk-safe'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}
                                  >
                                    <StepIcon className="w-3 h-3" />
                                    <span className="text-[10px] font-medium">
                                      {step.label}
                                    </span>
                                  </div>
                                  {stepIndex < steps.length - 1 && (
                                    <div
                                      className={`w-3 h-px mx-0.5 ${
                                        isStepPassed ? 'bg-risk-safe/40' : 'bg-slate-200'
                                      }`}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-slate-500">
                          <MessageSquareText className="w-3.5 h-3.5" />
                          <span>{annotationCount} 条批注</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          <ListTodo className="w-3.5 h-3.5" />
                          <span>{todoCount} 项待办</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
