import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { PageTransition } from "@/components/PageTransition";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Signup failed", description: error.message, variant: "destructive" });
    } else {
      navigate("/onboarding");
    }
  };

  return (
    <div className="dark min-h-screen bg-background flex items-center justify-center px-4 relative">
      <AnimatedBackground />
      <PageTransition>
        <div className="w-full max-w-sm relative z-10">
          <Link to="/" className="flex justify-center mb-8">
            <Logo size={36} />
          </Link>
          <div className="glass-card p-8">
            <h1 className="text-2xl font-bold text-foreground mb-1">Start your free trial</h1>
            <p className="text-sm text-muted-foreground mb-6">Create your ReviewBoost account</p>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required className="bg-secondary/50 border-border/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="bg-secondary/50 border-border/50" />
              </div>
              <Button variant="hero" className="btn-press w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">Log in</Link>
            </p>
          </div>
        </div>
      </PageTransition>
    </div>
  );
}
