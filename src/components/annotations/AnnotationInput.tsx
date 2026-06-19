import { useState } from 'react';
import { Send, User } from 'lucide-react';
import { AnnotationCategory } from '@/types';
import { quickAnnotations } from '@/data/mockAnnotations';
import { getCategoryInfo } from '@/utils/formatters';

interface AnnotationInputProps {
  onSubmit: (content: string, author: { name: string; role: string }, category?: AnnotationCategory) => void;
}

const attendees = [
  { name: '张行长', role: '行长' },
  { name: '王行长', role: '副行长' },
  { name: '李总', role: '合规总监' },
  { name: '赵总', role: '品牌公关部总经理' },
];

export default function AnnotationInput({ onSubmit }: AnnotationInputProps) {
  const [content, setContent] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState(attendees[0]);
  const [selectedCategory, setSelectedCategory] = useState<AnnotationCategory | undefined>();

  const handleQuickClick = (label: string, category: AnnotationCategory) => {
    setContent(label);
    setSelectedCategory(category);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    const fullContent = content.trim();
    onSubmit(fullContent, selectedAuthor, selectedCategory);
    setContent('');
    setSelectedCategory(undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-slate-50/80 border-t border-slate-200 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500">发言人：</span>
        </div>
        <div className="flex gap-1.5">
          {attendees.map((a) => (
            <button
              key={a.name}
              onClick={() => setSelectedAuthor(a)}
              className={`px-3 py-1 text-xs rounded-lg transition-all ${
                selectedAuthor.name === a.name
                  ? 'bg-navy-900 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {a.name}
            </button>
          ))}
        </div>
        <div className="ml-auto text-xs text-slate-500">{selectedAuthor.role}</div>
      </div>

      <div className="mb-3">
        <div className="text-xs text-slate-500 mb-2">快捷指令：</div>
        <div className="flex flex-wrap gap-1.5">
          {quickAnnotations.map((qa) => {
            const catInfo = getCategoryInfo(qa.category);
            const isSelected = content === qa.label;
            return (
              <button
                key={qa.id}
                onClick={() => handleQuickClick(qa.label, qa.category)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all border ${
                  isSelected
                    ? `${catInfo.bgClass} ${catInfo.textClass} ${catInfo.dotClass.replace('bg-', 'border-')}`
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {qa.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="输入批注意见，回车发送..."
          rows={2}
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white resize-none 
                     focus:outline-none focus:ring-2 focus:ring-navy-500/20 focus:border-navy-400
                     text-slate-700 placeholder:text-slate-400 text-sm"
        />
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="px-5 rounded-xl bg-navy-900 text-white font-medium
                     hover:bg-navy-800 active:bg-navy-950 transition-all
                     disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
                     flex items-center gap-2 self-stretch"
        >
          <Send className="w-4 h-4" />
          发送
        </button>
      </div>
    </div>
  );
}
