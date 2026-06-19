import { Annotation, RiskEvent } from '@/types';
import { formatDateCN } from './formatters';

export interface ExportOptions {
  format: 'txt' | 'html';
  attendees: string[];
}

export function generateMinutesText(
  events: RiskEvent[],
  annotations: Annotation[],
  options: ExportOptions
): string {
  const dateStr = formatDateCN();
  const lines: string[] = [];

  lines.push('='.repeat(50));
  lines.push('        声誉风险管理晨会会议纪要');
  lines.push('='.repeat(50));
  lines.push('');
  lines.push(`会议时间：${dateStr}`);
  lines.push(`参会人员：${options.attendees.join('、')}`);
  lines.push('');

  const eventsWithAnnotations = events.filter((e) =>
    annotations.some((a) => a.eventId === e.id)
  );

  if (eventsWithAnnotations.length === 0) {
    lines.push('本次会议无决策事项。');
    return lines.join('\n');
  }

  lines.push('─'.repeat(50));
  lines.push('一、讨论事项及决策');
  lines.push('─'.repeat(50));
  lines.push('');

  eventsWithAnnotations.forEach((event, index) => {
    const eventAnnotations = annotations.filter((a) => a.eventId === event.id);
    lines.push(`${index + 1}. ${event.title}`);
    lines.push(`   事件概况：${event.summary}`);
    lines.push('');
    lines.push('   决策意见：');
    eventAnnotations.forEach((a, i) => {
      lines.push(`     [${a.timestamp}] ${a.author}（${a.role}）：${a.content}`);
    });
    lines.push('');
  });

  lines.push('─'.repeat(50));
  lines.push('二、待办事项');
  lines.push('─'.repeat(50));
  lines.push('');

  let todoIndex = 1;
  eventsWithAnnotations.forEach((event) => {
    if (event.pendingItems) {
      event.pendingItems.forEach((item) => {
        lines.push(`${todoIndex}. [${event.title}] ${item}`);
        todoIndex++;
      });
    }
  });

  if (todoIndex === 1) {
    lines.push('暂无待办事项。');
  }

  lines.push('');
  lines.push('='.repeat(50));
  lines.push(`纪要生成时间：${new Date().toLocaleString('zh-CN')}`);
  lines.push('='.repeat(50));

  return lines.join('\n');
}

export function exportMinutes(
  events: RiskEvent[],
  annotations: Annotation[],
  options: ExportOptions
) {
  const content = generateMinutesText(events, annotations, options);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `声誉风险晨会纪要_${dateStr}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
