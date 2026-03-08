import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Upload, Send, Users, Mail, MousePointerClick, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
      toast({ title: `${unsent.length} review requests sent!` });
      fetchCustomers();
    } catch (err: any) {
      toast({ title: "Error sending", description: err.message, variant: "destructive" });
    }
    setSending(false);
  };

  const totalSent = customers.filter(c => c.sent_at).length;
  const totalOpened = customers.filter(c => c.opened).length;
  const totalClicked = customers.filter(c => c.clicked).length;

  const stats = [
    { label: "Total Sent", value: totalSent, icon: Mail, color: "text-primary" },
    { label: "Opened", value: totalOpened, icon: Eye, color: "text-emerald-400" },
    { label: "Clicked", value: totalClicked, icon: MousePointerClick, color: "text-amber-400" },
    { label: "Customers", value: customers.length, icon: Users, color: "text-sky-400" },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground text-sm">Manage review requests for your customers</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <s.icon className={`h-5 w-5 ${s.color}`} />
                <span className="text-sm text-muted-foreground">{s.label}</span>
              </div>
              <div className="text-3xl font-bold text-foreground">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <div>
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
            <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={loading}>
              <Upload className="mr-2 h-4 w-4" />
              {loading ? "Uploading..." : "Upload CSV"}
            </Button>
          </div>
          <Button variant="hero" onClick={handleSendRequests} disabled={sending}>
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send Review Requests"}
          </Button>
        </div>

        {/* Customer Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Name</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Email</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Opened</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider p-4">Clicked</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      No customers yet. Upload a CSV to get started.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                      <td className="p-4 text-sm text-foreground">{c.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{c.email}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.sent_at ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {c.sent_at ? "Sent" : "Pending"}
                        </span>
                      </td>
                      <td className="p-4 text-sm">{c.opened ? "✓" : "—"}</td>
                      <td className="p-4 text-sm">{c.clicked ? "✓" : "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
