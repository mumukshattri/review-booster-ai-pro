import { Lock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface UpgradePromptProps {
  title: string;
  description: string;
  targetPlan?: string;
}

export function UpgradePrompt({ title, description, targetPlan = "Pro" }: UpgradePromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 text-center space-y-4"
    >
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
        <Lock className="h-6 w-6 text-primary" />
      </div>
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">{description}</p>
      <Button variant="hero" className="btn-press" onClick={() => window.open("/settings#subscription", "_self")}>
        <ArrowUpRight className="mr-2 h-4 w-4" />
        Upgrade to {targetPlan}
      </Button>
    </motion.div>
  );
}
