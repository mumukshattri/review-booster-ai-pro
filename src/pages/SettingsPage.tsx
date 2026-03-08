import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [directReviewUrl, setDirectReviewUrl] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setBusinessName(data.business_name || "");
        setReviewUrl(data.review_url || "");
        setDirectReviewUrl((data as any).direct_review_url || "");
        setSubscriptionStatus(data.subscription_status || "trial");
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      business_name: businessName,
      review_url: reviewUrl,
      direct_review_url: directReviewUrl,
    }).eq("id", user.id);
    setLoading(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved ✓" });
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-2xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground text-sm">Manage your business info and subscription</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass-card p-8 space-y-6"
          >
            <h2 className="text-lg font-bold text-foreground">Business Information</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="business">Business Name</Label>
                <Input id="business" value={businessName} onChange={e => setBusinessName(e.target.value)} className="bg-secondary/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="review-url">Google Maps URL</Label>
                <Input id="review-url" value={reviewUrl} onChange={e => setReviewUrl(e.target.value)} className="bg-secondary/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direct-review-url">Direct Review Link</Label>
                <Input id="direct-review-url" value={directReviewUrl} onChange={e => setDirectReviewUrl(e.target.value)} placeholder="https://search.google.com/local/writereview?placeid=..." className="bg-secondary/50 border-border/50" />
                <p className="text-xs text-muted-foreground">Customers will land directly on the Google review form — zero friction.</p>
              </div>
            </div>
            <Button variant="hero" className="btn-press" onClick={handleSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="glass-card p-8 space-y-4"
          >
            <h2 className="text-lg font-bold text-foreground">Subscription</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Status:</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${subscriptionStatus === "active" ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/15 text-amber-400 border border-amber-500/20"}`}>
                {subscriptionStatus === "active" ? "Active" : subscriptionStatus === "trial" ? "Free Trial" : subscriptionStatus}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your subscription is managed through Lemon Squeezy.
            </p>
            <Button variant="outline" className="btn-press bg-secondary/50 border-border/50 hover:bg-secondary">
              Manage Subscription
            </Button>
          </motion.div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
