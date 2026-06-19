import { VolumeX, Headphones, Megaphone, Wrench } from 'lucide-react';
import { ActionType } from '@/types';
import { actionMetas } from '@/data/mockScenarios';
import { getActionInfo } from '@/utils/formatters';

interface ActionSelectorProps {
  selectedAction: ActionType | null;
  onSelect: (action: ActionType) => void;
}

const iconMap: Record<string, typeof VolumeX> = {
  'volume-x': VolumeX,
  headphones: Headphones,
  megaphone: Megaphone,
  wrench: Wrench,
};

export default function ActionSelector({ selectedAction, onSelect }: ActionSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {actionMetas.map((meta) => {
        const actionInfo = getActionInfo(meta.type);
        const isSelected = selectedAction === meta.type;
        const Icon = iconMap[meta.icon] || VolumeX;

        return (
          <button
            key={meta.type}
            onClick={() => onSelect(meta.type)}
            className={`relative p-6 rounded-2xl text-left transition-all duration-300 
              border-2 overflow-hidden group ${
                isSelected
                  ? `${actionInfo.borderColor} ${actionInfo.bgColor} shadow-lg scale-[1.02]`
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-card hover:-translate-y-0.5'
              }`}
          >
            {isSelected && (
              <div
                className={`absolute inset-0 ${actionInfo.bgColor} opacity-20 animate-pulse-soft`}
              />
            )}

            <div className="relative">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  isSelected
                    ? `${actionInfo.bgColor} ${actionInfo.color}`
                    : 'bg-slate-100 text-slate-500 group-hover:bg-slate-50'
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div
                className={`text-lg font-semibold mb-1 ${
                  isSelected ? actionInfo.color : 'text-slate-800'
                }`}
              >
                {meta.label}
              </div>
              <div className="text-sm text-slate-500 leading-relaxed">{meta.description}</div>
            </div>

            {isSelected && (
              <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-white flex items-center justify-center shadow-sm">
                <svg className="w-3 h-3 text-risk-safe" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
