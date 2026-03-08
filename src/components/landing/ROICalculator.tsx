import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Link } from "react-router-dom";
import { ArrowRight, Calculator, TrendingUp, Star, Users, IndianRupee } from "lucide-react";

interface ROICalculatorProps {
  dur: number;
  ease: [number, number, number, number];
}

export function ROICalculator({ dur, ease }: ROICalculatorProps) {
  const [customers, setCustomers] = useState(250);
  const [rating, setRating] = useState(3.8);

  // Projected calculations
  const reviewRate = 0.18; // 18% of customers leave a review
  const projectedReviews = Math.round(customers * reviewRate);
  const ratingBoost = Math.min(5, rating + 0.5 + (5 - rating) * 0.15);
  const walkInIncrease = Math.round((ratingBoost - rating) * 30);
  const avgRevenuePerCustomer = 180; // ₹180
  const extraRevenue = Math.round(customers * (walkInIncrease / 100) * avgRevenuePerCustomer);

  return (
    <section className="container mx-auto px-4 py-16 sm:py-28 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: dur * 2, ease }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-4">
          <Calculator className="h-3.5 w-3.5" />
          ROI Calculator
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight mb-3">
          How much is a bad review <span className="gradient-text">costing you?</span>
        </h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: dur * 2.5, ease }}
        className="glass-card p-8 sm:p-10 max-w-2xl mx-auto"
      >
        {/* Sliders */}
        <div className="space-y-8 mb-10">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">How many customers visit monthly?</label>
              <span className="text-sm font-bold text-primary">{customers}</span>
            </div>
            <Slider
              value={[customers]}
              onValueChange={([v]) => setCustomers(v)}
              min={50}
              max={500}
              step={10}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>50</span>
              <span>500</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-foreground">Current Google rating?</label>
              <span className="text-sm font-bold text-primary">{rating.toFixed(1)} ⭐</span>
            </div>
            <Slider
              value={[rating * 10]}
              onValueChange={([v]) => setRating(v / 10)}
              min={30}
              max={50}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>3.0</span>
              <span>5.0</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="glass-card p-6 bg-primary/5 border-primary/20 mb-8">
          <p className="text-sm text-muted-foreground mb-4 font-medium">With ReviewBoost you could get:</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="text-lg font-black text-foreground">+{projectedReviews}</div>
                <div className="text-xs text-muted-foreground">reviews/month</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="text-lg font-black text-foreground">{rating.toFixed(1)} → {ratingBoost.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">star rating</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="text-lg font-black text-foreground">~{walkInIncrease}%</div>
                <div className="text-xs text-muted-foreground">more walk-ins</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <IndianRupee className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <div className="text-lg font-black text-foreground">~₹{extraRevenue.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">extra revenue/mo</div>
              </div>
            </div>
          </div>
        </div>

        <Button variant="hero" size="lg" className="btn-press pulse-glow w-full text-base min-h-[52px]" asChild>
          <Link to="/signup">
            Start Getting Reviews → $49/month
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
