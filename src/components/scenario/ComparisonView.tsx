import { VolumeX, Headphones, Megaphone, Wrench, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ActionType, ScenarioResult } from '@/types';
import { actionMetas } from '@/data/mockScenarios';
import { getActionInfo, getTrendInfo, getTrustInfo } from '@/utils/formatters';

const iconMap: Record<string, typeof VolumeX> = {
  'volume-x': VolumeX,
  headphones: Headphones,
  megaphone: Megaphone,
  wrench: Wrench,
};

interface ComparisonViewProps {
  results: Record<string, ScenarioResult> | null;
  onSelectAction: (action: ActionType) => void;
  selectedAction: ActionType | null;
}

export default function ComparisonView({ results, onSelectAction, selectedAction }: ComparisonViewProps) {
  if (!results) return null;

  const actions: ActionType[] = ['silence', 'customer_service', 'official_statement', 'business_rectification'];

  const bestAction = getBestAction(results);

  return (
    <div className="glass-card p-5 opacity-0 animate-fade-in-up animate-delay-300">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-slate-800">四动作横向对比</h4>
        <span className="text-xs text-slate-500">点击列标题查看详细分析</span>
      </div>

      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-2 px-3 text-xs font-medium text-slate-500 w-28 sticky left-0 bg-white z-10">
                对比维度
              </th>
              {actions.map((action) => {
                const meta = actionMetas.find((m) => m.type === action);
                const actionInfo = getActionInfo(action);
                const Icon = meta ? iconMap[meta.icon] : VolumeX;
                const isSelected = selectedAction === action;
                const isBest = bestAction === action;

                return (
                  <th
                    key={action}
                    className={`text-center py-2 px-3 cursor-pointer transition-all rounded-t-xl ${
                      isSelected ? 'bg-navy-50' : 'hover:bg-slate-50'
                    }`}
                    onClick={() => onSelectAction(action)}
                  >
                    <div
                      className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center mb-1 ${
                        isBest ? 'bg-risk-safeLight text-risk-safe' : `${actionInfo.bgColor} ${actionInfo.color}`
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div
                      className={`text-sm font-medium ${
                        isSelected ? 'text-navy-700' : 'text-slate-700'
                      }`}
                    >
                      {actionInfo.shortLabel}
                    </div>
                    {isBest && (
                      <div className="text-[10px] text-risk-safe font-medium mt-0.5">
                        ✓ 推荐
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100">
              <td className="py-3 px-3 text-xs font-medium text-slate-500 sticky left-0 bg-white z-10">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  舆论趋势
                </div>
              </td>
              {actions.map((action) => {
                const result = results[action];
                if (!result) return <td key={action} className="py-3 px-3 text-center" />;
                const trendInfo = getTrendInfo(result.publicReaction.trend);
                const TrendIcon =
                  result.publicReaction.trend === 'positive'
                    ? TrendingUp
                    : result.publicReaction.trend === 'negative'
                    ? TrendingDown
                    : Minus;
                return (
                  <td key={action} className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <TrendIcon className={`w-4 h-4 ${trendInfo.color}`} />
                      <span className={`font-mono font-bold ${trendInfo.color}`}>
                        {result.publicReaction.sentimentScore > 0 ? '+' : ''}
                        {result.publicReaction.sentimentScore}
                      </span>
                    </div>
                    <div className={`text-xs ${trendInfo.color}`}>{trendInfo.label}</div>
                  </td>
                );
              })}
            </tr>

            <tr className="border-b border-slate-100">
              <td className="py-3 px-3 text-xs font-medium text-slate-500 sticky left-0 bg-white z-10">
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-500 inline-block" />
                  监管概率
                </div>
              </td>
              {actions.map((action) => {
                const result = results[action];
                if (!result) return <td key={action} className="py-3 px-3 text-center" />;
                const probability = result.regulatoryRisk.probability;
                const color =
                  probability >= 70
                    ? 'text-risk-critical'
                    : probability >= 40
                    ? 'text-risk-warning'
                    : 'text-risk-safe';
                const bg =
                  probability >= 70
                    ? 'bg-risk-critical'
                    : probability >= 40
                    ? 'bg-risk-warning'
                    : 'bg-risk-safe';
                return (
                  <td key={action} className="py-3 px-3 text-center">
                    <div className={`text-xl font-mono font-bold ${color}`}>{probability}%</div>
                    <div className="w-16 mx-auto h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${bg} transition-all duration-700`}
                        style={{ width: `${probability}%` }}
                      />
                    </div>
                  </td>
                );
              })}
            </tr>

            <tr>
              <td className="py-3 px-3 text-xs font-medium text-slate-500 sticky left-0 bg-white z-10">
                <div className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-rose-500 inline-block" />
                  信任变化
                </div>
              </td>
              {actions.map((action) => {
                const result = results[action];
                if (!result) return <td key={action} className="py-3 px-3 text-center" />;
                const change = result.customerTrust.changePercent;
                const color = change > 0 ? 'text-risk-safe' : change < 0 ? 'text-risk-critical' : 'text-slate-500';
                return (
                  <td key={action} className="py-3 px-3 text-center">
                    <div className={`text-xl font-mono font-bold ${color}`}>
                      {change > 0 ? '+' : ''}
                      {change}%
                    </div>
                    <div className={`text-xs ${color}`}>
                      {getTrustInfo(result.customerTrust.impact).label}
                    </div>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-risk-safe" />
          <span>绿色为推荐方案（基于历史数据模型综合评分最高）</span>
        </div>
      </div>
    </div>
  );
}

function getBestAction(results: Record<string, ScenarioResult>): ActionType | null {
  const actions: ActionType[] = ['silence', 'customer_service', 'official_statement', 'business_rectification'];

  let bestScore = -Infinity;
  let bestAction: ActionType | null = null;

  actions.forEach((action) => {
    const r = results[action];
    if (!r) return;

    const score =
      r.publicReaction.sentimentScore * 1 +
      (100 - r.regulatoryRisk.probability) * 2 +
      r.customerTrust.changePercent * 3;

    if (score > bestScore) {
      bestScore = score;
      bestAction = action;
    }
  });

  return bestAction;
}
