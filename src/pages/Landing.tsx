import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload, Sparkles, Star, Check, ArrowRight, Zap, TrendingUp, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { CountUp } from "@/components/CountUp";
import { PageTransition } from "@/components/PageTransition";

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
    description: "Customers click through and leave Google reviews effortlessly.",
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
  }),
};

export default function Landing() {
  return (
    <div className="dark min-h-screen bg-background text-foreground relative">
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
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="btn-press text-muted-foreground" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button variant="hero" className="btn-press" asChild>
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <PageTransition>
        <section className="container mx-auto px-4 pt-28 pb-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary mb-8"
          >
            <Zap className="h-3.5 w-3.5" />
            AI-Powered Review Generation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6 max-w-5xl mx-auto"
          >
            Get More Google Reviews{" "}
            <span className="gradient-text">on Autopilot</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed"
          >
            Upload your customers, let AI craft personalized review requests, and watch your Google ratings soar — all hands-free.
          </motion.p>

          {/* Live counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-foreground"><CountUp end={2847} /></span> reviews collected today
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button variant="hero" size="lg" className="btn-press pulse-glow text-base px-8 py-6 text-lg" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="btn-press text-base px-8 py-6 bg-secondary/50 border-border/50 hover:bg-secondary" asChild>
              <a href="#pricing">View Pricing</a>
            </Button>
          </motion.div>

          {/* Floating review cards */}
          <div className="relative mt-20 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="glass-card p-6 max-w-xs mx-auto"
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
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
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
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 0.7, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
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
                  <div key={`${set}-${i}`} className="flex-shrink-0 glass-card px-6 py-4 min-w-[300px]">
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

        {/* How It Works */}
        <section className="container mx-auto px-4 py-28 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-black text-center mb-4 tracking-tight">
              How It Works
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-center mb-20 max-w-xl mx-auto">
              Three simple steps to supercharge your Google reviews.
            </motion.p>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  custom={i + 2}
                  className="glass-card-hover p-8 text-center group"
                >
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-6 group-hover:shadow-[0_0_30px_-5px_hsl(263_70%_58%/0.5)] transition-shadow duration-300">
                    <step.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-widest mb-3">Step {i + 1}</div>
                  <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 pb-28 relative z-10">
          <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { value: 50000, suffix: "+", label: "Reviews Generated" },
              { value: 2400, suffix: "+", label: "Happy Businesses" },
              { value: 4.9, suffix: "", label: "Avg Rating Boost" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="text-center"
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
        <section id="pricing" className="container mx-auto px-4 py-28 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}>
            <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-5xl font-black text-center mb-4 tracking-tight">
              Simple Pricing
            </motion.h2>
            <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-center mb-20 max-w-xl mx-auto">
              One plan. Everything included. No hidden fees.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="max-w-md mx-auto glass-card p-10 text-center glow-primary-intense relative overflow-hidden"
            >
              {/* Popular badge */}
              <div className="absolute top-4 right-4 gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>

              <div className="text-xs font-bold text-primary uppercase tracking-widest mb-4">PRO PLAN</div>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-6xl font-black">$49</span>
                <span className="text-muted-foreground text-lg">/month</span>
              </div>
              <p className="text-muted-foreground text-sm mb-10">
                Everything you need to grow your reviews
              </p>
              <ul className="space-y-3 text-left mb-10">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full gradient-primary flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="hero" size="lg" className="btn-press pulse-glow w-full text-base py-6" asChild>
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <p className="text-xs text-muted-foreground mt-4">No credit card required · Cancel anytime</p>
            </motion.div>
          </motion.div>
        </section>

        {/* Features grid */}
        <section className="container mx-auto px-4 pb-28 relative z-10">
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Zap, title: "Lightning Fast", desc: "Send thousands of review requests in minutes, not hours." },
              { icon: TrendingUp, title: "Analytics", desc: "Track opens, clicks, and reviews in real-time." },
              { icon: Shield, title: "Secure & Private", desc: "Enterprise-grade security for your customer data." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="glass-card-hover p-8"
              >
                <f.icon className="h-6 w-6 text-primary mb-4" />
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-28 relative z-10">
          <div className="glass-card p-16 text-center max-w-4xl mx-auto glow-primary">
            <h2 className="text-3xl md:text-4xl font-black mb-4">Ready to boost your reviews?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Join thousands of businesses already using ReviewBoost to grow their online reputation.</p>
            <Button variant="hero" size="lg" className="btn-press pulse-glow text-base px-10 py-6" asChild>
              <Link to="/signup">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/30 py-8 relative z-10">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            © 2026 ReviewBoost. All rights reserved.
          </div>
        </footer>
      </PageTransition>
    </div>
  );
}
