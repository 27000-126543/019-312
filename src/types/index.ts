export type RiskLevel = 'critical' | 'warning' | 'resolved';

export interface TimelineItem {
  time: string;
  description: string;
}

export interface RiskEvent {
  id: string;
  title: string;
  level: RiskLevel;
  summary: string;
  brandImpact: string;
  progress: string;
  progressPercent: number;
  timeline: TimelineItem[];
  products: string[];
  channels: string[];
  owner: string;
  updatedAt: string;
  pendingItems?: string[];
  resolvedSummary?: string;
}

export type ActionType = 'silence' | 'customer_service' | 'official_statement' | 'business_rectification';

export interface ActionMeta {
  type: ActionType;
  label: string;
  description: string;
  icon: string;
}

export type TrendDirection = 'positive' | 'neutral' | 'negative';
export type TrustImpact = 'highly_positive' | 'positive' | 'neutral' | 'negative' | 'highly_negative';

export interface ScenarioResult {
  action: ActionType;
  publicReaction: {
    trend: TrendDirection;
    description: string;
    sentimentScore: number;
  };
  regulatoryRisk: {
    probability: number;
    description: string;
  };
  customerTrust: {
    impact: TrustImpact;
    description: string;
    changePercent: number;
  };
  expertAdvice: string;
}

export type AnnotationCategory = 'approval' | 'review' | 'delegation' | 'other';

export interface Annotation {
  id: string;
  eventId: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
  category?: AnnotationCategory;
}

export interface QuickAnnotation {
  id: string;
  label: string;
  category: AnnotationCategory;
}

export interface MeetingMinutes {
  date: string;
  attendees: string[];
  annotations: Annotation[];
  events: RiskEvent[];
  decisions: string[];
}
