import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload, Sparkles, Star, Check, ArrowRight, Zap, TrendingUp, Shield, Menu, X } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CountUp } from "@/components/CountUp";
import { PageTransition } from "@/components/PageTransition";
import { CustomCursor } from "@/components/CustomCursor";
import { TiltCard } from "@/components/TiltCard";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { useState } from "react";

const steps = [
  {
    icon: Upload,
    title: "Upload Customers",
    description: "Import your customer list via CSV with names and emails in seconds.",
  },
  {
    icon: Sparkles,
    title: "AI Sends Requests",
    description: "AI crafts personalized, warm review requests for each customer automatically.",
  },
  {
    icon: Star,
    title: "Reviews Come In",
    description: "Customers click one link and land directly on the Google review box — ready to rate in seconds. No searching, no clicking around.",
  },
];

const features = [
  "Unlimited review requests",
  "AI-personalized messages",
  "Email delivery via Resend",
  "Real-time analytics dashboard",
  "CSV customer import",
  "Google Reviews integration",
];

const testimonials = [
  { name: "Sarah M.", role: "Restaurant Owner", text: "ReviewBoost tripled our Google reviews in just 2 weeks. The AI messages feel genuinely personal." },
  { name: "Jake R.", role: "Auto Shop Manager", text: "We went from 3.8 to 4.6 stars. The automation saves us hours every week." },
  { name: "Lisa T.", role: "Dental Clinic", text: "Our patients actually respond to these emails. The personalization is incredible." },
  { name: "Mark D.", role: "Hotel Owner", text: "Best investment we've made. 200+ new reviews in the first month alone." },
  { name: "Amy K.", role: "Spa Owner", text: "So simple to use. Upload, click send, and watch the reviews roll in." },
  { name: "Tom H.", role: "Gym Owner", text: "We've never had so many 5-star reviews. Our competitors are wondering what happened." },
];

