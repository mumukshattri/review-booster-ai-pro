import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Check, Circle, Rocket, Link as LinkIcon, UserPlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";

interface Step {
  id: string;
  label: string;
  sublabel: string;
  icon: typeof Check;
  done: boolean;
}

export function OnboardingChecklist() {
  const navigate = useNavigate();
  const [steps, setSteps] = useState<Step[]>([
    { id: "account", label: "Account created", sublabel: "", icon: Check, done: true },
    { id: "review_link", label: "Add your Google review link", sublabel: "2 mins", icon: LinkIcon, done: false },
    { id: "first_customer", label: "Add your first customer", sublabel: "1 min", icon: UserPlus, done: false },
    { id: "first_send", label: "Send first review request 🚀", sublabel: "", icon: Send, done: false },
  ]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    checkProgress();
  }, []);

  const checkProgress = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("review_url, direct_review_url")
      .eq("id", user.id)
      .single();

    const { data: customers } = await supabase
      .from("customers")
      .select("id, sent_at")
      .eq("user_id", user.id)
      .limit(1);

    const hasReviewLink = !!(profile?.review_url || profile?.direct_review_url);
    const hasCustomer = !!(customers && customers.length > 0);
    const hasSent = !!(customers && customers.some((c) => c.sent_at));

    setSteps((prev) =>
      prev.map((s) => {
        if (s.id === "review_link") return { ...s, done: hasReviewLink };
        if (s.id === "first_customer") return { ...s, done: hasCustomer };
        if (s.id === "first_send") return { ...s, done: hasSent };
        return s;
      })
    );

    if (hasReviewLink && hasCustomer && hasSent) {
      setAllDone(true);
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }, 500);
    }
  };

  const doneCount = steps.filter((s) => s.done).length;
  const progress = (doneCount / steps.length) * 100;

  const handleStepClick = (id: string) => {
    if (id === "review_link") navigate("/settings");
    if (id === "first_customer") navigate("/dashboard");
    if (id === "first_send") navigate("/dashboard");
  };

  return (
    <div className="glass-card p-6 sm:p-8 max-w-md w-full">
      <h3 className="text-lg font-bold text-foreground mb-1">
        {allDone ? "You're live! First review incoming 🎉" : "Your ReviewBoost setup — 3 steps"}
      </h3>
      <p className="text-sm text-muted-foreground mb-5">
        {allDone ? "Everything is set up. Reviews will start coming in!" : `${doneCount} of ${steps.length} complete`}
      </p>

      <Progress value={progress} className="h-2 mb-6" />

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {steps.map((step, i) => (
            <motion.button
              key={step.id}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              onClick={() => !step.done && handleStepClick(step.id)}
              disabled={step.done}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors ${
                step.done
                  ? "bg-primary/10 border border-primary/20"
                  : "bg-secondary/50 border border-border/30 hover:border-primary/30 cursor-pointer"
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  step.done
                    ? "gradient-primary text-primary-foreground"
                    : "border-2 border-muted-foreground/30 text-muted-foreground"
                }`}
              >
                {step.done ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${step.done ? "text-foreground" : "text-foreground/80"}`}>
                  {step.label}
                </span>
                {step.sublabel && !step.done && (
                  <span className="text-xs text-muted-foreground ml-2">({step.sublabel})</span>
                )}
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {allDone && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Button variant="hero" className="btn-press w-full" onClick={() => navigate("/dashboard")}>
            <Rocket className="mr-2 h-4 w-4" />
            Go to Dashboard
          </Button>
        </motion.div>
      )}
    </div>
  );
}
