import { Annotation, RiskEvent, TodoItem, MeetingStep, EventProgress } from '@/types';
import { formatDateCN } from './formatters';

export interface ExportOptions {
  format: 'txt' | 'html';
  attendees: string[];
  isMeetingExport?: boolean;
  isPostMeeting?: boolean;
  meetingStartTime?: string;
  eventProgress?: Record<string, EventProgress>;
  discussedEventIds?: string[];
  undiscussedReasons?: Record<string, string>;
}

const statusMap: Record<string, string> = {
  pending: '待处理',
  in_progress: '处理中',
  completed: '已完成',
};

const stepMap: Record<MeetingStep, string> = {
  overview: '总览',
  scenario: '推演',
  annotations: '批注',
};

export function generateMinutesText(
  events: RiskEvent[],
  annotations: Annotation[],
  todos: TodoItem[],
  options: ExportOptions
): string {
  const dateStr = formatDateCN();
  const lines: string[] = [];

  lines.push('='.repeat(60));
  lines.push('              声誉风险管理晨会会议纪要');
  if (options.isPostMeeting) {
    lines.push('                  【会后分发版】');
  }
  lines.push('='.repeat(60));
  lines.push('');
  lines.push(`会议时间：${dateStr}`);
  if (options.meetingStartTime) {
    const now = new Date();
    const endTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    lines.push(`会议时长：${options.meetingStartTime} - ${endTime}`);
  }
  lines.push(`参会人员：${options.attendees.join('、')}`);
  lines.push('');

  const eventsWithAnnotations = events.filter((e) =>
    annotations.some((a) => a.eventId === e.id)
  );

  if (eventsWithAnnotations.length === 0 && todos.length === 0) {
    lines.push('本次会议无决策事项。');
    return lines.join('\n');
  }

  lines.push('─'.repeat(60));
  lines.push('一、上会议题');
  lines.push('─'.repeat(60));
  lines.push('');

  events.forEach((event, index) => {
    const eventAnnotations = annotations.filter((a) => a.eventId === event.id);
    lines.push(`${index + 1}. ${event.title}`);
    lines.push(`   风险等级：${event.level === 'critical' ? '紧急' : event.level === 'warning' ? '待决策' : '已降温'}`);
    lines.push(`   事件概况：${event.summary}`);
    lines.push('');
    if (eventAnnotations.length > 0) {
      lines.push('   讨论及决策意见：');
      eventAnnotations.forEach((a) => {
        lines.push(`     [${a.timestamp}] ${a.author}（${a.role}）：${a.content}`);
      });
    } else {
      lines.push('   （本次会议未讨论）');
    }
    lines.push('');
  });

  if (todos.length > 0) {
    lines.push('─'.repeat(60));
    lines.push('二、待办事项清单');
    lines.push('─'.repeat(60));
    lines.push('');
    lines.push('┌────┬────────────────────┬──────────┬──────────┬──────────┐');
    lines.push('│序号│      事项内容      │  负责人  │  状态  │  创建时间  │');
    lines.push('├────┼────────────────────┼──────────┼──────────┼──────────┤');

    todos.forEach((todo, idx) => {
      const contentShort = todo.content.length > 18 ? todo.content.slice(0, 18) + '...' : todo.content.padEnd(18);
      const ownerShort = todo.owner.length > 6 ? todo.owner.slice(0, 6) + '..' : todo.owner.padStart(4).padEnd(6);
      const status = statusMap[todo.status].padStart(2).padEnd(4);
      lines.push(`│ ${String(idx + 1).padEnd(2)} │ ${contentShort} │ ${ownerShort} │ ${status} │   ${todo.createdAt}   │`);
    });

    lines.push('└────┴────────────────────┴──────────┴────────┴──────────┘');
    lines.push('');

    const groupedByOwner: Record<string, TodoItem[]> = {};
    todos.forEach((t) => {
      if (!groupedByOwner[t.owner]) groupedByOwner[t.owner] = [];
      groupedByOwner[t.owner].push(t);
    });

    lines.push('按负责人汇总：');
    Object.entries(groupedByOwner).forEach(([owner, items]) => {
      const pending = items.filter((i) => i.status === 'pending').length;
      const inProgress = items.filter((i) => i.status === 'in_progress').length;
      const completed = items.filter((i) => i.status === 'completed').length;
      lines.push(`  ${owner}：共${items.length}项（待办${pending}，进行中${inProgress}，已完成${completed}）`);
    });
  }

  if (options.isPostMeeting) {
    if (options.eventProgress && events.length > 0) {
      lines.push('');
      lines.push('─'.repeat(60));
      lines.push('三、议题推进记录');
      lines.push('─'.repeat(60));
      lines.push('');

      const discussedIds = options.discussedEventIds || [];
      events.forEach((event, index) => {
        const progress = options.eventProgress![event.id];
        const isDiscussed = discussedIds.includes(event.id);
        const progressStep = progress ? stepMap[progress.step] : '未开始';
        const statusText = isDiscussed ? '✓ 已完成' : `○ 推进至：${progressStep}`;
        lines.push(`${index + 1}. ${event.title}`);
        lines.push(`   ${statusText}${progress?.lastVisitedAt ? `（最后访问：${progress.lastVisitedAt}）` : ''}`);
      });
      lines.push('');
    }

    const undiscussedEvents = events.filter((e) => !(options.discussedEventIds?.includes(e.id)));
    if (undiscussedEvents.length > 0 && options.undiscussedReasons) {
      lines.push('─'.repeat(60));
      lines.push('四、未讨论议题备注');
      lines.push('─'.repeat(60));
      lines.push('');
      undiscussedEvents.forEach((event, index) => {
        const reason = options.undiscussedReasons![event.id];
        lines.push(`${index + 1}. ${event.title}`);
        lines.push(`   原因：${reason || '未填写'}`);
        lines.push('');
      });
    }

    if (todos.length > 0) {
      lines.push('─'.repeat(60));
      lines.push('五、负责人分布摘要');
      lines.push('─'.repeat(60));
      lines.push('');

      const summary: Record<string, { total: number; pending: number; inProgress: number; completed: number }> = {};
      todos.forEach((t) => {
        if (!summary[t.owner]) summary[t.owner] = { total: 0, pending: 0, inProgress: 0, completed: 0 };
        summary[t.owner].total += 1;
        if (t.status === 'pending') summary[t.owner].pending += 1;
        else if (t.status === 'in_progress') summary[t.owner].inProgress += 1;
        else if (t.status === 'completed') summary[t.owner].completed += 1;
      });

      Object.entries(summary).forEach(([owner, stats]) => {
        const barLength = Math.round((stats.total / todos.length) * 20);
        const bar = ('█'.repeat(barLength) + '░'.repeat(20 - barLength));
        const rate = Math.round(stats.total / todos.length * 100);
        lines.push(`${owner.padEnd(10)} ${bar} ${stats.total.toString().padStart(2)}项 ${rate.toString().padStart(3)}%`);
        lines.push(`           待办${stats.pending} 进行${stats.inProgress} 完成${stats.completed}`);
        lines.push('');
      });

      const totalPending = todos.filter(t => t.status === 'pending').length;
      const totalInProgress = todos.filter(t => t.status === 'in_progress').length;
      const totalCompleted = todos.filter(t => t.status === 'completed').length;
      lines.push(`待办合计：待处理${totalPending}项，处理中${totalInProgress}项，已完成${totalCompleted}项`);
      lines.push(`完成率：${todos.length > 0 ? Math.round(totalCompleted / todos.length * 100) : 0}%`);
    }
  }

  lines.push('');
  lines.push('='.repeat(60));
  lines.push(`纪要生成时间：${new Date().toLocaleString('zh-CN')}`);
  lines.push('='.repeat(60));

  return lines.join('\n');
}

export function exportMinutes(
  events: RiskEvent[],
  annotations: Annotation[],
  todos: TodoItem[],
  options: ExportOptions
) {
  const content = generateMinutesText(events, annotations, todos, options);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  const prefix = options.isMeetingExport ? '会议纪要' : '声誉风险晨会纪要';
  a.href = url;
  a.download = `${prefix}_${dateStr}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
