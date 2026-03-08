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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;
    const { customerIds } = await req.json();
    if (!customerIds?.length) {
      return new Response(JSON.stringify({ error: "No customer IDs provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, review_url, direct_review_url")
      .eq("id", userId)
      .single();

    if (!profile?.review_url) {
      return new Response(JSON.stringify({ error: "Please set your Google Review URL in Settings first" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: customers, error: custError } = await supabase
      .from("customers")
      .select("*")
      .in("id", customerIds)
      .eq("user_id", userId);

    if (custError || !customers?.length) {
      return new Response(JSON.stringify({ error: "No matching customers found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    console.log("Anthropic key exists:", !!ANTHROPIC_API_KEY);
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const businessName = profile.business_name || "our business";

    const results = [];

    for (const customer of customers) {
      console.log("Starting email send...");
      console.log(`Calling Anthropic API for customer: ${customer.name}`);

      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 150,
          messages: [
            {
              role: "user",
              content: `Write a short friendly review request for ${customer.name} who visited ${businessName}. Keep it under 3 sentences, warm and genuine. Output ONLY the email body text, no subject line, no greeting, no signature.`,
            },
          ],
        }),
      });

      if (!anthropicResponse.ok) {
        const errorBody = await anthropicResponse.text();
        console.error("Anthropic API error:", anthropicResponse.status, errorBody);
        throw new Error(`Anthropic API error: ${anthropicResponse.status} - ${errorBody}`);
      }

      const aiData = await anthropicResponse.json();
      console.log("Anthropic response:", JSON.stringify(aiData));
      const personalizedMessage = aiData.content?.[0]?.text?.trim();
      if (!personalizedMessage) {
        throw new Error("Anthropic returned empty message");
      }

      const emailReviewUrl = profile.direct_review_url || profile.review_url;
      const trackClickUrl = `${SUPABASE_URL}/functions/v1/track-click?cid=${customer.id}&url=${encodeURIComponent(emailReviewUrl)}`;

      const plainTextBody = `Hi ${customer.name},\n\nHope you enjoyed your visit to ${businessName}!\n\nWould you mind sharing your experience? It really helps us improve.\n\n${trackClickUrl}\n\nThanks,\n${businessName} team`;

      try {
        console.log("Sending email via Resend...");
        const sendResp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${businessName} <reviews@nextarcstore.in>`,
            to: [customer.email],
            subject: `${customer.name}, quick question about your visit`,
            text: plainTextBody,
          }),
        });

        if (!sendResp.ok) {
          const errText = await sendResp.text();
          console.error(`Resend error for ${customer.email}:`, errText);
          results.push({ id: customer.id, success: false, error: errText });
          continue;
        }
        await sendResp.text();
        console.log("Email sent successfully!");

        await supabase
          .from("customers")
          .update({ sent_at: new Date().toISOString() })
          .eq("id", customer.id);

        results.push({ id: customer.id, success: true });
      } catch (err) {
        console.error(`Send error for ${customer.email}:`, err);
        results.push({ id: customer.id, success: false, error: String(err) });
      }
    }

    const sent = results.filter((r) => r.success).length;
    return new Response(
      JSON.stringify({ sent, total: customers.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-review-requests error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
