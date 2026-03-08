import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Upload, Send, Users, Mail, MousePointerClick, Eye, Target, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/CountUp";
import { PageTransition } from "@/components/PageTransition";
import confetti from "canvas-confetti";

interface Customer {
  id: string;
  name: string;
  email: string;
  sent_at: string | null;
  opened: boolean;
  clicked: boolean;
}

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const reducedMotion = useReducedMotion();

  const dur = reducedMotion ? 0.01 : 0.25;
  const ease = [0.33, 1, 0.68, 1] as [number, number, number, number];

  const fetchCustomers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("customers").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (data) setCustomers(data as Customer[]);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);

    const text = await file.text();
    const lines = text.trim().split("\n");
    const header = lines[0].toLowerCase();
    const nameIdx = header.split(",").findIndex(h => h.trim() === "name");
    const emailIdx = header.split(",").findIndex(h => h.trim() === "email");

    if (nameIdx === -1 || emailIdx === -1) {
      toast({ title: "Invalid CSV", description: "CSV must have 'name' and 'email' columns", variant: "destructive" });
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const rows = lines.slice(1).map(line => {
      const cols = line.split(",");
      return {
        user_id: user.id,
        name: cols[nameIdx]?.trim(),
        email: cols[emailIdx]?.trim(),
      };
    }).filter(r => r.name && r.email);

    const { error } = await supabase.from("customers").insert(rows);
    setLoading(false);
    if (error) {
      toast({ title: "Upload error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `${rows.length} customers imported` });
      fetchCustomers();
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSendRequests = async () => {
    const unsent = customers.filter(c => !c.sent_at);
    if (unsent.length === 0) {
      toast({ title: "No unsent customers", description: "All customers already have requests sent." });
      return;
    }
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-review-requests", {
        body: { customerIds: unsent.map(c => c.id) },
      });
      if (error) throw error;

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#7c3aed', '#a855f7', '#c084fc'],
      });

      toast({ title: `${unsent.length} review requests sent! 🎉` });
      fetchCustomers();
    } catch (err: any) {
      toast({ title: "Error sending", description: err.message, variant: "destructive" });
    }
    setSending(false);
  };

  const totalSent = customers.filter(c => c.sent_at).length;
  const totalOpened = customers.filter(c => c.opened).length;
  const totalClicked = customers.filter(c => c.clicked).length;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0;
  const monthlyGoal = 100;
  const goalProgress = Math.min((totalSent / monthlyGoal) * 100, 100);

  const stats = [
    { label: "Total Sent", value: totalSent, icon: Mail, color: "text-primary", suffix: "" },
    { label: "Open Rate", value: openRate, icon: Eye, color: "text-emerald-400", suffix: "%" },
    { label: "Click Rate", value: clickRate, icon: MousePointerClick, color: "text-amber-400", suffix: "%" },
    { label: "Customers", value: customers.length, icon: Users, color: "text-sky-400", suffix: "" },
  ];

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Manage review requests for your customers</p>
          </div>

          {/* Stats — single column on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: dur, ease }}
                className="stat-card-hover p-4 sm:p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                    <s.icon className={`h-4 w-4 ${s.color}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-foreground">
                  <CountUp end={s.value} duration={1200} />{s.suffix}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Monthly Goal Progress */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: dur, ease }}
            className="glass-card p-4 sm:p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Monthly Review Goal</span>
              </div>
              <span className="text-sm text-muted-foreground">{totalSent}/{monthlyGoal}</span>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${goalProgress}%` }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full gradient-primary"
              />
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: dur, ease }}
            className="flex flex-col sm:flex-row flex-wrap gap-3"
          >
            <div>
              <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
              <Button variant="outline" className="btn-press bg-secondary/50 border-border/50 hover:bg-secondary w-full sm:w-auto min-h-[44px]" onClick={() => fileRef.current?.click()} disabled={loading}>
                <Upload className="mr-2 h-4 w-4" />
                {loading ? "Uploading..." : "Upload CSV"}
              </Button>
            </div>
            <Button variant="hero" className="btn-press min-h-[44px]" onClick={handleSendRequests} disabled={sending}>
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {sending ? "Sending..." : "Send Review Requests"}
            </Button>
          </motion.div>

          {/* Customer Table */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: dur, ease }}
            className="glass-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider p-3 sm:p-4">Name</th>
                    <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider p-3 sm:p-4">Email</th>
                    <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider p-3 sm:p-4">Status</th>
                    <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider p-3 sm:p-4">Opened</th>
                    <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider p-3 sm:p-4">Clicked</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-10 sm:p-12 text-center text-muted-foreground">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-8 w-8 text-muted-foreground/40" />
                          <p className="text-sm">No customers yet. Upload a CSV to get started.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id} className="border-b border-border/20 table-row-hover">
                        <td className="p-3 sm:p-4 text-sm text-foreground font-medium">{c.name}</td>
                        <td className="p-3 sm:p-4 text-sm text-muted-foreground">{c.email}</td>
                        <td className="p-3 sm:p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.sent_at ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}>
                            {c.sent_at ? "Sent" : "Pending"}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4 text-sm">{c.opened ? <span className="text-emerald-400">✓</span> : <span className="text-muted-foreground/40">—</span>}</td>
                        <td className="p-3 sm:p-4 text-sm">{c.clicked ? <span className="text-amber-400">✓</span> : <span className="text-muted-foreground/40">—</span>}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
