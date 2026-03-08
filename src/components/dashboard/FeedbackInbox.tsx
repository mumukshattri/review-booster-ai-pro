import { useState, useEffect } from "react";
import { MessageSquare, Mail, Calendar, CheckCircle2 } from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface FeedbackItem {
  id: string;
  customer_name: string;
  customer_email: string;
  message: string;
  created_at: string;
  resolved?: boolean;
}

export function FeedbackInbox() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const reducedMotion = useReducedMotion();
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("feedback")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setFeedback(data as FeedbackItem[]);
      setLoading(false);
    };
    load();
  }, []);

  const handleResolve = (id: string) => {
    setFeedback(prev => prev.map(f =>
      f.id === id ? { ...f, resolved: true } : f
    ));
    toast({ title: "Feedback marked as resolved ✓" });
  };

  if (loading) {
    return (
      <div className="glass-card p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: reducedMotion ? 0.01 : 0.3, ease: [0.33, 1, 0.68, 1] }}
      className="glass-card overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-border/20">
        <h2 className="text-sm font-semibold text-foreground tracking-wide">Private Feedback</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{feedback.length} messages</p>
      </div>

      {feedback.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-muted-foreground/40" />
            </div>
            <div>
              <p className="text-sm font-medium">No feedback yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Negative feedback from customers will appear here privately.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="divide-y divide-border/10">
          <AnimatePresence>
            {feedback.map((f, i) => (
              <motion.div
                key={f.id}
                initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
                className={`p-4 sm:p-5 transition-colors ${
                  f.resolved ? "opacity-60" : "hover:bg-secondary/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{f.customer_name}</p>
                      {f.resolved && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          <CheckCircle2 className="h-3 w-3" />
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-0.5">
                      <Mail className="h-3 w-3" />
                      {f.customer_email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground/60 flex items-center gap-1 whitespace-nowrap">
                      <Calendar className="h-3 w-3" />
                      {new Date(f.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    {!f.resolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs bg-secondary/50 border-border/50 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                        onClick={() => handleResolve(f.id)}
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resolve
                      </Button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{f.message}</p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
