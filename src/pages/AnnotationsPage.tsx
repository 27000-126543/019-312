import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileDown,
  Users,
  ListTodo,
  Filter,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import EventSidebar from '@/components/annotations/EventSidebar';
import AnnotationBubble from '@/components/annotations/AnnotationBubble';
import AnnotationInput from '@/components/annotations/AnnotationInput';
import TodoPanel from '@/components/annotations/TodoPanel';
import MeetingControlBar from '@/components/meeting/MeetingControlBar';
import { useAppStore } from '@/store/useAppStore';
import { getRiskLevelInfo } from '@/utils/formatters';
import { AnnotationCategory, TodoStatus } from '@/types';
import { exportMinutes } from '@/utils/exportMinutes';

const iconMap = {
  critical: AlertTriangle,
  warning: Clock,
  resolved: CheckCircle2,
};

const attendees = ['张行长', '王行长', '李总', '赵总', '刘总', '陈总'];

type ViewMode = 'annotations' | 'todos';

export default function AnnotationsPage() {
  const navigate = useNavigate();
  const events = useAppStore((s) => s.events);
  const annotations = useAppStore((s) => s.annotations);
  const todos = useAppStore((s) => s.todos);
  const addAnnotation = useAppStore((s) => s.addAnnotation);
  const getAnnotationsByEventId = useAppStore((s) => s.getAnnotationsByEventId);
  const getTodosByEventId = useAppStore((s) => s.getTodosByEventId);
  const updateTodoStatus = useAppStore((s) => s.updateTodoStatus);
  const meeting = useAppStore((s) => s.meeting);
  const getMeetingEvents = useAppStore((s) => s.getMeetingEvents);
  const getMeetingAnnotations = useAppStore((s) => s.getMeetingAnnotations);
  const getMeetingTodos = useAppStore((s) => s.getMeetingTodos);
  const setMeetingStep = useAppStore((s) => s.setMeetingStep);

  const displayEvents = meeting.isActive ? getMeetingEvents() : events;
  const [selectedEventId, setSelectedEventId] = useState<string>(
    meeting.isActive && meeting.selectedEventIds.length > 0
      ? meeting.selectedEventIds[meeting.currentEventIndex]
      : events[0]?.id || ''
  );
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('annotations');

  useEffect(() => {
    if (meeting.isActive && meeting.selectedEventIds.length > 0) {
      setSelectedEventId(meeting.selectedEventIds[meeting.currentEventIndex]);
      setMeetingStep('annotations');
    }
  }, [meeting.currentEventIndex, meeting.isActive]);

  const selectedEvent = displayEvents.find((e) => e.id === selectedEventId);

  const eventAnnotations = useMemo(() => {
    if (!selectedEventId) return [];
    let result = getAnnotationsByEventId(selectedEventId);
    if (selectedAuthor !== 'all') {
      result = result.filter((a) => a.author === selectedAuthor);
    }
    return result;
  }, [selectedEventId, selectedAuthor, annotations]);

  const eventTodos = useMemo(() => {
    if (!selectedEventId) return [];
    return getTodosByEventId(selectedEventId);
  }, [selectedEventId, todos]);

  const allRelevantTodos = meeting.isActive ? getMeetingTodos() : todos;

  const annotationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const relevantAnnotations = meeting.isActive ? getMeetingAnnotations() : annotations;
    relevantAnnotations.forEach((a) => {
      counts[a.eventId] = (counts[a.eventId] || 0) + 1;
    });
    return counts;
  }, [annotations, meeting.isActive]);

  const handleSubmitAnnotation = (
    content: string,
    author: { name: string; role: string },
    category?: AnnotationCategory
  ) => {
    addAnnotation({
      eventId: selectedEventId,
      author: author.name,
      role: author.role,
      content,
      category,
    });
  };

  const handleExport = () => {
    const exportEvents = meeting.isActive ? getMeetingEvents() : events;
    const exportAnnotations = meeting.isActive ? getMeetingAnnotations() : annotations;
    const exportTodos = meeting.isActive ? getMeetingTodos() : todos;

    exportMinutes(exportEvents, exportAnnotations, exportTodos, {
      format: 'txt',
      attendees,
      isMeetingExport: meeting.isActive,
      meetingStartTime: meeting.startTime,
    });
  };

  const handleTodoStatusChange = (todoId: string, status: TodoStatus) => {
    updateTodoStatus(todoId, status);
  };

  const levelInfo = selectedEvent ? getRiskLevelInfo(selectedEvent.level) : null;
  const EventIcon = selectedEvent ? iconMap[selectedEvent.level] : AlertTriangle;

  return (
    <div className="h-screen flex flex-col">
      <AppHeader />

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 bg-white border-r border-slate-200 flex-shrink-0 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-100">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 transition-colors mb-3"
            >
              <ChevronLeft className="w-4 h-4" />
              返回总览
            </button>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-navy-700" />
                批注意见
              </h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setViewMode('annotations')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    viewMode === 'annotations'
                      ? 'bg-navy-900 text-white'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                  title="批注"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('todos')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    viewMode === 'todos'
                      ? 'bg-navy-900 text-white'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                  title="待办"
                >
                  <ListTodo className="w-4 h-4" />
                </button>
              </div>
            </div>
            {meeting.isActive && (
              <div className="mt-2 text-xs text-risk-safe font-medium">
                会议模式 · 仅显示上会议题
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-500 font-medium">按发言人筛选</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setSelectedAuthor('all')}
                className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                  selectedAuthor === 'all'
                    ? 'bg-navy-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                全部
              </button>
              {attendees.slice(0, 5).map((name) => (
                <button
                  key={name}
                  onClick={() => setSelectedAuthor(name)}
                  className={`px-2.5 py-1 text-[11px] rounded-md transition-colors ${
                    selectedAuthor === name
                      ? 'bg-navy-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <EventSidebar
            events={displayEvents}
            selectedId={selectedEventId}
            onSelect={setSelectedEventId}
            annotationCounts={annotationCounts}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedEvent && levelInfo ? (
            <>
              <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl ${levelInfo.bgLightClass} flex items-center justify-center flex-shrink-0`}
                  >
                    <EventIcon className={`w-5 h-5 ${levelInfo.textClass}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`tag-chip text-xs ${levelInfo.bgLightClass} ${levelInfo.textClass}`}
                      >
                        {levelInfo.label}
                      </span>
                      <span className="text-xs text-slate-500">{selectedEvent.updatedAt}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-navy-50 text-navy-700 font-medium">
                        {eventAnnotations.length} 条意见
                      </span>
                      {eventTodos.length > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                          {eventTodos.length} 项待办
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-serif font-semibold text-slate-800 leading-snug">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {selectedEvent.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {viewMode === 'todos' && eventTodos.length > 0 && (
                    <div className="text-sm text-slate-500 mr-2">
                      本事件 {eventTodos.length} 项待办
                    </div>
                  )}
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/20 flex-shrink-0"
                  >
                    <FileDown className="w-4 h-4" />
                    导出会议纪要
                  </button>
                </div>
              </div>

              {viewMode === 'annotations' ? (
                <>
                  <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 bg-slate-50/50">
                    {eventAnnotations.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                          <MessageSquare className="w-8 h-8 text-slate-400" />
                        </div>
                        <h4 className="text-base font-medium text-slate-700 mb-1">
                          暂无批注意见
                        </h4>
                        <p className="text-sm text-slate-500 max-w-xs">
                          请参会人员针对本事件发表意见和决策，会后可一键导出会议纪要
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-5 max-w-3xl">
                        {eventAnnotations.map((ann, idx) => (
                          <AnnotationBubble key={ann.id} annotation={ann} index={idx} />
                        ))}
                      </div>
                    )}
                  </div>

                  <AnnotationInput onSubmit={handleSubmitAnnotation} />
                </>
              ) : (
                <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 bg-slate-50/50">
                  <div className="max-w-2xl mx-auto">
                    <TodoPanel
                      todos={eventTodos}
                      onStatusChange={handleTodoStatusChange}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500">请选择一个事件</p>
            </div>
          )}
        </div>
      </div>

      <MeetingControlBar />
    </div>
  );
}
