import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PlanType, PLANS, PlanConfig } from "@/lib/plans";

export function usePlan() {
  const [plan, setPlan] = useState<PlanType>("starter");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      if (data && (data as any).plan) {
        setPlan((data as any).plan as PlanType);
      }
      setLoading(false);
    };
    load();
  }, []);

  const config: PlanConfig = PLANS[plan];

  return { plan, config, loading };
}
