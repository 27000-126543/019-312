import { Annotation } from '@/types';
import { getCategoryInfo, getAvatarColor, getInitials } from '@/utils/formatters';

interface AnnotationBubbleProps {
  annotation: Annotation;
  index: number;
}

export default function AnnotationBubble({ annotation, index }: AnnotationBubbleProps) {
  const categoryInfo = getCategoryInfo(annotation.category);
  const avatarColor = getAvatarColor(annotation.author);
  const initials = getInitials(annotation.author);

  return (
    <div
      className={`opacity-0 animate-slide-in-right animate-delay-${Math.min(index, 6) * 50} flex gap-3`}
    >
      <div
        className={`w-10 h-10 rounded-full ${avatarColor} text-white flex items-center justify-center font-medium text-sm flex-shrink-0`}
      >
        {initials}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-slate-800 text-sm">{annotation.author}</span>
          <span className="text-xs text-slate-500">{annotation.role}</span>
          <span className="text-xs text-slate-400 font-mono">{annotation.timestamp}</span>
          {annotation.category && (
            <span className={`tag-chip text-xs ${categoryInfo.bgClass} ${categoryInfo.textClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${categoryInfo.dotClass}`} />
              {categoryInfo.label}
            </span>
          )}
        </div>
        <div className="bg-white rounded-2xl rounded-tl-md border border-slate-100 p-3 shadow-sm">
          <p className="text-slate-700 leading-relaxed">{annotation.content}</p>
        </div>
      </div>
    </div>
  );
}
