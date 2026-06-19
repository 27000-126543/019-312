import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  GitBranch,
  MessageSquare,
  FileDown,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { MeetingStep } from '@/types';
import { exportMinutes } from '@/utils/exportMinutes';

const attendees = ['张行长', '王行长', '李总', '赵总', '刘总', '陈总'];

const steps: { key: MeetingStep; label: string; icon: typeof LayoutDashboard }[] = [
  { key: 'overview', label: '总览', icon: LayoutDashboard },
  { key: 'scenario', label: '推演', icon: GitBranch },
  { key: 'annotations', label: '批注', icon: MessageSquare },
];

export default function MeetingControlBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const meeting = useAppStore((s) => s.meeting);
  const endMeeting = useAppStore((s) => s.endMeeting);
  const setMeetingStep = useAppStore((s) => s.setMeetingStep);
  const getMeetingEvents = useAppStore((s) => s.getMeetingEvents);
  const getCurrentMeetingEvent = useAppStore((s) => s.getCurrentMeetingEvent);
  const getMeetingAnnotations = useAppStore((s) => s.getMeetingAnnotations);
  const getMeetingTodos = useAppStore((s) => s.getMeetingTodos);
  const resetScenarioState = useAppStore((s) => s.resetScenarioState);
  const setCurrentMeetingEventIndex = useAppStore((s) => s.setCurrentMeetingEventIndex);

  const currentEvent = getCurrentMeetingEvent();
  const totalEvents = meeting.selectedEventIds.length;
  const isLastEvent = meeting.currentEventIndex === totalEvents - 1;
  const isLastStep = meeting.currentStep === 'annotations';
  const isFinished = isLastEvent && isLastStep;

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

  const handleStartMeeting = () => {
    if (meeting.selectedEventIds.length === 0) return;
    const firstEventId = meeting.selectedEventIds[0];
    setCurrentMeetingEventIndex(0);
    setMeetingStep('overview');
    navigate('/');
  };

  const handleStepClick = (step: MeetingStep) => {
    setMeetingStep(step);
    if (currentEvent) {
      navigateToStep(step, currentEvent.id);
    }
  };

  const handleNext = () => {
    if (!currentEvent) return;

    const stepsOrder: MeetingStep[] = ['overview', 'scenario', 'annotations'];
    const currentStepIndex = stepsOrder.indexOf(meeting.currentStep);

    if (currentStepIndex < stepsOrder.length - 1) {
      const nextStep = stepsOrder[currentStepIndex + 1];
      setMeetingStep(nextStep);
      navigateToStep(nextStep, currentEvent.id);
    } else if (!isLastEvent) {
      const nextIndex = meeting.currentEventIndex + 1;
      setCurrentMeetingEventIndex(nextIndex);
      setMeetingStep('overview');
      const nextEvent = getCurrentMeetingEvent();
      if (nextEvent) {
        navigateToStep('overview', nextEvent.id);
      }
    }
  };

  const handlePrevEvent = () => {
    if (meeting.currentEventIndex === 0) return;
    const prevIndex = meeting.currentEventIndex - 1;
    setCurrentMeetingEventIndex(prevIndex);
    setMeetingStep('overview');
    const events = getMeetingEvents();
    const prevEvent = events[prevIndex];
    if (prevEvent) {
      navigateToStep('overview', prevEvent.id);
    }
  };

  const handleNextEvent = () => {
    if (isLastEvent) return;
    const nextIndex = meeting.currentEventIndex + 1;
    setCurrentMeetingEventIndex(nextIndex);
    setMeetingStep('overview');
    const events = getMeetingEvents();
    const nextEvent = events[nextIndex];
    if (nextEvent) {
      navigateToStep('overview', nextEvent.id);
    }
  };

  const handleExport = () => {
    const events = getMeetingEvents();
    const annotations = getMeetingAnnotations();
    const todos = getMeetingTodos();
    exportMinutes(events, annotations, todos, {
      format: 'txt',
      attendees,
      isMeetingExport: true,
      meetingStartTime: meeting.startTime,
    });
  };

  const handleEndMeeting = () => {
    handleExport();
    endMeeting();
    navigate('/');
  };

  useEffect(() => {
    if (!meeting.isActive || !currentEvent) return;

    const pathname = location.pathname;
    let detectedStep: MeetingStep | null = null;

    if (pathname === '/') detectedStep = 'overview';
    else if (pathname.startsWith('/scenario/')) detectedStep = 'scenario';
    else if (pathname === '/annotations') detectedStep = 'annotations';

    if (detectedStep && detectedStep !== meeting.currentStep) {
      setMeetingStep(detectedStep);
    }
  }, [location.pathname, meeting.isActive, currentEvent?.id]);

  if (!meeting.isActive) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="bg-navy-900 text-white rounded-2xl shadow-2xl shadow-navy-900/30 px-4 py-3 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10">
          <div className="w-2 h-2 rounded-full bg-risk-safe animate-pulse-soft" />
          <span className="text-sm font-medium">会议进行中</span>
          <span className="text-xs text-navy-300">
            议题 {meeting.currentEventIndex + 1}/{totalEvents}
          </span>
          {currentEvent && (
            <span className="text-[10px] text-navy-400 max-w-[120px] truncate ml-1 border-l border-white/10 pl-2">
              {currentEvent.title}
            </span>
          )}
        </div>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <div className="flex items-center gap-1">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = meeting.currentStep === step.key;
            return (
              <button
                key={step.key}
                onClick={() => handleStepClick(step.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-brand-gold text-navy-950 font-medium'
                    : 'text-navy-200 hover:bg-white/10'
                }`}
              >
                <Icon className="w-4 h-4" />
                {step.label}
              </button>
            );
          })}
        </div>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={handlePrevEvent}
            disabled={meeting.currentEventIndex === 0}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-navy-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="上一个议题"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextEvent}
            disabled={isLastEvent}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-navy-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="下一个议题"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleNext}
            disabled={isFinished}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isFinished ? '全部完成' : '下一步'}
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-navy-200 hover:bg-white/10 transition-colors"
          >
            <FileDown className="w-4 h-4" />
            导出
          </button>
          <button
            onClick={handleEndMeeting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-risk-safe text-white hover:bg-risk-safe/90 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            结束
          </button>
        </div>
      </div>
    </div>
  );
}
