import { UserPlus, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DashboardEmptyStateProps {
  onAddClick: () => void;
}

export function DashboardEmptyState({ onAddClick }: DashboardEmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.33, 1, 0.68, 1] }}
      className="glass-card p-12 sm:p-16 text-center space-y-5"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
        <Rocket className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-xl font-bold text-foreground">No customers yet!</h2>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Add your first customer to start getting reviews 🚀
      </p>
      <Button variant="hero" className="btn-press" onClick={onAddClick}>
        <UserPlus className="mr-2 h-4 w-4" />
        Add Customer
      </Button>
    </motion.div>
  );
}
