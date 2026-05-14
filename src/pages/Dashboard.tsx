import { useState, useEffect, useRef, useCallback } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PageTransition } from "@/components/PageTransition";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { CustomerTable } from "@/components/dashboard/CustomerTable";
import { FeedbackInbox } from "@/components/dashboard/FeedbackInbox";
import { AddCustomerDialog } from "@/components/dashboard/AddCustomerDialog";
import { DashboardEmptyState } from "@/components/dashboard/DashboardEmptyState";
import { DashboardIntro } from "@/components/DashboardIntro";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { UpgradeModal } from "@/components/UpgradeModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePlan } from "@/hooks/usePlan";
import { PlanType } from "@/lib/plans";
import { usePageTitle } from "@/hooks/usePageTitle";
import { canSendRequest } from "@/lib/plans";
import confetti from "canvas-confetti";

interface Customer {
  id: string;
  name: string;
  email: string;
  sent_at: string | null;
  opened: boolean;
  clicked: boolean;
  sequence_step?: number;
  sequence_stopped?: boolean;
  next_send_at?: string | null;
}

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [userName, setUserName] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState("");
  const [upgradePlan, setUpgradePlan] = useState<PlanType>("pro");
  const [activeTab, setActiveTab] = useState("customers");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { plan, config } = usePlan();
  usePageTitle("Dashboard");

  const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const monthlySentCount = customers.filter(c => c.sent_at && c.sent_at >= currentMonthStart).length;

  const fetchCustomers = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const userId = session.user.id;
    const { data: profile } = await supabase.from("profiles").select("business_name").eq("id", userId).single();
    if (profile?.business_name) setUserName(profile.business_name);
    const { data, error } = await supabase.from("customers").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) return;
    if (data) setCustomers(data as Customer[]);
    setTableLoading(false);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) fetchCustomers();
    });
    fetchCustomers();
    const interval = setInterval(fetchCustomers, 30_000);
    return () => { subscription.unsubscribe(); clearInterval(interval); };
  }, [fetchCustomers]);

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check plan gating first
    if (!config.hasCsvImport) {
      setUpgradeFeature("CSV bulk upload");
      setUpgradePlan("pro");
      setUpgradeOpen(true);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const text = await file.text();
    const lines = text.trim().split("\n");
    const header = lines[0].toLowerCase().replace(/['"\r]/g, '');
    const headers = header.split(",").map(h => h.trim());
    const nameIdx = headers.findIndex(h => h === "name" || h === "first name" || h === "firstname");
    const emailIdx = headers.findIndex(h => h === "email" || h === "email address");

    if (nameIdx === -1 || emailIdx === -1) {
      toast({ title: "Invalid CSV", description: "CSV must have 'name' and 'email' columns", variant: "destructive" });
      setLoading(false);
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const rows = lines.slice(1).map(line => {
      const cleanLine = line.replace(/['"\r]/g, '');
      const cols = cleanLine.split(",");
      return { user_id: user.id, name: cols[nameIdx]?.trim(), email: cols[emailIdx]?.trim() };
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

  const handleAddCustomer = async () => {
    if (!newName.trim() || !newEmail.trim()) {
      toast({ title: "Missing fields", description: "Name and email are required.", variant: "destructive" });
      return;
    }
    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setAdding(false); return; }
    const { data: inserted, error } = await supabase.from("customers").insert({ user_id: user.id, name: newName.trim(), email: newEmail.trim() }).select().single();
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setAdding(false);
      return;
    }
    toast({ title: "Customer added!" });
    setNewName(""); setNewEmail(""); setAddOpen(false);
    fetchCustomers();

    if (inserted) {
      const { data: profile } = await supabase.from("profiles").select("auto_send_enabled").eq("id", user.id).single();
      if ((profile as any)?.auto_send_enabled) {
        if (!canSendRequest(plan, monthlySentCount, 1)) {
           toast({ title: "Monthly limit reached", description: `You have reached your limit of ${config.maxRequestsPerMonth} review requests this month.`, variant: "destructive" });
        } else {
          // Starter plan: single email only, no sequence
          if (!config.hasSequence) {
            toast({ title: "ℹ️ Sequences require Pro plan", description: "A single email will be sent instead." });
          }
          try {
            await supabase.functions.invoke("send-review-requests", {
              body: { customerIds: [inserted.id], singleEmailOnly: !config.hasSequence, scheduledFor: scheduledFor ? new Date(scheduledFor).toISOString() : null },
            });
            toast({ title: config.hasSequence ? `✅ 3-email sequence started for ${newName.trim()}` : `✅ Email sent to ${newName.trim()}` });
            setScheduledFor("");
            fetchCustomers();
          } catch (err: any) {
            console.error("Auto-send error:", err);
          }
        }
      }
    }
    setAdding(false);
  };

  const handleSendRequests = async () => {
    const unsent = customers.filter(c => !c.sent_at);
    if (unsent.length === 0) {
      toast({ title: "No unsent customers", description: "All customers already have requests sent." });
      return;
    }

    if (!canSendRequest(plan, monthlySentCount, unsent.length)) {
      setUpgradeFeature(`Sending ${unsent.length} more requests (Limit: ${config.maxRequestsPerMonth}/mo)`);
      setUpgradePlan(plan === 'free' ? 'starter' : plan === 'starter' ? 'pro' : 'agency');
      setUpgradeOpen(true);
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-review-requests", {
        body: { customerIds: unsent.map(c => c.id), singleEmailOnly: !config.hasSequence },
      });
      if (error) throw error;
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#7c3aed', '#a855f7', '#c084fc'] });
      toast({ title: `${unsent.length} review requests sent! 🎉` });
      fetchCustomers();
    } catch (err: any) {
      toast({ title: "Error sending", description: err.message, variant: "destructive" });
    }
    setSending(false);
  };

  const handleDeleteCustomer = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("customers").delete().eq("id", id).eq("user_id", user.id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Customer deleted" });
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleCancelSchedule = async (id: string) => {
    const { error } = await supabase.from("customers").update({ next_send_at: null, sequence_step: 0 }).eq("id", id);
    if (!error) {
      toast({ title: "Schedule cancelled", description: "Customer reset to pending status." });
      fetchCustomers();
    }
  };

  const totalSent = customers.filter(c => c.sent_at).length;
  const totalOpened = customers.filter(c => c.opened).length;
  const totalClicked = customers.filter(c => c.clicked).length;
  const reviewsSubmitted = customers.filter(c => (c as any).reviewed).length;
  const activeSequences = customers.filter(c => (c.sequence_step || 0) > 0 && (c.sequence_step || 0) < 3 && !c.sequence_stopped).length;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 1000) / 10 : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 1000) / 10 : 0;

  const handleIntroComplete = useCallback(() => { setShowIntro(false); }, []);

  const handleTabChange = (val: string) => {
    if (val === "feedback" && !config.hasFeedback) {
      setUpgradeFeature("Private feedback inbox");
      setUpgradePlan("pro");
      setUpgradeOpen(true);
      return;
    }
    setActiveTab(val);
  };

  // Monthly requests limit warning
  const atLimit = config.maxRequestsPerMonth !== null && monthlySentCount >= config.maxRequestsPerMonth;

  return (
    <>
      {showIntro && <DashboardIntro onComplete={handleIntroComplete} userName={userName} />}
      <DashboardLayout>
        <PageTransition>
          <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
            {plan === "free" && (
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-foreground">
                  You are on the <strong>Free</strong> plan. Upgrade to send more reviews!
                </p>
                <div onClick={() => {
                  setUpgradeFeature("Sending more reviews");
                  setUpgradePlan("starter");
                  setUpgradeOpen(true);
                }} className="bg-primary text-primary-foreground text-sm px-4 py-2 rounded-lg font-semibold hover:opacity-90 transition cursor-pointer whitespace-nowrap">
                  Upgrade &rarr;
                </div>
              </div>
            )}
            <div className="flex justify-end mb-2">
              <button onClick={async () => {
                const { error } = await supabase.functions.invoke("process-sequence");
                if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
                else { toast({ title: "Sequence processed!" }); fetchCustomers(); }
              }} className="bg-emerald-500/20 text-emerald-500 text-xs px-3 py-1.5 rounded-md font-bold hover:bg-emerald-500/30">
                [DEV] Run Email Scheduler
              </button>
            </div>

            {config.maxRequestsPerMonth !== null && (
              <div className="bg-secondary/30 border border-border/30 rounded-xl p-4 flex justify-between items-center">
                <span className="text-sm text-muted-foreground font-medium">Monthly Send Usage</span>
                <span className="text-sm font-bold text-foreground">
                  {monthlySentCount} / {config.maxRequestsPerMonth} requests sent
                </span>
              </div>
            )}

            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />

            <DashboardHeader
              onUploadClick={() => fileRef.current?.click()}
              onAddClick={() => {
                setAddOpen(true);
              }}
              onSendClick={handleSendRequests}
              loading={loading}
              sending={sending}
            />

            {!tableLoading && customers.length === 0 ? (
              <DashboardEmptyState onAddClick={() => setAddOpen(true)} />
            ) : (
              <>
                <StatsGrid
                  totalSent={totalSent}
                  openRate={openRate}
                  clickRate={clickRate}
                  customersCount={customers.length}
                  reviewsSubmitted={reviewsSubmitted}
                  activeSequences={activeSequences}
                />

                {config.hasAiInsights && (
                  <InsightCard reviewsSubmitted={reviewsSubmitted} monthlyGoal={100} />
                )}

                <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                  <TabsList className="bg-secondary/50 border border-border/20 w-full sm:w-auto">
                    <TabsTrigger value="customers" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex-1 sm:flex-none">
                      Customers
                      {atLimit && (
                        <span className="ml-2 text-[10px] font-semibold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full">
                          {monthlySentCount}/{config.maxRequestsPerMonth}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="feedback" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary flex-1 sm:flex-none">
                      Feedback
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="customers" className="mt-4">
                    <CustomerTable customers={customers} isLoading={tableLoading} onDelete={handleDeleteCustomer} onCancelSchedule={handleCancelSchedule} />
                  </TabsContent>
                  <TabsContent value="feedback" className="mt-4">
                    <FeedbackInbox />
                  </TabsContent>
                </Tabs>

                {!config.hasFeedback && (
                  <UpgradePrompt
                    title="Unlock Private Feedback"
                    description="Upgrade to Pro to capture negative feedback privately before it becomes a public review."
                    targetPlan="pro"
                  />
                )}
              </>
            )}

            <UpgradeModal
              open={upgradeOpen}
              onOpenChange={setUpgradeOpen}
              featureName={upgradeFeature}
              requiredPlan={upgradePlan}
            />


            <AddCustomerDialog
              open={addOpen}
              onOpenChange={setAddOpen}
              name={newName}
              email={newEmail}
              scheduledFor={scheduledFor}
              onNameChange={setNewName}
              onEmailChange={setNewEmail}
              onScheduledForChange={setScheduledFor}
              onSubmit={handleAddCustomer}
              adding={adding}
            />
          </div>
        </PageTransition>
      </DashboardLayout>
    </>
  );
}
