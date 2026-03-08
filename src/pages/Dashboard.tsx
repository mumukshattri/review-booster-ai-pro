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
import { DashboardIntro } from "@/components/DashboardIntro";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [tableLoading, setTableLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [userName, setUserName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchCustomers = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      console.log("[Stats Debug] No authenticated session found, skipping fetch");
      return;
    }
    const userId = session.user.id;
    // Get user's business name for the intro
    const { data: profile } = await supabase.from("profiles").select("business_name").eq("id", userId).single();
    if (profile?.business_name) setUserName(profile.business_name);
    const { data, error } = await supabase.from("customers").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (error) {
      console.error("[Stats Debug] Fetch error:", error.message);
      return;
    }
    if (data) {
      const customers = data as Customer[];
      const totalSent = customers.filter(c => c.sent_at).length;
      const totalOpened = customers.filter(c => c.opened).length;
      const totalClicked = customers.filter(c => c.clicked).length;
      console.log("[Stats Debug] Raw counts:", {
        totalCustomers: customers.length,
        totalSent,
        totalOpened,
        totalClicked,
        openRate: totalSent > 0 ? ((totalOpened / totalSent) * 100).toFixed(1) : 0,
        clickRate: totalSent > 0 ? ((totalClicked / totalSent) * 100).toFixed(1) : 0,
      });
      setCustomers(customers);
    }
    setTableLoading(false);
  }, []);

  // Fetch on mount once auth is ready, and poll every 30s
  useEffect(() => {
    // Wait for auth to be ready before first fetch
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchCustomers();
      }
    });

    // Also try immediately in case session is already available
    fetchCustomers();

    // Poll every 30 seconds
    const interval = setInterval(fetchCustomers, 30_000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [fetchCustomers]);

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

    // Auto-send if enabled
    if (inserted) {
      const { data: profile } = await supabase.from("profiles").select("auto_send_enabled").eq("id", user.id).single();
      if ((profile as any)?.auto_send_enabled) {
        try {
          await supabase.functions.invoke("send-review-requests", {
            body: { customerIds: [inserted.id] },
          });
          toast({ title: "Review request auto-sent! 📧" });
          fetchCustomers();
        } catch (err: any) {
          console.error("Auto-send error:", err);
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
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke("send-review-requests", {
        body: { customerIds: unsent.map(c => c.id) },
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
    const { error } = await supabase.from("customers").delete().eq("id", id);
    if (error) {
      toast({ title: "Error deleting", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Customer deleted" });
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const totalSent = customers.filter(c => c.sent_at).length;
  const totalOpened = customers.filter(c => c.opened).length;
  const totalClicked = customers.filter(c => c.clicked).length;
  const reviewsSubmitted = customers.filter(c => (c as any).reviewed).length;
  const openRate = totalSent > 0 ? Math.round((totalOpened / totalSent) * 1000) / 10 : 0;
  const clickRate = totalSent > 0 ? Math.round((totalClicked / totalSent) * 1000) / 10 : 0;

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
  }, []);

  return (
    <>
      {showIntro && <DashboardIntro onComplete={handleIntroComplete} userName={userName} />}
      <DashboardLayout>
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />

          <DashboardHeader
            onUploadClick={() => fileRef.current?.click()}
            onAddClick={() => setAddOpen(true)}
            onSendClick={handleSendRequests}
            loading={loading}
            sending={sending}
          />

          <StatsGrid
            totalSent={totalSent}
            openRate={openRate}
            clickRate={clickRate}
            customersCount={customers.length}
            reviewsSubmitted={reviewsSubmitted}
          />

          <InsightCard reviewsSubmitted={reviewsSubmitted} monthlyGoal={100} />

          <Tabs defaultValue="customers" className="w-full">
            <TabsList className="bg-secondary/50 border border-border/20">
              <TabsTrigger value="customers" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Customers</TabsTrigger>
              <TabsTrigger value="feedback" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">Feedback</TabsTrigger>
            </TabsList>
            <TabsContent value="customers" className="mt-4">
              <CustomerTable customers={customers} isLoading={tableLoading} onDelete={handleDeleteCustomer} />
            </TabsContent>
            <TabsContent value="feedback" className="mt-4">
              <FeedbackInbox />
            </TabsContent>
          </Tabs>

          <AddCustomerDialog
            open={addOpen}
            onOpenChange={setAddOpen}
            name={newName}
            email={newEmail}
            onNameChange={setNewName}
            onEmailChange={setNewEmail}
            onSubmit={handleAddCustomer}
            adding={adding}
          />
        </div>
      </PageTransition>
      </DashboardLayout>
    </>
  );
}
