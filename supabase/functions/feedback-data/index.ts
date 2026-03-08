import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { customerId, action, message, reviewed } = body;

    if (!customerId) {
      return new Response(JSON.stringify({ error: "Missing customerId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Stop the email sequence (customer engaged)
    if (action === "stop-sequence") {
      await supabase
        .from("customers")
        .update({ sequence_stopped: true, clicked: true })
        .eq("id", customerId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Save review completion status
    if (action === "reviewed") {
      await supabase
        .from("customers")
        .update({ reviewed: reviewed === true, sequence_stopped: true })
        .eq("id", customerId);

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Submit feedback
    if (action === "submit") {
      const { data: customer } = await supabase
        .from("customers")
        .select("user_id, name, email")
        .eq("id", customerId)
        .single();

      if (!customer) {
        return new Response(JSON.stringify({ error: "Customer not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("feedback").insert({
        customer_id: customerId,
        user_id: customer.user_id,
        message: (message || "").substring(0, 1000),
        customer_name: customer.name,
        customer_email: customer.email,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch customer + business data (default action)
    const { data: customer } = await supabase
      .from("customers")
      .select("user_id, name, email")
      .eq("id", customerId)
      .single();

    if (!customer) {
      return new Response(JSON.stringify({ error: "Customer not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, review_url, direct_review_url, logo_url")
      .eq("id", customer.user_id)
      .single();

    const reviewUrl = profile?.direct_review_url || profile?.review_url || "";

    return new Response(
      JSON.stringify({
        customer: { user_id: customer.user_id, name: customer.name, email: customer.email },
        businessName: profile?.business_name || "our business",
        logoUrl: profile?.logo_url || null,
        reviewUrl,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("feedback-data error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
