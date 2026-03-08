import { Mail, Eye, MousePointerClick, Users, Star, LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/CountUp";

interface Stat {
  label: string;
  value: number;
  icon: LucideIcon;
  suffix: string;
}

interface StatsGridProps {
  totalSent: number;
  openRate: number;
  clickRate: number;
  customersCount: number;
  reviewsSubmitted: number;
}

export function StatsGrid({ totalSent, openRate, clickRate, customersCount, reviewsSubmitted }: StatsGridProps) {
  const reducedMotion = useReducedMotion();
  const dur = reducedMotion ? 0.01 : 0.25;
  const ease = [0.33, 1, 0.68, 1] as [number, number, number, number];

  const stats: Stat[] = [
    { label: "Total Sent", value: totalSent, icon: Mail, suffix: "" },
    { label: "Open Rate", value: openRate, icon: Eye, suffix: "%" },
    { label: "Click Rate", value: clickRate, icon: MousePointerClick, suffix: "%" },
    { label: "Customers", value: customersCount, icon: Users, suffix: "" },
    { label: "Reviews Submitted", value: reviewsSubmitted, icon: Star, suffix: "" },
  ];

  const iconColors = [
    "text-primary",
    "text-emerald-400",
    "text-amber-400",
    "text-sky-400",
    "text-amber-400",
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: dur, ease }}
          className="stat-card-hover p-4 sm:p-5 group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-300">
              <s.icon className={`h-4 w-4 ${iconColors[i]}`} />
            </div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
              {s.label}
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">
            <CountUp end={s.value} duration={1200} />{s.suffix}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
