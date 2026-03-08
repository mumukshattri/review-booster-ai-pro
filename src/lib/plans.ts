export type PlanType = 'starter' | 'pro' | 'agency';

export interface PlanConfig {
  name: string;
  maxCustomers: number | null; // null = unlimited
  hasSequence: boolean;
  hasFeedback: boolean;
  hasAiInsights: boolean;
  hasSentimentFilter: boolean;
  hasMultiLocation: boolean;
  hasPrioritySupport: boolean;
  price: number;
  badgeColor: string; // tailwind classes
}

export const PLANS: Record<PlanType, PlanConfig> = {
  starter: {
    name: 'Starter',
    maxCustomers: 50,
    hasSequence: false,
    hasFeedback: false,
    hasAiInsights: false,
    hasSentimentFilter: false,
    hasMultiLocation: false,
    hasPrioritySupport: false,
    price: 19,
    badgeColor: 'bg-muted text-muted-foreground border-border/30',
  },
  pro: {
    name: 'Pro',
    maxCustomers: 500,
    hasSequence: true,
    hasFeedback: true,
    hasAiInsights: true,
    hasSentimentFilter: true,
    hasMultiLocation: false,
    hasPrioritySupport: false,
    price: 49,
    badgeColor: 'bg-primary/15 text-primary border-primary/30',
  },
  agency: {
    name: 'Agency',
    maxCustomers: null,
    hasSequence: true,
    hasFeedback: true,
    hasAiInsights: true,
    hasSentimentFilter: true,
    hasMultiLocation: true,
    hasPrioritySupport: true,
    price: 99,
    badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
};

export function canAddCustomer(plan: PlanType, currentCount: number): boolean {
  const config = PLANS[plan];
  if (config.maxCustomers === null) return true;
  return currentCount < config.maxCustomers;
}

export function getCustomerLimit(plan: PlanType): number | null {
  return PLANS[plan].maxCustomers;
}
