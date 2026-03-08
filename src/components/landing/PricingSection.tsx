import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Check, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { TiltCard } from "@/components/TiltCard";

const tiers = [
  {
    name: "STARTER",
    monthly: 19,
    description: "Best for small shops, solo businesses",
    features: [
      "Up to 50 review requests/month",
      "AI-personalized emails",
      "Basic dashboard",
      "Email support",
    ],
    popular: false,
  },
  {
    name: "PRO",
    monthly: 49,
    description: "Best for growing restaurants, salons",
    features: [
      "Up to 500 review requests/month",
      "AI-personalized emails",
      "Real-time analytics dashboard",
      "CSV bulk import",
      "Priority email support",
    ],
    popular: true,
  },
  {
    name: "AGENCY",
    monthly: 99,
    description: "Best for marketing agencies, chains",
    features: [
      "Unlimited review requests",
      "Multiple business locations",
      "White-label emails",
      "Advanced analytics",
      "Priority support + onboarding call",
    ],
    popular: false,
  },
];

const comparisonRows: { feature: string; starter: boolean | string; pro: boolean | string; agency: boolean | string }[] = [
  { feature: "Review requests / month", starter: "50", pro: "500", agency: "Unlimited" },
  { feature: "AI-personalized emails", starter: true, pro: true, agency: true },
  { feature: "Basic dashboard", starter: true, pro: true, agency: true },
  { feature: "Real-time analytics", starter: false, pro: true, agency: true },
  { feature: "CSV bulk import", starter: false, pro: true, agency: true },
  { feature: "Multiple business locations", starter: false, pro: false, agency: true },
  { feature: "White-label emails", starter: false, pro: false, agency: true },
  { feature: "Advanced analytics", starter: false, pro: false, agency: true },
  { feature: "Onboarding call", starter: false, pro: false, agency: true },
  { feature: "Email support", starter: "Standard", pro: "Priority", agency: "Priority" },
];

interface PricingSectionProps {
  dur: number;
  ease: [number, number, number, number];
}

export function PricingSection({ dur, ease }: PricingSectionProps) {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="container mx-auto px-4 py-16 sm:py-28 relative z-10">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: dur * 2, ease }}
        className="text-2xl sm:text-3xl md:text-5xl font-black text-center mb-3 sm:mb-4 tracking-tight"
      >
        Simple Pricing
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ delay: 0.05, duration: dur * 2, ease }}
        className="text-muted-foreground text-center mb-8 sm:mb-10 max-w-xl mx-auto"
      >
        Choose the plan that fits your business. No hidden fees.
      </motion.p>

      {/* Annual toggle */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ delay: 0.1, duration: dur * 2, ease }}
        className="flex items-center justify-center gap-3 mb-12 sm:mb-16"
      >
        <span className={`text-sm transition-colors ${!annual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <button
          onClick={() => setAnnual(!annual)}
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${annual ? "bg-primary" : "bg-muted"}`}
          aria-label="Toggle annual billing"
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-foreground transition-transform duration-200 ${annual ? "translate-x-6" : "translate-x-0"}`}
          />
        </button>
        <span className={`text-sm transition-colors ${annual ? "text-foreground font-semibold" : "text-muted-foreground"}`}>
          Annual
        </span>
        {annual && (
          <span className="text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
            Save 20%
          </span>
        )}
      </motion.div>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto items-center">
        {tiers.map((tier, i) => {
          const price = annual ? Math.round(tier.monthly * 0.8) : tier.monthly;
          const CardWrapper = tier.popular ? TiltCard : "div";

          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: i * 0.1, duration: dur * 2.5, ease }}
              className={tier.popular ? "md:-my-4 relative z-10" : ""}
            >
              <CardWrapper
                className={`glass-card p-7 sm:p-9 text-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  tier.popular
                    ? "glow-primary-intense border-primary/30 md:py-11"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-4 right-4 gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-xs font-bold text-primary uppercase tracking-widest mb-4">
                  {tier.name}
                </div>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className={`font-black ${tier.popular ? "text-5xl sm:text-6xl" : "text-4xl sm:text-5xl"}`}>
                    ${price}
                  </span>
                  <span className="text-muted-foreground text-lg">/mo</span>
                </div>
                {annual && (
                  <p className="text-xs text-muted-foreground line-through mb-1">
                    ${tier.monthly}/mo
                  </p>
                )}
                <p className="text-muted-foreground text-sm mb-7 sm:mb-8">
                  {tier.description}
                </p>
                <ul className="space-y-3 text-left mb-7 sm:mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        tier.popular ? "gradient-primary" : "bg-muted"
                      }`}>
                        <Check className={`h-3 w-3 ${tier.popular ? "text-primary-foreground" : "text-foreground"}`} />
                      </div>
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  variant={tier.popular ? "hero" : "outline"}
                  size="lg"
                  className={`btn-press w-full text-base py-6 min-h-[52px] ${
                    tier.popular ? "pulse-glow" : "bg-secondary/50 border-border/50 hover:bg-secondary"
                  }`}
                  asChild
                >
                  <Link to="/signup">
                    {tier.popular ? "Start Free Trial" : "Get Started"}
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  No credit card required
                </p>
              </CardWrapper>
            </motion.div>
          );
        })}
      </div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: dur * 2.5, ease }}
        className="max-w-5xl mx-auto mt-16 sm:mt-24"
      >
        <h3 className="text-lg sm:text-xl font-bold text-center mb-8 tracking-tight">
          Compare Plans
        </h3>
        <div className="glass-card overflow-hidden rounded-xl border-border/20">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/20">
                  <th className="text-left py-4 px-5 text-muted-foreground font-medium w-[40%]">Feature</th>
                  <th className="text-center py-4 px-4 text-muted-foreground font-medium">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold text-primary">Pro</th>
                  <th className="text-center py-4 px-4 text-muted-foreground font-medium">Agency</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-border/10 last:border-0 hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-5 text-foreground/80">{row.feature}</td>
                    {[row.starter, row.pro, row.agency].map((val, j) => (
                      <td key={j} className="py-3.5 px-4 text-center">
                        {val === true ? (
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center mx-auto ${j === 1 ? "gradient-primary" : "bg-muted"}`}>
                            <Check className={`h-3 w-3 ${j === 1 ? "text-primary-foreground" : "text-foreground"}`} />
                          </div>
                        ) : val === false ? (
                          <Minus className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        ) : (
                          <span className={`text-sm ${j === 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
