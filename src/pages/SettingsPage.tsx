import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [reviewUrl, setReviewUrl] = useState("");
  const [directReviewUrl, setDirectReviewUrl] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState("");
  const [autoSendEnabled, setAutoSendEnabled] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        setAutoSendEnabled((data as any).auto_send_enabled || false);
        setLogoUrl((data as any).logo_url || null);
      }
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

    const { data: urlData } = supabase.storage
      .from("business-logos")
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;
    
    await supabase.from("profiles").update({ logo_url: publicUrl } as any).eq("id", user.id);
    setLogoUrl(publicUrl);
    setUploading(false);
    toast({ title: "Logo uploaded ✓" });
  };

  const handleRemoveLogo = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Remove from storage (best effort)
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
                      <img
                        src={logoUrl}
                        alt="Business logo"
                        className="w-16 h-16 rounded-xl object-cover border border-border"
                      />
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
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
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
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-1">
                <Label htmlFor="auto-send">Auto-send review requests</Label>
                <p className="text-xs text-muted-foreground">Immediately send a review request when a customer is added</p>
              </div>
              <Switch id="auto-send" checked={autoSendEnabled} onCheckedChange={setAutoSendEnabled} />
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
