import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, ArrowRight, Building, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleStep1 = async () => {
    if (!businessName.trim() || !reviewUrl.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      business_name: businessName,
      review_url: reviewUrl,
      subscription_status: "trial",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      setStep(2);
    }
  };

  const handleStep2 = () => {
    toast({ title: "Payment integration", description: "Lemon Squeezy checkout will be connected here. Proceeding to dashboard." });
    navigate("/dashboard");
  };

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center px-4 relative">
      <AnimatedBackground />
      <PageTransition>
        <div className="w-full max-w-md relative z-10">
          <div className="flex items-center gap-2.5 justify-center mb-8">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Star className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">ReviewBoost</span>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${s === step ? "gradient-primary text-primary-foreground shadow-[0_0_20px_-5px_hsl(263_70%_58%/0.5)]" : s < step ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"}`}>
                  {s}
                </div>
                {s < 2 && <div className={`w-12 h-0.5 transition-colors duration-300 ${step > 1 ? "bg-primary" : "bg-secondary"}`} />}
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8"
          >
            {step === 1 ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <Building className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Business Info</h2>
                    <p className="text-sm text-muted-foreground">Tell us about your business</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business">Business Name</Label>
                    <Input id="business" value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="Acme Coffee Shop" className="bg-secondary/50 border-border/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="review-url">Google Review Page URL</Label>
                    <Input id="review-url" value={reviewUrl} onChange={e => setReviewUrl(e.target.value)} placeholder="https://g.page/r/..." className="bg-secondary/50 border-border/50" />
                  </div>
                  <Button variant="hero" className="btn-press w-full" onClick={handleStep1} disabled={loading}>
                    {loading ? "Saving..." : "Continue"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Connect Payment</h2>
                    <p className="text-sm text-muted-foreground">Subscribe to get started</p>
                  </div>
                </div>
                <div className="glass-card p-6 mb-6 text-center">
                  <div className="text-4xl font-black text-foreground mb-1">$49<span className="text-lg text-muted-foreground font-normal">/mo</span></div>
                  <p className="text-sm text-muted-foreground">Pro Plan — Cancel anytime</p>
                </div>
                <Button variant="hero" className="btn-press w-full" onClick={handleStep2}>
                  Subscribe with Lemon Squeezy
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  You'll be redirected to Lemon Squeezy for secure checkout
                </p>
              </>
            )}
          </motion.div>
        </div>
      </PageTransition>
    </div>
  );
}
