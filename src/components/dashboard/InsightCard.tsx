import { Target } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/CountUp";
import { TiltCard } from "@/components/TiltCard";

interface InsightCardProps {
  reviewsSubmitted: number;
  monthlyGoal: number;
}

export function InsightCard({ reviewsSubmitted, monthlyGoal }: InsightCardProps) {
  const reducedMotion = useReducedMotion();
  const goalProgress = monthlyGoal > 0 ? Math.min((reviewsSubmitted / monthlyGoal) * 100, 100) : 0;

  return (
    <TiltCard className="w-full" tiltAmount={6}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: reducedMotion ? 0.01 : 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="glass-card p-5 sm:p-6 relative overflow-hidden"
      >
        {/* Subtle glow accent */}
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Target className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-wide">
              Monthly Review Goal
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-foreground tabular-nums">
              <CountUp end={reviewsSubmitted} duration={1000} />
            </span>
            <span className="text-sm text-muted-foreground">/ {monthlyGoal}</span>
          </div>
        </div>

        <div className="h-3 rounded-full bg-secondary overflow-hidden relative z-10">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goalProgress}%` }}
            transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            className="h-full rounded-full gradient-primary relative"
          >
            {/* Shimmer on progress bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] rounded-full" />
          </motion.div>
        </div>

        <p className="text-xs text-muted-foreground mt-3 relative z-10 tracking-wide">
          {goalProgress >= 100
            ? "🎉 Goal reached! Amazing work."
            : `${Math.round(goalProgress)}% complete — ${monthlyGoal - reviewsSubmitted} reviews to go`}
        </p>
      </motion.div>
    </TiltCard>
  );
}
