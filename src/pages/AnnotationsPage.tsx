import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  FileDown,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import AppHeader from '@/components/layout/AppHeader';
import EventSidebar from '@/components/annotations/EventSidebar';
import AnnotationBubble from '@/components/annotations/AnnotationBubble';
import AnnotationInput from '@/components/annotations/AnnotationInput';
import { useAppStore } from '@/store/useAppStore';
import { getRiskLevelInfo } from '@/utils/formatters';
import { AnnotationCategory } from '@/types';
import { exportMinutes } from '@/utils/exportMinutes';

const iconMap = {
  critical: AlertTriangle,
  warning: Clock,
  resolved: CheckCircle2,
};

const attendees = ['张行长', '王行长', '李总', '赵总', '刘总', '陈总'];

export default function AnnotationsPage() {
  const navigate = useNavigate();
  const events = useAppStore((s) => s.events);
  const annotations = useAppStore((s) => s.annotations);
  const addAnnotation = useAppStore((s) => s.addAnnotation);
  const getAnnotationsByEventId = useAppStore((s) => s.getAnnotationsByEventId);

  const [selectedEventId, setSelectedEventId] = useState<string>(events[0]?.id || '');

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const eventAnnotations = selectedEventId
    ? getAnnotationsByEventId(selectedEventId)
    : [];

  const annotationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    annotations.forEach((a) => {
      counts[a.eventId] = (counts[a.eventId] || 0) + 1;
    });
    return counts;
  }, [annotations]);

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
    exportMinutes(events, annotations, {
      format: 'txt',
      attendees,
    });
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
              <span className="text-xs text-slate-500">{annotations.length}条</span>
            </div>
          </div>
          <EventSidebar
            events={events}
            selectedId={selectedEventId}
            onSelect={setSelectedEventId}
            annotationCounts={annotationCounts}
          />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedEvent && levelInfo && (
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
                    </div>
                    <h3 className="text-lg font-serif font-semibold text-slate-800 leading-snug">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {selectedEvent.summary}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-navy-900 text-white hover:bg-navy-800 transition-all shadow-lg shadow-navy-900/20 flex-shrink-0"
                >
                  <FileDown className="w-4 h-4" />
                  导出会议纪要
                </button>
              </div>

              <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 bg-slate-50/50">
                {eventAnnotations.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-slate-400" />
                    </div>
                    <h4 className="text-base font-medium text-slate-700 mb-1">暂无批注意见</h4>
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
          )}
        </div>
      </div>
    </div>
  );
}
