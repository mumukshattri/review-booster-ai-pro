import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
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
    }).eq("id", user.id);
    setLoading(false);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Settings saved" });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm">Manage your business info and subscription</p>
        </div>

        <div className="glass-card p-8 space-y-6">
          <h2 className="text-lg font-semibold text-foreground">Business Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="business">Business Name</Label>
              <Input id="business" value={businessName} onChange={e => setBusinessName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review-url">Google Review URL</Label>
              <Input id="review-url" value={reviewUrl} onChange={e => setReviewUrl(e.target.value)} />
            </div>
          </div>
          <Button variant="hero" onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="glass-card p-8 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${subscriptionStatus === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>
              {subscriptionStatus === "active" ? "Active" : subscriptionStatus === "trial" ? "Free Trial" : subscriptionStatus}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Your subscription is managed through Lemon Squeezy.
          </p>
          <Button variant="outline">
            Manage Subscription
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
