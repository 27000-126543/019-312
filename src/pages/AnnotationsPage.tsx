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
  CheckSquare,
  Square,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import EventSidebar from '@/components/annotations/EventSidebar';
import AnnotationBubble from '@/components/annotations/AnnotationBubble';
import AnnotationInput from '@/components/annotations/AnnotationInput';
import TodoPanel from '@/components/annotations/TodoPanel';
import { useAppStore } from '@/store/useAppStore';
import { getRiskLevelInfo } from '@/utils/formatters';
import { exportMinutes } from '@/utils/exportMinutes';
import { AnnotationCategory, TodoStatus } from '@/types';
import MeetingControlBar from '@/components/meeting/MeetingControlBar';

const commonOwners = ['品牌公关部', '法务部', '数字银行部', '属地分行', '内审部', '业务部门', '办公室'];

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
  const batchUpdateTodos = useAppStore((s) => s.batchUpdateTodos);
  const meeting = useAppStore((s) => s.meeting);
  const getMeetingEvents = useAppStore((s) => s.getMeetingEvents);
  const getMeetingAnnotations = useAppStore((s) => s.getMeetingAnnotations);
  const getMeetingTodos = useAppStore((s) => s.getMeetingTodos);
  const setMeetingStep = useAppStore((s) => s.setMeetingStep);

  const displayEvents = meeting.isActive ? getMeetingEvents() : events;
  const displayTodos = meeting.isActive ? getMeetingTodos() : todos;

  const [selectedEventId, setSelectedEventId] = useState<string>(
    meeting.isActive && meeting.selectedEventIds.length > 0
      ? meeting.selectedEventIds[meeting.currentEventIndex]
      : events[0]?.id || ''
  );
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all');
  const [selectedTodoOwner, setSelectedTodoOwner] = useState<string>('all');
  const [selectedTodoStatus, setSelectedTodoStatus] = useState<TodoStatus | 'all'>('all');
  const [selectedTodoIdsForExport, setSelectedTodoIdsForExport] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('annotations');
  const [batchAction, setBatchAction] = useState<'none' | 'owner' | 'status'>('none');

  const allOwners = useMemo(() => {
    const owners = new Set<string>();
    displayTodos.forEach((t) => owners.add(t.owner));
    return Array.from(owners);
  }, [displayTodos]);

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
    let result = getTodosByEventId(selectedEventId);
    if (selectedTodoOwner !== 'all') {
      result = result.filter((t) => t.owner === selectedTodoOwner);
    }
    if (selectedTodoStatus !== 'all') {
      result = result.filter((t) => t.status === selectedTodoStatus);
    }
    return result;
  }, [selectedEventId, todos, selectedTodoOwner, selectedTodoStatus]);

  const allRelevantTodos = meeting.isActive ? getMeetingTodos() : todos;

  const handleToggleTodoSelect = (todoId: string) => {
    setSelectedTodoIdsForExport((prev) =>
      prev.includes(todoId) ? prev.filter((id) => id !== todoId) : [...prev, todoId]
    );
  };

  const handleSelectAllTodos = () => {
    if (selectedTodoIdsForExport.length === eventTodos.length) {
      setSelectedTodoIdsForExport([]);
    } else {
      setSelectedTodoIdsForExport(eventTodos.map((t) => t.id));
    }
  };

  const handleBatchOwnerChange = (owner: string) => {
    if (selectedTodoIdsForExport.length === 0) return;
    batchUpdateTodos(selectedTodoIdsForExport, { owner, ownerRole: owner });
    setBatchAction('none');
  };

  const handleBatchStatusChange = (status: TodoStatus) => {
    if (selectedTodoIdsForExport.length === 0) return;
    batchUpdateTodos(selectedTodoIdsForExport, { status });
    setBatchAction('none');
  };

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
    const allTodos = meeting.isActive ? getMeetingTodos() : todos;
    const exportTodos =
      selectedTodoIdsForExport.length > 0
        ? allTodos.filter((t) => selectedTodoIdsForExport.includes(t.id))
        : allTodos;

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
                    <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Filter className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs text-slate-500 font-medium">待办筛选</span>
                        </div>
                        {eventTodos.length > 0 && (
                          <div className="flex items-center gap-2">
                            {selectedTodoIdsForExport.length > 0 && (
                              <>
                                {batchAction === 'owner' ? (
                                  <select
                                    className="text-xs px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                                    defaultValue=""
                                    onChange={(e) => {
                                      if (e.target.value) handleBatchOwnerChange(e.target.value);
                                      else setBatchAction('none');
                                    }}
                                    autoFocus
                                  >
                                    <option value="">选择新负责人...</option>
                                    {commonOwners.map((owner) => (
                                      <option key={owner} value={owner}>
                                        {owner}
                                      </option>
                                    ))}
                                  </select>
                                ) : batchAction === 'status' ? (
                                  <select
                                    className="text-xs px-2 py-1 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-gold"
                                    defaultValue=""
                                    onChange={(e) => {
                                      if (e.target.value) handleBatchStatusChange(e.target.value as TodoStatus);
                                      else setBatchAction('none');
                                    }}
                                    autoFocus
                                  >
                                    <option value="">选择新状态...</option>
                                    <option value="pending">待处理</option>
                                    <option value="in_progress">处理中</option>
                                    <option value="completed">已完成</option>
                                  </select>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => setBatchAction('owner')}
                                      className="flex items-center gap-1 px-2 py-1 text-xs text-navy-700 bg-navy-50 rounded hover:bg-navy-100 transition-colors"
                                    >
                                      <Users className="w-3.5 h-3.5" />
                                      改负责人
                                    </button>
                                    <button
                                      onClick={() => setBatchAction('status')}
                                      className="flex items-center gap-1 px-2 py-1 text-xs text-navy-700 bg-navy-50 rounded hover:bg-navy-100 transition-colors"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      改状态
                                    </button>
                                  </>
                                )}
                              </>
                            )}
                            <button
                              onClick={handleSelectAllTodos}
                              className="flex items-center gap-1.5 text-xs text-navy-700 hover:text-navy-900 transition-colors"
                            >
                              {selectedTodoIdsForExport.length === eventTodos.length ? (
                                <CheckSquare className="w-3.5 h-3.5 fill-brand-gold/10 text-brand-gold" />
                              ) : (
                                <Square className="w-3.5 h-3.5" />
                              )}
                              {selectedTodoIdsForExport.length === eventTodos.length ? '取消全选' : '全选'}
                            </button>
                          </div>
                        )}
                      </div>
                      {selectedTodoIdsForExport.length > 0 && (
                        <div className="text-xs text-brand-gold font-medium bg-brand-gold/5 px-3 py-2 rounded-lg mb-3">
                          已选择 {selectedTodoIdsForExport.length} 项待办 · 批量修改将立即同步到议程面板和复盘页
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <div className="text-[10px] text-slate-400 mb-1.5">按负责人</div>
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => setSelectedTodoOwner('all')}
                              className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
                                selectedTodoOwner === 'all'
                                  ? 'bg-navy-900 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              全部
                            </button>
                            {allOwners.map((owner) => (
                              <button
                                key={owner}
                                onClick={() => setSelectedTodoOwner(owner)}
                                className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
                                  selectedTodoOwner === owner
                                    ? 'bg-navy-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {owner}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 mb-1.5">按状态</div>
                          <div className="flex flex-wrap gap-1">
                            <button
                              onClick={() => setSelectedTodoStatus('all')}
                              className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
                                selectedTodoStatus === 'all'
                                  ? 'bg-navy-900 text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              全部
                            </button>
                            {(['pending', 'in_progress', 'completed'] as TodoStatus[]).map((status) => (
                              <button
                                key={status}
                                onClick={() => setSelectedTodoStatus(status)}
                                className={`px-2 py-1 text-[10px] rounded-md transition-colors ${
                                  selectedTodoStatus === status
                                    ? 'bg-navy-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {status === 'pending' ? '待处理' : status === 'in_progress' ? '处理中' : '已完成'}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <TodoPanel
                      todos={eventTodos}
                      onStatusChange={handleTodoStatusChange}
                      selectable={eventTodos.length > 0}
                      selectedTodoIds={selectedTodoIdsForExport}
                      onToggleSelect={handleToggleTodoSelect}
                    />

                    {selectedTodoIdsForExport.length > 0 && (
                      <div className="mt-4 flex items-center justify-between bg-brand-gold/10 border border-brand-gold/30 rounded-xl p-3">
                        <div className="text-sm text-navy-800">
                          已选择 <span className="font-semibold text-brand-gold">{selectedTodoIdsForExport.length}</span> 项待办将包含在纪要中
                        </div>
                        <button
                          onClick={handleExport}
                          className="px-4 py-2 rounded-lg bg-brand-gold text-navy-950 text-sm font-medium hover:bg-brand-gold/90 transition-colors"
                        >
                          导出选中待办
                        </button>
                      </div>
                    )}
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
