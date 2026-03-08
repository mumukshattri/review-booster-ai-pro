import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Upload, Sparkles, Star, Check, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Customers",
    description: "Import your customer list via CSV with names and emails.",
  },
  {
    icon: Sparkles,
    title: "AI Sends Requests",
    description: "Claude AI crafts personalized, warm review requests for each customer.",
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
  "Real-time analytics",
  "CSV customer import",
  "Google Reviews integration",
];

export default function Landing() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <Star className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ReviewBoost</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/signup">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary mb-8">
          <Sparkles className="h-4 w-4" />
          AI-Powered Review Generation
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
          Get More Google Reviews{" "}
          <span className="gradient-text">on Autopilot</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Upload your customers, let AI craft personalized review requests, and watch your Google ratings soar — all hands-free.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="hero" size="lg" className="text-base px-8 py-6" asChild>
            <Link to="/signup">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-base px-8 py-6" asChild>
            <a href="#pricing">View Pricing</a>
          </Button>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          How It Works
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
          Three simple steps to supercharge your Google reviews.
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="glass-card p-8 text-center group hover:border-primary/40 transition-colors">
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-6 group-hover:glow-primary transition-shadow">
                <step.icon className="h-7 w-7 text-primary-foreground" />
              </div>
              <div className="text-sm font-medium text-primary mb-2">Step {i + 1}</div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container mx-auto px-4 py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Simple Pricing
        </h2>
        <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
          One plan. Everything included. No hidden fees.
        </p>
        <div className="max-w-md mx-auto glass-card p-10 text-center glow-primary">
          <div className="text-sm font-medium text-primary mb-2">PRO PLAN</div>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-5xl font-extrabold">$49</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-muted-foreground text-sm mb-8">
            Everything you need to grow your reviews
          </p>
          <ul className="space-y-3 text-left mb-10">
            {features.map((f, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <Button variant="hero" size="lg" className="w-full text-base py-6" asChild>
            <Link to="/signup">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 ReviewBoost. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
