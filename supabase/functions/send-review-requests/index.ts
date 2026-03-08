import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
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
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    const { customerIds } = await req.json();
    if (!customerIds?.length) {
      return new Response(JSON.stringify({ error: "No customer IDs provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user profile for business info
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, review_url")
      .eq("id", userId)
      .single();

    if (!profile?.review_url) {
      return new Response(JSON.stringify({ error: "Please set your Google Review URL in Settings first" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get customers
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const businessName = profile.business_name || "our business";

    const results = [];

    for (const customer of customers) {
      // Generate personalized message via Lovable AI
      let personalizedMessage = "";
      try {
        const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You write short, warm, human-sounding email bodies asking customers to leave a Google review. Output ONLY the email body text (no subject, no greeting, no signature). Keep it under 3 sentences. Be genuine and grateful. The business is "${businessName}". The customer's name is provided.`,
              },
              {
                role: "user",
                content: `Write a review request email body for ${customer.name}.`,
              },
            ],
          }),
        });

        if (aiResp.ok) {
          const aiData = await aiResp.json();
          personalizedMessage = aiData.choices?.[0]?.message?.content?.trim() || "";
        }
      } catch {
        // Fallback if AI fails
      }

      if (!personalizedMessage) {
        personalizedMessage = `Hi ${customer.name}, thank you for choosing ${businessName}! We'd love to hear about your experience. Your feedback helps us improve and helps others discover us.`;
      }

      // Build tracking URLs
      const trackOpenUrl = `${SUPABASE_URL}/functions/v1/track-open?cid=${customer.id}`;
      const trackClickUrl = `${SUPABASE_URL}/functions/v1/track-click?cid=${customer.id}&url=${encodeURIComponent(profile.review_url)}`;

      const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
    <div style="text-align:center;margin-bottom:32px;">
      <div style="display:inline-block;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#7c3aed,#a855f7);line-height:48px;font-size:20px;color:#fff;">★</div>
    </div>
    <h1 style="font-size:22px;font-weight:700;color:#1a1a1a;text-align:center;margin:0 0 8px;">How was your experience?</h1>
    <p style="font-size:15px;color:#555;line-height:1.6;text-align:center;margin:0 0 24px;">${personalizedMessage}</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${trackClickUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#7c3aed,#a855f7);color:#ffffff;text-decoration:none;border-radius:10px;font-weight:600;font-size:15px;">Leave a Review ⭐</a>
    </div>
    <p style="font-size:12px;color:#999;text-align:center;margin-top:40px;">
      You received this because you're a valued customer of ${businessName}.
    </p>
  </div>
  <img src="${trackOpenUrl}" width="1" height="1" style="display:none;" alt="" />
</body>
</html>`;

      // Send via Resend
      try {
        const sendResp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${businessName} <onboarding@resend.dev>`,
            to: [customer.email],
            subject: `${customer.name}, we'd love your feedback!`,
            html: emailHtml,
          }),
        });

        if (!sendResp.ok) {
          const errText = await sendResp.text();
          console.error(`Resend error for ${customer.email}:`, errText);
          results.push({ id: customer.id, success: false, error: errText });
          continue;
        }
        await sendResp.text();

        // Mark as sent
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
