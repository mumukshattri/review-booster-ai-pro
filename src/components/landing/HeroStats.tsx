import { motion } from "framer-motion";
import { CountUp } from "@/components/CountUp";
import { Star, Mail, TrendingUp, Building } from "lucide-react";

const stats = [
  { icon: Star, value: 12847, label: "Reviews Collected", suffix: "" },
  { icon: Mail, value: 48293, label: "Emails Sent", suffix: "" },
  { icon: TrendingUp, value: 4.8, label: "Avg Rating Boost", suffix: "", isDecimal: true },
  { icon: Building, value: 500, label: "Businesses", suffix: "+" },
];

interface HeroStatsProps {
  dur: number;
  ease: [number, number, number, number];
}

export function HeroStats({ dur, ease }: HeroStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: dur * 2, ease }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-12 sm:mt-16"
    >
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 + i * 0.08, duration: dur * 2, ease }}
          className="glass-card p-4 text-center group"
        >
          <stat.icon className="h-5 w-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <div className="text-xl sm:text-2xl font-black text-foreground">
            {stat.isDecimal ? stat.value : <CountUp end={stat.value} />}
            {stat.suffix && <span className="gradient-text">{stat.suffix}</span>}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
        </motion.div>
      ))}
    </motion.div>
  );
}
