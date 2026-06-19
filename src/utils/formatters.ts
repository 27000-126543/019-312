import { RiskLevel, ActionType, AnnotationCategory, TrendDirection, TrustImpact } from '@/types';

export function getRiskLevelInfo(level: RiskLevel) {
  const map = {
    critical: {
      label: '紧急',
      bgClass: 'bg-risk-critical',
      bgLightClass: 'bg-risk-criticalLight',
      textClass: 'text-risk-critical',
      borderClass: 'border-risk-critical',
      shadowClass: 'shadow-glow-red',
    },
    warning: {
      label: '待决策',
      bgClass: 'bg-risk-warning',
      bgLightClass: 'bg-risk-warningLight',
      textClass: 'text-risk-warning',
      borderClass: 'border-risk-warning',
      shadowClass: 'shadow-glow-amber',
    },
    resolved: {
      label: '已降温',
      bgClass: 'bg-risk-safe',
      bgLightClass: 'bg-risk-safeLight',
      textClass: 'text-risk-safe',
      borderClass: 'border-risk-safe',
      shadowClass: 'shadow-glow-green',
    },
  };
  return map[level];
}

export function getActionInfo(type: ActionType) {
  const map = {
    silence: {
      label: '继续沉默',
      shortLabel: '沉默',
      color: 'text-slate-500',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-200',
    },
    customer_service: {
      label: '客服解释',
      shortLabel: '客服',
      color: 'text-sky-700',
      bgColor: 'bg-sky-50',
      borderColor: 'border-sky-200',
    },
    official_statement: {
      label: '官方声明',
      shortLabel: '声明',
      color: 'text-navy-700',
      bgColor: 'bg-navy-50',
      borderColor: 'border-navy-200',
    },
    business_rectification: {
      label: '业务整改',
      shortLabel: '整改',
      color: 'text-risk-safe',
      bgColor: 'bg-risk-safeLight',
      borderColor: 'border-risk-safe',
    },
  };
  return map[type];
}

export function getCategoryInfo(category?: AnnotationCategory) {
  const map = {
    approval: {
      label: '决策通过',
      bgClass: 'bg-risk-safeLight',
      textClass: 'text-risk-safe',
      dotClass: 'bg-risk-safe',
    },
    review: {
      label: '需要复核',
      bgClass: 'bg-amber-50',
      textClass: 'text-amber-700',
      dotClass: 'bg-amber-500',
    },
    delegation: {
      label: '分派执行',
      bgClass: 'bg-sky-50',
      textClass: 'text-sky-700',
      dotClass: 'bg-sky-500',
    },
    other: {
      label: '其他',
      bgClass: 'bg-navy-50',
      textClass: 'text-navy-700',
      dotClass: 'bg-navy-500',
    },
  };
  return map[category || 'other'];
}

export function getTrendInfo(trend: TrendDirection) {
  const map = {
    positive: {
      label: '向好',
      icon: 'TrendingUp',
      color: 'text-risk-safe',
      bgColor: 'bg-risk-safeLight',
    },
    neutral: {
      label: '平稳',
      icon: 'Minus',
      color: 'text-slate-500',
      bgColor: 'bg-slate-100',
    },
    negative: {
      label: '恶化',
      icon: 'TrendingDown',
      color: 'text-risk-critical',
      bgColor: 'bg-risk-criticalLight',
    },
  };
  return map[trend];
}

export function getTrustInfo(impact: TrustImpact) {
  const map = {
    highly_positive: {
      label: '显著提升',
      color: 'text-risk-safe',
      bgColor: 'bg-risk-safeLight',
    },
    positive: {
      label: '略有提升',
      color: 'text-risk-safe',
      bgColor: 'bg-risk-safeLight',
    },
    neutral: {
      label: '基本持平',
      color: 'text-slate-500',
      bgColor: 'bg-slate-100',
    },
    negative: {
      label: '有所下降',
      color: 'text-risk-warning',
      bgColor: 'bg-risk-warningLight',
    },
    highly_negative: {
      label: '大幅下降',
      color: 'text-risk-critical',
      bgColor: 'bg-risk-criticalLight',
    },
  };
  return map[impact];
}

export function formatDateCN(date?: Date): string {
  const d = date || new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
}

export function getInitials(name: string): string {
  return name.slice(0, 1);
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-navy-500',
    'bg-brand-gold',
    'bg-risk-safe',
    'bg-sky-500',
    'bg-violet-500',
    'bg-rose-500',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
