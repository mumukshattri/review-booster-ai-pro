import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Check } from "lucide-react";
import { PlanType, PLANS } from "@/lib/plans";
import { supabase } from "@/integrations/supabase/client";

interface UpgradeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    featureName: string;
    requiredPlan: PlanType;
}

export function UpgradeModal({ open, onOpenChange, featureName, requiredPlan }: UpgradeModalProps) {
    const config = PLANS[requiredPlan];

    const handleUpgrade = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) return;

        // Use actual Lemon Squeezy variants mappings or just main store URL
        // TODO: Replace with your actual Lemon Squeezy product URL
        const checkoutUrl = `https://getreviewboost.lemonsqueezy.com/buy?checkout[email]=${encodeURIComponent(user.email)}`;
        window.location.href = checkoutUrl;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden border-border/40 bg-background/95 backdrop-blur-xl">
                <div className="p-8 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">Upgrade Required</h2>
                        <p className="text-muted-foreground">
                            {featureName} is a {" "}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${config.badgeColor}`}>
                                {config.name}
                            </span> {" "}
                            feature.
                        </p>
                    </div>

                    <div className="bg-secondary/30 rounded-xl p-5 text-left border border-border/30">
                        <h3 className="font-semibold text-foreground mb-3 text-sm uppercase tracking-wider">What you get with {config.name}</h3>
                        <ul className="space-y-2 text-sm text-foreground/80">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-emerald-400" />
                                {config.maxCustomers === null ? "Unlimited" : config.maxCustomers} customers
                            </li>
                            {config.hasSequence && (
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-400" />
                                    Full 3-email auto-sequence
                                </li>
                            )}
                            {config.hasFeedback && (
                                <li className="flex items-center gap-2">
                                    <Check className="h-4 w-4 text-emerald-400" />
                                    Private negative feedback inbox
                                </li>
                            )}
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-emerald-400" />
                                CSV bulk upload
                            </li>
                        </ul>
                    </div>

                    <Button variant="hero" className="w-full btn-press py-6 text-lg" onClick={handleUpgrade}>
                        Upgrade to {config.name} →
                    </Button>

                    <button onClick={() => onOpenChange(false)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        Dismiss
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
