import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const event = body.meta?.event_name;

    if (event !== "order_created" && event !== "subscription_created" && event !== "subscription_updated") {
      return new Response(JSON.stringify({ ok: true, skipped: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const attrs = body.data?.attributes;
    const email = attrs?.user_email;
    const variantId = attrs?.first_order_item?.variant_id || attrs?.variant_id;

    if (!email) {
      return new Response(JSON.stringify({ error: "No email in payload" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Map Lemon Squeezy variant IDs to plans
    // TODO: Replace these with your actual Lemon Squeezy variant IDs
    const VARIANT_TO_PLAN: Record<string, string> = {
      // "variant_1_id": "starter",
      // "variant_2_id": "pro",
      // "variant_3_id": "agency",
    };

    let plan = VARIANT_TO_PLAN[String(variantId)];
    
    // Fallback: detect by product name
    if (!plan) {
      const productName = (attrs?.product_name || attrs?.first_order_item?.product_name || "").toLowerCase();
      if (productName.includes("agency")) plan = "agency";
      else if (productName.includes("pro")) plan = "pro";
      else if (productName.includes("starter")) plan = "starter";
    }

    if (!plan) {
      return new Response(JSON.stringify({ error: "Unknown variant", variantId }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find user by email
    const { data: users } = await supabase.auth.admin.listUsers();
    const user = users?.users?.find((u: any) => u.email === email);

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found", email }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Update plan and subscription status
    const subscriptionStatus = (event === "subscription_updated" && attrs?.status === "cancelled") ? "cancelled" : "active";
    
    const { error } = await supabase
      .from("profiles")
      .update({ plan, subscription_status: subscriptionStatus } as any)
      .eq("id", user.id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true, plan, email }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
