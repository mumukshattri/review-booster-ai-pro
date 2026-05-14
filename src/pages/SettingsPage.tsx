import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Upload, X, Zap, Crown, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { usePlan } from "@/hooks/usePlan";
import { PLANS, PlanType } from "@/lib/plans";
import { usePageTitle } from "@/hooks/usePageTitle";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [directReviewUrl, setDirectReviewUrl] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [customersCount, setCustomersCount] = useState(0);
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { plan } = usePlan();
  const { toast } = useToast();
  usePageTitle("Settings");

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
        setAutoSendEnabled((data as any).auto_send_enabled || false);
        setLogoUrl((data as any).logo_url || null);
        setPlanExpiresAt((data as any).plan_expires_at || null);
      }
      const { count } = await supabase.from("customers").select("*", { count: "exact", head: true }).eq("user_id", user.id);
      setCustomersCount(count || 0);
    };
    load();
  }, []);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please upload an image file", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "Image must be under 2MB", variant: "destructive" });
      return;
    }
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from("business-logos")
      .upload(filePath, file, { upsert: true });
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("business-logos").getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;
    await supabase.from("profiles").update({ logo_url: publicUrl } as any).eq("id", user.id);
    setLogoUrl(publicUrl);
    setUploading(false);
    toast({ title: "Logo uploaded ✓" });
  };

  const handleRemoveLogo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.storage.from("business-logos").remove([`${user.id}/logo.png`, `${user.id}/logo.jpg`, `${user.id}/logo.jpeg`, `${user.id}/logo.webp`]);
    await supabase.from("profiles").update({ logo_url: null } as any).eq("id", user.id);
    setLogoUrl(null);
    toast({ title: "Logo removed" });
  };

  const handleSave = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      business_name: businessName,
      review_url: reviewUrl,
      direct_review_url: directReviewUrl,
      auto_send_enabled: autoSendEnabled,
    } as any).eq("id", user.id);
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

          {/* Auto-Send Sequence Card - Prominent at top */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="glass-card p-6 border-primary/20"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${autoSendEnabled ? "bg-primary/20" : "bg-secondary"
                  }`}>
                  <Zap className={`w-6 h-6 transition-colors ${autoSendEnabled ? "text-primary" : "text-muted-foreground"
                    }`} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Auto-Send Sequence</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automatically send a 3-email review request sequence when a customer is added
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${autoSendEnabled
                        ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                        : "bg-secondary text-muted-foreground border border-border/20"
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${autoSendEnabled ? "bg-emerald-400" : "bg-muted-foreground/50"
                        }`} />
                      {autoSendEnabled ? "Active" : "Disabled"}
                    </span>
                    {autoSendEnabled && (
                      <span className="text-xs text-muted-foreground">
                        Email 1 → Day 0 · Email 2 → Day 3 · Email 3 → Day 7
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Switch
                checked={autoSendEnabled}
                onCheckedChange={setAutoSendEnabled}
                className="shrink-0 mt-1"
              />
            </div>
          </motion.div>

          {/* Business Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="glass-card p-8 space-y-6"
          >
            <h2 className="text-lg font-bold text-foreground">Business Information</h2>
            <div className="space-y-4">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label>Business Logo</Label>
                <div className="flex items-center gap-4">
                  {logoUrl ? (
                    <div className="relative">
                      <img src={logoUrl} alt="Business logo" className="w-16 h-16 rounded-xl object-cover border border-border" />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:opacity-80 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl border border-dashed border-border bg-secondary/30 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-secondary/50 border-border/50"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : logoUrl ? "Change Logo" : "Upload Logo"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WebP. Max 2MB.</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoUpload} />
                </div>
              </div>

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

          {/* Subscription & Plan */}
          <motion.div
            id="subscription"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="glass-card p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Billing & Plan</h2>
                <p className="text-sm text-muted-foreground mt-1 tracking-wide">
                  Manage your subscription and limits
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${PLANS[plan].badgeColor}`}>
                {plan === 'agency' && <Crown className="h-3 w-3" />}
                {PLANS[plan].name} Plan
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-secondary/30 border border-border/30 rounded-xl p-5 space-y-1">
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Customer Usage</span>
                <div className="text-2xl font-bold text-foreground mt-1">
                  {customersCount} <span className="text-lg text-muted-foreground font-normal">/ {PLANS[plan].maxCustomers || 'Unlimited'}</span>
                </div>
              </div>
              {plan !== "free" && (
                <div className="bg-secondary/30 border border-border/30 rounded-xl p-5 space-y-1">
                  <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Status & Renewal</span>
                  <div className="text-lg font-bold text-foreground mt-1 capitalize">
                    {subscriptionStatus === "active" ? (
                      planExpiresAt ? `Renews on ${new Date(planExpiresAt).toLocaleDateString()}` : "Active Subscription"
                    ) : subscriptionStatus === "cancelled" ? (
                      planExpiresAt ? `Ends on ${new Date(planExpiresAt).toLocaleDateString()}` : "Cancelled"
                    ) : subscriptionStatus}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="hero"
                className="btn-press flex-1"
                onClick={async () => {
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user || !user.email) return;
                  const checkoutUrl = `https://getreviewboost.lemonsqueezy.com/buy?checkout[email]=${encodeURIComponent(user.email)}`;
                  window.location.href = checkoutUrl;
                }}
              >
                Change or Upgrade Plan
              </Button>
              {plan !== "free" && subscriptionStatus !== "cancelled" && (
                <Button
                  variant="outline"
                  className="bg-secondary/50 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 btn-press flex-1"
                  onClick={() => window.open('https://getreviewboost.lemonsqueezy.com/billing', '_blank')}
                >
                  Manage Billing / Cancel
                </Button>
              )}
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Subscription securely managed by Lemon Squeezy.
            </p>
          </motion.div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
