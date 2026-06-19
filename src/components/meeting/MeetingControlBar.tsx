import { useNavigate } from 'react-router-dom';
import {
  Play,
  Square,
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
  const meeting = useAppStore((s) => s.meeting);
  const startMeeting = useAppStore((s) => s.startMeeting);
  const endMeeting = useAppStore((s) => s.endMeeting);
  const setMeetingStep = useAppStore((s) => s.setMeetingStep);
  const nextMeetingStep = useAppStore((s) => s.nextMeetingStep);
  const prevMeetingEvent = useAppStore((s) => s.prevMeetingEvent);
  const nextMeetingEvent = useAppStore((s) => s.nextMeetingEvent);
  const getMeetingEvents = useAppStore((s) => s.getMeetingEvents);
  const getCurrentMeetingEvent = useAppStore((s) => s.getCurrentMeetingEvent);
  const getMeetingAnnotations = useAppStore((s) => s.getMeetingAnnotations);
  const getMeetingTodos = useAppStore((s) => s.getMeetingTodos);
  const resetScenarioState = useAppStore((s) => s.resetScenarioState);

  const meetingEvents = getMeetingEvents();
  const currentEvent = getCurrentMeetingEvent();
  const isLastStep =
    meeting.currentStep === 'annotations' &&
    meeting.currentEventIndex === meeting.selectedEventIds.length - 1;

  const handleStartMeeting = () => {
    if (meeting.selectedEventIds.length === 0) return;
    startMeeting();
    const firstEventId = meeting.selectedEventIds[0];
    navigate(`/scenario/${firstEventId}`);
  };

  const handleStepClick = (step: MeetingStep) => {
    setMeetingStep(step);
    if (currentEvent) {
      if (step === 'overview') {
        navigate('/');
      } else if (step === 'scenario') {
        resetScenarioState();
        navigate(`/scenario/${currentEvent.id}`);
      } else if (step === 'annotations') {
        navigate('/annotations');
      }
    }
  };

  const handleNext = () => {
    if (isLastStep) return;
    nextMeetingStep();
    const nextEvent = getCurrentMeetingEvent();
    if (nextEvent) {
      if (meeting.currentStep === 'overview') {
        navigate('/');
      } else if (meeting.currentStep === 'scenario') {
        resetScenarioState();
        navigate(`/scenario/${nextEvent.id}`);
      } else if (meeting.currentStep === 'annotations') {
        navigate('/annotations');
      }
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
            {meeting.currentEventIndex + 1}/{meeting.selectedEventIds.length}
          </span>
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
            onClick={prevMeetingEvent}
            disabled={meeting.currentEventIndex === 0}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-navy-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMeetingEvent}
            disabled={meeting.currentEventIndex >= meeting.selectedEventIds.length - 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-navy-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="w-px h-6 bg-white/20 mx-1" />

        <div className="flex items-center gap-1">
          <button
            onClick={handleNext}
            disabled={isLastStep}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 text-white hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            下一步
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
