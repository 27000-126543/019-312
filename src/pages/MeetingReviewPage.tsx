import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  ListTodo,
  FileDown,
  CalendarClock,
  ArrowRight,
  CheckSquare,
  Square,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import { useAppStore } from '@/store/useAppStore';
import { getRiskLevelInfo } from '@/utils/formatters';
import { exportMinutes } from '@/utils/exportMinutes';
import { TodoStatus } from '@/types';

const attendees = ['张行长', '王行长', '李总', '赵总', '刘总', '陈总'];

export default function MeetingReviewPage() {
  const navigate = useNavigate();
  const meeting = useAppStore((s) => s.meeting);
  const endMeeting = useAppStore((s) => s.endMeeting);
  const getMeetingEvents = useAppStore((s) => s.getMeetingEvents);
  const getMeetingAnnotations = useAppStore((s) => s.getMeetingAnnotations);
  const getMeetingTodos = useAppStore((s) => s.getMeetingTodos);

  const [selectedTodoIds, setSelectedTodoIds] = useState<string[]>([]);

  const events = getMeetingEvents();
  const annotations = getMeetingAnnotations();
  const todos = getMeetingTodos();

  const discussedEvents = events.filter((e) => meeting.discussedEventIds.includes(e.id));
  const undiscussedEvents = events.filter((e) => !meeting.discussedEventIds.includes(e.id));

  const pendingTodos = todos.filter((t) => t.status !== 'completed');

  const ownerDistribution = useMemo(() => {
    const dist: Record<string, { total: number; pending: number; inProgress: number; completed: number }> = {};
    todos.forEach((t) => {
      if (!dist[t.owner]) {
        dist[t.owner] = { total: 0, pending: 0, inProgress: 0, completed: 0 };
      }
      dist[t.owner].total += 1;
      if (t.status === 'pending') dist[t.owner].pending += 1;
      else if (t.status === 'in_progress') dist[t.owner].inProgress += 1;
      else if (t.status === 'completed') dist[t.owner].completed += 1;
    });
    return dist;
  }, [todos]);

  const handleToggleTodo = (todoId: string) => {
    setSelectedTodoIds((prev) =>
      prev.includes(todoId) ? prev.filter((id) => id !== todoId) : [...prev, todoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedTodoIds.length === pendingTodos.length) {
      setSelectedTodoIds([]);
    } else {
      setSelectedTodoIds(pendingTodos.map((t) => t.id));
    }
  };

  const handleExport = () => {
    const exportTodos = selectedTodoIds.length > 0
      ? todos.filter((t) => selectedTodoIds.includes(t.id))
      : todos;
    exportMinutes(discussedEvents, annotations, exportTodos, {
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

  const handleBack = () => {
    const currentEvent = events[meeting.currentEventIndex];
    if (currentEvent) {
      navigate(`/scenario/${currentEvent.id}`);
    } else {
      navigate('/');
    }
  };

  if (!meeting.isActive) {
    navigate('/');
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <AppHeader />

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="mb-6">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-navy-700 transition-colors mb-4"
            >
              <ChevronLeft className="w-4 h-4" />
              返回继续会议
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-serif font-bold text-navy-900 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-gold/20 flex items-center justify-center">
                    <CalendarClock className="w-5 h-5 text-brand-gold" />
                  </div>
                  会议复盘
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  请确认会议讨论结果，选择需要跟进的待办事项后导出纪要
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <FileDown className="w-4 h-4" />
                  预览导出
                </button>
                <button
                  onClick={handleEndMeeting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-risk-safe text-white hover:bg-risk-safe/90 transition-colors font-medium shadow-lg shadow-risk-safe/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  确认并结束会议
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">上会议题</div>
              <div className="text-2xl font-bold text-navy-900">{events.length}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">已讨论</div>
              <div className="text-2xl font-bold text-risk-safe">{discussedEvents.length}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">待办总数</div>
              <div className="text-2xl font-bold text-navy-900">{todos.length}</div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="text-xs text-slate-500 mb-1">待跟进</div>
              <div className="text-2xl font-bold text-risk-warning">{pendingTodos.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <CheckCircle2 className="w-4.5 h-4.5 text-risk-safe" />
                <h3 className="text-sm font-semibold text-slate-800">已讨论议题</h3>
                <span className="text-xs text-risk-safe bg-risk-safe/10 px-2 py-0.5 rounded-full">
                  {discussedEvents.length} 项
                </span>
              </div>
              <div className="p-4 space-y-2">
                {discussedEvents.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-sm">暂无已讨论议题</div>
                ) : (
                  discussedEvents.map((event) => {
                    const levelInfo = getRiskLevelInfo(event.level);
                    const eventAnnotations = annotations.filter((a) => a.eventId === event.id);
                    const eventTodos = todos.filter((t) => t.eventId === event.id);
                    return (
                      <div
                        key={event.id}
                        className="p-3 rounded-xl bg-risk-safe/5 border border-risk-safe/20"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${levelInfo.bgLightClass} flex items-center justify-center flex-shrink-0`}
                          >
                            <CheckCircle2 className={`w-4 h-4 ${levelInfo.textClass}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className={`tag-chip text-[10px] ${levelInfo.bgLightClass} ${levelInfo.textClass}`}
                              >
                                {levelInfo.label}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-slate-800 leading-snug">
                              {event.title}
                            </h4>
                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                              <span>{eventAnnotations.length} 条批注</span>
                              <span>{eventTodos.length} 项待办</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-risk-warning" />
                <h3 className="text-sm font-semibold text-slate-800">未讨论议题</h3>
                <span className="text-xs text-risk-warning bg-risk-warning/10 px-2 py-0.5 rounded-full">
                  {undiscussedEvents.length} 项
                </span>
              </div>
              <div className="p-4 space-y-2">
                {undiscussedEvents.length === 0 ? (
                  <div className="text-center py-6 text-risk-safe text-sm">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    全部议题已讨论完毕
                  </div>
                ) : (
                  undiscussedEvents.map((event) => {
                    const levelInfo = getRiskLevelInfo(event.level);
                    return (
                      <div
                        key={event.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg ${levelInfo.bgLightClass} flex items-center justify-center flex-shrink-0`}
                          >
                            <Clock className={`w-4 h-4 ${levelInfo.textClass}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className={`tag-chip text-[10px] ${levelInfo.bgLightClass} ${levelInfo.textClass}`}
                              >
                                {levelInfo.label}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-slate-800 leading-snug">
                              {event.title}
                            </h4>
                            <button
                              onClick={() => navigate('/')}
                              className="mt-1.5 text-[11px] text-navy-700 flex items-center gap-0.5 hover:text-navy-900"
                            >
                              返回讨论 <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-navy-700" />
                  <h3 className="text-sm font-semibold text-slate-800">待办负责人分布</h3>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(ownerDistribution).map(([owner, stats]) => (
                  <div
                    key={owner}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="text-sm font-medium text-slate-800 mb-2">{owner}</div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500">共{stats.total}项</span>
                      <span className="text-risk-warning">待办{stats.pending}</span>
                      <span className="text-sky-600">进行{stats.inProgress}</span>
                      <span className="text-risk-safe">完成{stats.completed}</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                      {stats.pending > 0 && (
                        <div
                          className="h-full bg-risk-warning"
                          style={{ width: `${(stats.pending / stats.total) * 100}%` }}
                        />
                      )}
                      {stats.inProgress > 0 && (
                        <div
                          className="h-full bg-sky-500"
                          style={{ width: `${(stats.inProgress / stats.total) * 100}%` }}
                        />
                      )}
                      {stats.completed > 0 && (
                        <div
                          className="h-full bg-risk-safe"
                          style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListTodo className="w-4.5 h-4.5 text-navy-700" />
                  <h3 className="text-sm font-semibold text-slate-800">待跟进事项</h3>
                  <span className="text-xs text-risk-warning bg-risk-warning/10 px-2 py-0.5 rounded-full">
                    {pendingTodos.length} 项
                  </span>
                </div>
                {pendingTodos.length > 0 && (
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-1.5 text-xs text-navy-700 hover:text-navy-900 transition-colors"
                  >
                    {selectedTodoIds.length === pendingTodos.length ? (
                      <CheckSquare className="w-3.5 h-3.5 fill-brand-gold/10 text-brand-gold" />
                    ) : (
                      <Square className="w-3.5 h-3.5" />
                    )}
                    {selectedTodoIds.length === pendingTodos.length ? '取消全选' : '全选导出'}
                  </button>
                )}
              </div>
              {pendingTodos.length > 0 && (
                <p className="text-xs text-slate-400 mt-1">
                  勾选需要纳入纪要的待办事项，未勾选的事项不会出现在导出的纪要中
                </p>
              )}
            </div>
            <div className="p-4">
              {pendingTodos.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">所有待办事项已完成</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {pendingTodos.map((todo) => {
                    const isSelected = selectedTodoIds.includes(todo.id);
                    return (
                      <div
                        key={todo.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-brand-gold/5 border-brand-gold ring-2 ring-brand-gold/20'
                            : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => handleToggleTodo(todo.id)}
                            className="w-5 h-5 mt-0.5 flex-shrink-0 text-brand-gold hover:opacity-80 transition-opacity"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-5 h-5 fill-brand-gold/10" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full ${
                                  todo.status === 'pending'
                                    ? 'bg-risk-warning/10 text-risk-warning'
                                    : 'bg-sky-100 text-sky-700'
                                }`}
                              >
                                {todo.status === 'pending' ? '待处理' : '处理中'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {todo.eventTitle}
                              </span>
                            </div>
                            <p className="text-sm text-slate-800 leading-relaxed">
                              {todo.content}
                            </p>
                            <div className="mt-1.5 text-xs text-slate-500">
                              责任人：<span className="text-slate-700 font-medium">{todo.owner}</span>
                              <span className="mx-1.5 text-slate-300">·</span>
                              创建于 {todo.createdAt}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {pendingTodos.length > 0 && (
            <div className="mt-6 bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <FileDown className="w-4.5 h-4.5 text-brand-gold" />
                    导出会议纪要
                  </h3>
                  <p className="text-xs text-navy-300 mt-0.5">
                    已选择 {selectedTodoIds.length || pendingTodos.length} 项待办将包含在纪要中
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors text-sm"
                  >
                    预览
                  </button>
                  <button
                    onClick={handleEndMeeting}
                    className="px-5 py-2 rounded-xl bg-brand-gold text-navy-950 hover:bg-brand-gold/90 transition-colors font-medium text-sm"
                  >
                    确认导出并结束
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
