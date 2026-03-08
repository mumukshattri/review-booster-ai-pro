import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, CheckCircle, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LiveDemoSectionProps {
  dur: number;
  ease: [number, number, number, number];
}

export function LiveDemoSection({ dur, ease }: LiveDemoSectionProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!name.trim() || !email.trim()) {
      toast({ title: "Please fill in both fields", variant: "destructive" });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Please enter a valid email", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-demo-email", {
        body: { name: name.trim(), email: email.trim() },
      });
      if (error) throw error;
      setSent(true);
      toast({ title: "Sample review request sent! Check your inbox 📬" });
    } catch (err) {
      toast({ title: "Failed to send email", description: "Please try again later.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mx-auto px-4 py-16 sm:py-28 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: dur * 2.5, ease }}
        className="glass-card p-8 sm:p-12 max-w-xl mx-auto glow-primary"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-2xl sm:text-3xl font-black text-center">See It in Action</h2>
        </div>
        <p className="text-muted-foreground text-center mb-8 text-sm">
          Experience what your customers will receive — enter your details and we'll send you a real sample review request.
        </p>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-lg font-bold text-foreground mb-1">Check your inbox! 📬</p>
            <p className="text-sm text-muted-foreground">We just sent you a sample review request from ReviewBoost.</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <Input
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-secondary/50 border-border/50 min-h-[48px]"
            />
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary/50 border-border/50 min-h-[48px]"
            />
            <Button
              variant="hero"
              className="btn-press pulse-glow w-full text-base min-h-[52px]"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Send Me a Sample Review Request
                </>
              )}
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          Join <span className="font-semibold text-foreground">500+</span> businesses already getting more reviews
        </p>
      </motion.div>
    </section>
  );
}
