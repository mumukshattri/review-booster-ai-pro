export type PlanType = 'free' | 'starter' | 'pro' | 'agency';

export interface PlanConfig {
  name: string;
  maxRequestsPerMonth: number | null; // null = unlimited
  hasSequence: boolean;
  hasFeedback: boolean;
  hasAiInsights: boolean;
  hasSentimentFilter: boolean;
  hasMultiLocation: boolean;
  hasPrioritySupport: boolean;
  hasCsvImport: boolean;
  price: number;
  badgeColor: string; // tailwind classes
}

export const PLANS: Record<PlanType, PlanConfig> = {
  free: {
    name: 'Free',
    maxRequestsPerMonth: 3,
    hasSequence: false,
    hasFeedback: false,
    hasAiInsights: false,
    hasSentimentFilter: false,
    hasMultiLocation: false,
    hasPrioritySupport: false,
    hasCsvImport: false,
    price: 0,
    badgeColor: 'bg-muted text-muted-foreground border-border/30',
  },
  starter: {
    name: 'Starter',
    maxRequestsPerMonth: 50,
    hasSequence: false,
    hasFeedback: false,
    hasAiInsights: false,
    hasSentimentFilter: false,
    hasMultiLocation: false,
    hasPrioritySupport: false,
    hasCsvImport: false,
    price: 1755,
    badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  pro: {
    name: 'Pro',
    maxRequestsPerMonth: 500,
    hasSequence: true,
    hasFeedback: true,
    hasAiInsights: true,
    hasSentimentFilter: true,
    hasMultiLocation: false,
    hasPrioritySupport: false,
    hasCsvImport: true,
    price: 4527,
    badgeColor: 'bg-primary/15 text-primary border-primary/30',
  },
  agency: {
    name: 'Agency',
    maxRequestsPerMonth: null,
    hasSequence: true,
    hasFeedback: true,
    hasAiInsights: true,
    hasSentimentFilter: true,
    hasMultiLocation: true,
    hasPrioritySupport: true,
    hasCsvImport: true,
    price: 9146,
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
};

export function canSendRequest(plan: PlanType, monthlySentCount: number, requestedCount: number = 1): boolean {
  const config = PLANS[plan];
  if (config.maxRequestsPerMonth === null) return true;
  return (monthlySentCount + requestedCount) <= config.maxRequestsPerMonth;
}

export function getRequestLimit(plan: PlanType): number | null {
  return PLANS[plan].maxRequestsPerMonth;
}