// Stagger directions: left, right, left for how-it-works
const stepVariants = [
  { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
  { hidden: { opacity: 0, x: 40 }, visible: { opacity: 1, x: 0 } },
  { hidden: { opacity: 0, x: -40 }, visible: { opacity: 1, x: 0 } },
];

export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  const dur = reducedMotion ? 0.01 : 0.25;
  const ease = [0.33, 1, 0.68, 1] as [number, number, number, number];

  return (
    <div className="dark min-h-screen bg-background text-foreground relative custom-cursor-area overflow-x-hidden">
      <CustomCursor />
      <AnimatedBackground />

      {/* Nav */}
      <nav className="border-b border-border/30 backdrop-blur-xl sticky top-0 z-50 bg-background/60">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <Star className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">ReviewBoost</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="nav-link-underline text-sm text-muted-foreground hover:text-foreground px-3 py-2 transition-colors">Log in</Link>
            <Button variant="hero" className="btn-press" asChild>
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`mobile-nav-drawer ${mobileMenuOpen ? "open" : ""}`}>
          <div className="container mx-auto px-4 py-6 space-y-4">
            <Link to="/login" className="block text-foreground text-base py-3 min-h-[44px]" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
            <Button variant="hero" className="btn-press w-full min-h-[44px]" asChild>
              <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <PageTransition>
        <section className="container mx-auto px-4 pt-16 sm:pt-28 pb-16 sm:pb-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: dur }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-6 sm:mb-8"
          >
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Review Generation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: reducedMotion ? 0 : 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: dur * 2, ease }}
            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-4 sm:mb-6 max-w-5xl mx-auto"
          >
            Get More Google Reviews{" "}
            <span className="gradient-text">on Autopilot</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: reducedMotion ? 0 : 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: dur * 2, ease }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 leading-relaxed px-2"
          >
            Upload your customers, let AI send personalized requests, and customers land directly on the Google review box — ready to rate in seconds.
          </motion.p>

          {/* Live counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: dur }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8 sm:mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-foreground"><CountUp end={2847} /></span> reviews collected today
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: reducedMotion ? 0 : 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: dur * 2, ease }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2"
          >
            <Button variant="hero" size="lg" className="btn-press pulse-glow text-base px-8 py-6 min-h-[52px]" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="btn-press text-base px-8 py-6 bg-secondary/50 border-border/50 hover:bg-secondary min-h-[52px]"
              onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}
            >
              View Pricing
            </Button>
          </motion.div>

          {/* Floating review cards */}
          <div className="relative mt-12 sm:mt-20 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5, ease }}
              className="glass-card p-5 sm:p-6 max-w-xs mx-auto"
            >
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-foreground/80">"Absolutely amazing service! Would highly recommend to anyone."</p>
              <p className="text-xs text-muted-foreground mt-2">— Jessica K.</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ delay: 0.5, duration: 0.4, ease }}
              className="glass-card p-4 max-w-[200px] absolute -left-4 top-4 hidden md:block"
            >
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-foreground/70">"Best experience ever!"</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ delay: 0.6, duration: 0.4, ease }}
              className="glass-card p-4 max-w-[200px] absolute -right-4 top-4 hidden md:block"
            >
              <div className="flex gap-0.5 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-foreground/70">"Outstanding quality!"</p>
            </motion.div>
          </div>
        </section>

        {/* Social proof strip */}
        <section className="border-y border-border/20 py-6 relative z-10 overflow-hidden bg-secondary/20">
          <div className="marquee">
            {[0, 1].map((set) => (
              <div key={set} className="marquee-track">
                {testimonials.map((t, i) => (
                  <div key={`${set}-${i}`} className="flex-shrink-0 glass-card px-5 sm:px-6 py-4 min-w-[260px] sm:min-w-[300px]">
                    <div className="flex gap-0.5 mb-2">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/80 mb-2">"{t.text}"</p>
                    <p className="text-xs text-muted-foreground">{t.name} · {t.role}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* How It Works — staggered L-R-L */}
        <section className="container mx-auto px-4 py-16 sm:py-28 relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: dur * 2, ease }}
            className="text-2xl sm:text-3xl md:text-5xl font-black text-center mb-3 sm:mb-4 tracking-tight"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ delay: 0.05, duration: dur * 2, ease }}
            className="text-muted-foreground text-center mb-12 sm:mb-20 max-w-xl mx-auto"
          >
            Three simple steps to supercharge your Google reviews.
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={stepVariants[i].hidden}
                whileInView={stepVariants[i].visible}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.12, duration: dur * 2, ease }}
                className="glass-card-hover p-6 sm:p-8 text-center group"
              >
                <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 sm:mb-6 group-hover:shadow-[0_0_30px_-5px_hsl(263_70%_58%/0.5)] transition-shadow duration-300">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Step {i + 1}</div>
                <h3 className="text-lg sm:text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 pb-16 sm:pb-28 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { value: 50000, suffix: "+", label: "Reviews Generated" },
              { value: 2400, suffix: "+", label: "Happy Businesses" },
              { value: 4.9, suffix: "", label: "Avg Rating Boost" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ delay: i * 0.1, duration: dur * 2, ease }}
                className="text-center py-4"
              >
                <div className="text-3xl md:text-4xl font-black text-foreground">
                  {stat.value % 1 === 0 ? <CountUp end={stat.value} /> : stat.value}
                  <span className="gradient-text">{stat.suffix}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <PricingSection dur={dur} ease={ease} />

        {/* FAQ */}
        <FAQSection dur={dur} ease={ease} />

        {/* Features grid */}
        <section className="container mx-auto px-4 pb-16 sm:pb-28 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "Zero Friction Reviews", desc: "Customers click one link and land directly on the review box. No searching, no clicking around — just stars and submit." },
              { icon: TrendingUp, title: "Analytics", desc: "Track opens, clicks, and reviews in real-time." },
              { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade security for your customer data." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.1, duration: dur * 2, ease }}
                className="glass-card-hover p-6 sm:p-8"
              >
                <f.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-16 sm:pb-28 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: dur * 2.5, ease }}
            className="glass-card p-10 sm:p-16 text-center max-w-4xl mx-auto glow-primary"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-4">Ready to boost your reviews?</h2>
            <p className="text-muted-foreground mb-6 sm:mb-8 max-w-lg mx-auto text-sm sm:text-base">Join thousands of businesses already using ReviewBoost to grow their online reputation.</p>
            <Button variant="hero" size="lg" className="btn-press pulse-glow text-base px-10 py-6 min-h-[52px]" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: dur * 2, ease }}
          className="border-t border-border/30 py-8 relative z-10"
        >
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2026 ReviewBoost. All rights reserved.
          </div>
        </motion.footer>
      </PageTransition>
    </div>
  );
}
