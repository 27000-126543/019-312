import { Clock, CheckCircle2, PlayCircle, CheckSquare, Square } from 'lucide-react';
import { TodoItem, TodoStatus } from '@/types';
import { getCategoryInfo, getAvatarColor, getInitials } from '@/utils/formatters';

interface TodoPanelProps {
  todos: TodoItem[];
  onStatusChange: (todoId: string, status: TodoStatus) => void;
  selectable?: boolean;
  selectedTodoIds?: string[];
  onToggleSelect?: (todoId: string) => void;
}

const statusConfig: Record<TodoStatus, { label: string; icon: typeof Clock; color: string; bgColor: string }> = {
  pending: {
    label: '待处理',
    icon: Clock,
    color: 'text-risk-warning',
    bgColor: 'bg-risk-warningLight',
  },
  in_progress: {
    label: '处理中',
    icon: PlayCircle,
    color: 'text-sky-600',
    bgColor: 'bg-sky-50',
  },
  completed: {
    label: '已完成',
    icon: CheckCircle2,
    color: 'text-risk-safe',
    bgColor: 'bg-risk-safeLight',
  },
};

export default function TodoPanel({
  todos,
  onStatusChange,
  selectable = false,
  selectedTodoIds = [],
  onToggleSelect,
}: TodoPanelProps) {
  const groupedByStatus: Record<TodoStatus, TodoItem[]> = {
    pending: todos.filter((t) => t.status === 'pending'),
    in_progress: todos.filter((t) => t.status === 'in_progress'),
    completed: todos.filter((t) => t.status === 'completed'),
  };

  if (todos.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm text-slate-500">暂无待办事项</p>
        <p className="text-xs text-slate-400 mt-1">添加"同意发布声明"等决策类批注将自动生成待办</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(Object.keys(groupedByStatus) as TodoStatus[]).map((status) => {
        const statusTodos = groupedByStatus[status];
        const config = statusConfig[status];
        const StatusIcon = config.icon;

        if (statusTodos.length === 0) return null;

        return (
          <div key={status}>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-6 h-6 rounded-md ${config.bgColor} ${config.color} flex items-center justify-center`}>
                <StatusIcon className="w-3.5 h-3.5" />
              </div>
              <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
              <span className="text-xs text-slate-400">{statusTodos.length}项</span>
            </div>
            <div className="space-y-2">
              {statusTodos.map((todo) => {
                const catInfo = getCategoryInfo(todo.category);
                const avatarColor = getAvatarColor(todo.owner);
                const initials = getInitials(todo.owner);
                const isSelected = selectedTodoIds.includes(todo.id);

                return (
                  <div
                    key={todo.id}
                    className={`bg-white rounded-xl border p-3 hover:shadow-sm transition-all ${
                      isSelected ? 'border-brand-gold ring-2 ring-brand-gold/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {selectable && (
                        <button
                          onClick={() => onToggleSelect?.(todo.id)}
                          className="w-5 h-5 mt-0.5 flex-shrink-0 text-brand-gold hover:opacity-80 transition-opacity"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 fill-brand-gold/10" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                      )}
                      <div
                        className={`w-8 h-8 rounded-full ${avatarColor} text-white flex items-center justify-center text-xs font-medium flex-shrink-0`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`tag-chip text-[10px] ${catInfo.bgClass} ${catInfo.textClass}`}
                            >
                              {catInfo.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {todo.createdAt}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-800 mt-1 leading-relaxed">{todo.content}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <div className="text-xs text-slate-500">
                            责任人：
                            <span className="text-slate-700 font-medium">{todo.owner}</span>
                            <span className="mx-1 text-slate-300">·</span>
                            <span className="text-slate-400 text-[10px] line-clamp-1">
                              {todo.eventTitle}
                            </span>
                          </div>
                          {status !== 'completed' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  onStatusChange(
                                    todo.id,
                                    status === 'pending' ? 'in_progress' : 'completed'
                                  )
                                }
                                className="px-2 py-1 text-[10px] rounded-md bg-navy-50 text-navy-700 hover:bg-navy-100 transition-colors"
                              >
                                {status === 'pending' ? '开始处理' : '完成'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
