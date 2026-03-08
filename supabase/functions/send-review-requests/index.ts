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
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const businessName = profile.business_name || "our business";
    const reviewUrl = profile.direct_review_url || profile.review_url;

    // Open tracking pixel URL
    const trackOpenUrl = `${SUPABASE_URL}/functions/v1/track-open`;

    const results = [];

    for (const customer of customers) {
      console.log(`Processing email for: ${customer.name} (${customer.email})`);

      // Use Claude to personalize just the middle paragraph
      const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5",
          max_tokens: 100,
          messages: [
            {
              role: "user",
              content: `Write ONE short friendly sentence (max 20 words) thanking ${customer.name} for visiting ${businessName} and asking them to share their experience. Output ONLY that one sentence, nothing else. No greeting, no signature, no link.`,
            },
          ],
        }),
      });

      if (!anthropicResponse.ok) {
        const errorBody = await anthropicResponse.text();
        console.error("Anthropic API error:", anthropicResponse.status, errorBody);
        throw new Error(`Anthropic API error: ${anthropicResponse.status}`);
      }

      const aiData = await anthropicResponse.json();
      const personalizedLine = aiData.content?.[0]?.text?.trim() || `We'd love to hear about your experience at ${businessName}.`;

      // Plain text email body
      const plainTextBody = `Hi ${customer.name},

Thank you for visiting ${businessName}!

${personalizedLine}
It only takes 30 seconds:

${reviewUrl}

Thanks,
${businessName} team`;

      // Minimal HTML wrapper: plain text look + invisible open tracking pixel
      const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;font-family:sans-serif;font-size:14px;color:#222;">
<pre style="white-space:pre-wrap;font-family:inherit;font-size:inherit;margin:0;">${plainTextBody}</pre>
<img src="${trackOpenUrl}?cid=${customer.id}" width="1" height="1" style="display:none;" alt="" />
</body></html>`;

      try {
        const sendResp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${businessName} <reviews@nextarcstore.in>`,
            to: [customer.email],
            subject: `${customer.name}, how was your visit?`,
            html: htmlBody,
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
        console.log(`Email sent to ${customer.email}`);

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
