import { Upload, Send, UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  onUploadClick: () => void;
  onAddClick: () => void;
  onSendClick: () => void;
  loading: boolean;
  sending: boolean;
}

export function DashboardHeader({ onUploadClick, onAddClick, onSendClick, loading, sending }: DashboardHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1 tracking-wide">
          Manage review requests for your customers
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3, ease: [0.33, 1, 0.68, 1] }}
        className="flex flex-col sm:flex-row flex-wrap gap-3"
      >
        <Button
          variant="ghost"
          className="btn-press border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 min-h-[44px]"
          onClick={onAddClick}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>

        <Button
          variant="outline"
          className="btn-press bg-secondary/50 border-border/50 hover:bg-secondary hover:border-primary/20 transition-all duration-200 min-h-[44px]"
          onClick={onUploadClick}
          disabled={loading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {loading ? "Uploading..." : "Upload CSV"}
        </Button>

        <Button
          variant="hero"
          className="btn-press pulse-glow min-h-[44px] relative overflow-hidden"
          onClick={onSendClick}
          disabled={sending}
        >
          {sending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          {sending ? "Sending..." : "Send Review Requests"}
        </Button>
      </motion.div>
    </div>
  );
}
