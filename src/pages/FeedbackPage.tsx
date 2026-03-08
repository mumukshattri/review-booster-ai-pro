import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";

type FeedbackState = "loading" | "choose" | "form" | "submitting" | "thankyou" | "redirecting" | "error";

const FeedbackPage = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const [state, setState] = useState<FeedbackState>("loading");
  const [businessName, setBusinessName] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [reviewUrl, setReviewUrl] = useState("");
  const [message, setMessage] = useState("");
  const [customerData, setCustomerData] = useState<{ user_id: string; name: string; email: string } | null>(null);

  useEffect(() => {
    if (!customerId) {
      setState("error");
      return;
    }
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      // Use the edge function to fetch data (no auth needed)
      const { data, error } = await supabase.functions.invoke("feedback-data", {
        body: { customerId },
      });

      if (error || !data?.customer) {
        setState("error");
        return;
      }

      setCustomerData(data.customer);
      setBusinessName(data.businessName || "our business");
      setLogoUrl(data.logoUrl || null);
      setReviewUrl(data.reviewUrl || "");
      setState("choose");
    } catch {
      setState("error");
    }
  };

  const handlePositive = async () => {
    setState("redirecting");
    // Track the click
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const trackUrl = `https://${projectId}.supabase.co/functions/v1/track-click?cid=${customerId}&url=${encodeURIComponent(reviewUrl)}`;
    
    // Redirect via track-click which handles click tracking and redirects to review
    setTimeout(() => {
      window.location.href = trackUrl;
    }, 1000);
  };

  const handleSubmitFeedback = async () => {
    if (!message.trim() || !customerData) return;
    setState("submitting");

    try {
      await supabase.functions.invoke("feedback-data", {
        body: {
          customerId,
          action: "submit",
          message: message.trim().substring(0, 1000),
        },
      });
    } catch (e) {
      console.error("Feedback submit error:", e);
    }
    setState("thankyou");
  };

  if (state === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-muted-foreground">This feedback link is invalid or has expired.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Choice Step */}
        {state === "choose" && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center animate-in fade-in duration-300">
            {logoUrl ? (
              <img src={logoUrl} alt={businessName} className="w-14 h-14 rounded-2xl object-cover mx-auto mb-6" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Star className="w-7 h-7 text-primary" />
              </div>
            )}
            <h1 className="text-xl font-bold text-foreground mb-2">
              How was your experience at {businessName}?
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              Your feedback means everything to us
            </p>
            <div className="flex gap-4">
              <button
                onClick={handlePositive}
                className="flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border border-primary/20 bg-primary/10 hover:bg-primary/20 hover:border-primary/40 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span className="text-4xl">😊</span>
                <span className="text-sm font-semibold text-primary">It was great!</span>
              </button>
              <button
                onClick={() => setState("form")}
                className="flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-muted-foreground/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span className="text-4xl">😞</span>
                <span className="text-sm font-semibold text-muted-foreground">Could be better</span>
              </button>
            </div>
          </div>
        )}

        {/* Feedback Form */}
        {(state === "form" || state === "submitting") && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center animate-in fade-in duration-300">
            <h1 className="text-xl font-bold text-foreground mb-2">
              We're sorry to hear that.
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              What could we have done better?
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your experience..."
              maxLength={1000}
              className="w-full min-h-[120px] bg-secondary/50 border border-border rounded-xl p-4 text-foreground text-sm resize-none outline-none focus:border-primary/50 placeholder:text-muted-foreground mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setState("choose")}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!message.trim() || state === "submitting"}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {state === "submitting" ? "Sending..." : "Send Feedback"}
              </button>
            </div>
          </div>
        )}

        {/* Thank You */}
        {state === "thankyou" && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
              <svg className="w-7 h-7 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Thank you for your feedback!</h1>
            <p className="text-sm text-muted-foreground">
              We'll work on improving. Your input helps us get better.
            </p>
          </div>
        )}

        {/* Redirecting */}
        {state === "redirecting" && (
          <div className="bg-card border border-border rounded-2xl p-8 text-center animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Star className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">Awesome! 🎉</h1>
            <p className="text-sm text-muted-foreground">Redirecting you to leave a review...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPage;
