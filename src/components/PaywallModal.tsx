import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

const plans = [
  {
    name: "Starter",
    price: "₹999",
    features: [
      "Up to 100 emails/month",
      "1 business",
      "Basic analytics",
      "Email support",
    ],
    popular: false,
    variantId: "1398674",
  },
  {
    name: "Pro",
    price: "₹2,499",
    features: [
      "Up to 500 emails/month",
      "3 businesses",
      "Advanced analytics",
      "Priority support",
    ],
    popular: true,
    variantId: "1399999",
  },
  {
    name: "Agency",
    price: "₹5,999",
    features: [
      "Unlimited emails",
      "Unlimited businesses",
      "White-label ready",
      "Dedicated support",
    ],
    popular: false,
    variantId: "1399966",
  },
];

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const handleChoosePlan = (variantId: string) => {
    window.open(
      `https://getreviewboost.lemonsqueezy.com/checkout/buy/${variantId}`,
      "_blank"
    );
  };

  return (
    <AnimatePresence>
      {visible && (
        <div
          className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border border-border w-full max-w-[860px] p-8 sm:p-10 relative rounded-xl shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors text-lg"
            >
              ✕
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                Start getting more reviews today
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose a plan that fits your business. Cancel anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl border p-6 flex flex-col relative ${
                    plan.popular
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-secondary/30"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="text-xs font-bold text-primary uppercase tracking-widest mb-2">
                      {plan.name}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black">{plan.price}</span>
                      <span className="text-muted-foreground text-sm">/mo</span>
                    </div>
                  </div>

                  <ul className="space-y-2.5 mb-6 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                            plan.popular ? "bg-primary" : "bg-muted"
                          }`}
                        >
                          <Check
                            className={`h-2.5 w-2.5 ${
                              plan.popular
                                ? "text-primary-foreground"
                                : "text-foreground"
                            }`}
                          />
                        </div>
                        <span className="text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "hero" : "outline"}
                    className="w-full"
                    onClick={() => handleChoosePlan(plan.variantId)}
                  >
                    Choose Plan
                  </Button>
                </div>
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">
              🔒 Secure checkout. Instant access after payment.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
