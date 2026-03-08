import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Star, Smile, Frown, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type Step = "choice" | "feedback" | "thankyou" | "redirecting";

export default function ReviewLanding() {
  const [searchParams] = useSearchParams();
  const cid = searchParams.get("cid");
  const fallbackUrl = searchParams.get("url") || "https://google.com";

  const [step, setStep] = useState<Step>("choice");
  const [businessName, setBusinessName] = useState("us");
  const [reviewUrl, setReviewUrl] = useState(fallbackUrl);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<{ user_id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    if (!cid) return;
    const load = async () => {
      const { data: customer } = await supabase
        .from("customers")
        .select("user_id, name, email")
        .eq("id", cid)
        .single();
      if (customer) {
        setCustomerInfo({ user_id: customer.user_id, name: customer.name, email: customer.email });
        // Mark as clicked
        await supabase.from("customers").update({ clicked: true }).eq("id", cid);
        // Get business info
        const { data: profile } = await supabase
          .from("profiles")
          .select("business_name, review_url, direct_review_url")
          .eq("id", customer.user_id)
          .single();
        if (profile) {
          setBusinessName(profile.business_name || "us");
          setReviewUrl(profile.direct_review_url || profile.review_url || fallbackUrl);
        }
      }
    };
    load();
  }, [cid, fallbackUrl]);

  const handlePositive = () => {
    setStep("redirecting");
    setTimeout(() => {
      window.location.href = reviewUrl;
    }, 1200);
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim() || !customerInfo || !cid) return;
    setSubmitting(true);
    await supabase.from("feedback").insert({
      customer_id: cid,
      user_id: customerInfo.user_id,
      message: feedbackText.trim(),
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
    });
    setSubmitting(false);
    setStep("thankyou");
  };

  const ease = [0.33, 1, 0.68, 1] as const;

  return (
    <div className="dark min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === "choice" && (
            <motion.div
              key="choice"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease }}
              className="glass-card p-8 sm:p-10 text-center space-y-8"
            >
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto">
                <Star className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                  How was your experience at {businessName}?
                </h1>
                <p className="text-sm text-muted-foreground">Your feedback means everything to us</p>
              </div>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handlePositive}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300 min-w-[130px]"
                >
                  <Smile className="h-10 w-10 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-emerald-400">Great!</span>
                </button>
                <button
                  onClick={() => setStep("feedback")}
                  className="group flex flex-col items-center gap-3 p-6 rounded-2xl bg-secondary/50 border border-border/30 hover:bg-secondary hover:border-border/50 transition-all duration-300 min-w-[130px]"
                >
                  <Frown className="h-10 w-10 text-muted-foreground group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-semibold text-muted-foreground">Not so great</span>
                </button>
              </div>
            </motion.div>
          )}

          {step === "feedback" && (
            <motion.div
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease }}
              className="glass-card p-8 sm:p-10 space-y-6"
            >
              <div className="text-center">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  Tell us what went wrong
                </h2>
                <p className="text-sm text-muted-foreground">
                  We take your feedback seriously and will work to improve.
                </p>
              </div>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Share your experience..."
                className="bg-secondary/50 border-border/50 min-h-[120px] resize-none"
                maxLength={1000}
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-secondary/50 border-border/50"
                  onClick={() => setStep("choice")}
                >
                  Back
                </Button>
                <Button
                  variant="hero"
                  className="flex-1 btn-press"
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackText.trim() || submitting}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting ? "Sending..." : "Send Feedback"}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "thankyou" && (
            <motion.div
              key="thankyou"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease }}
              className="glass-card p-8 sm:p-10 text-center space-y-6"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="h-7 w-7 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Thank you!</h2>
                <p className="text-sm text-muted-foreground">
                  Your feedback has been received. We appreciate you taking the time to help us improve.
                </p>
              </div>
            </motion.div>
          )}

          {step === "redirecting" && (
            <motion.div
              key="redirecting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease }}
              className="glass-card p-8 sm:p-10 text-center space-y-6"
            >
              <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto animate-pulse">
                <Star className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Awesome! 🎉</h2>
                <p className="text-sm text-muted-foreground">Redirecting you to leave a review...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
