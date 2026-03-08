import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find customers due for next email
    const now = new Date().toISOString();
    const { data: dueCustomers, error } = await supabase
      .from("customers")
      .select("id, user_id, sequence_step")
      .eq("sequence_stopped", false)
      .lt("next_send_at", now)
      .gt("sequence_step", 0)
      .lt("sequence_step", 3);

    if (error) {
      console.error("Query error:", error);
      throw error;
    }

    if (!dueCustomers?.length) {
      console.log("No customers due for sequence emails");
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Found ${dueCustomers.length} customers due for sequence emails`);

    // Group by user_id so we can send with proper auth context
    const byUser: Record<string, { ids: string[]; step: number }[]> = {};
    for (const c of dueCustomers) {
      if (!byUser[c.user_id]) byUser[c.user_id] = [];
      const nextStep = c.sequence_step + 1;
      byUser[c.user_id].push({ ids: [c.id], step: nextStep });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!RESEND_API_KEY || !ANTHROPIC_API_KEY) {
      throw new Error("Missing RESEND_API_KEY or ANTHROPIC_API_KEY");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const trackOpenUrl = `${SUPABASE_URL}/functions/v1/track-open`;
    const appUrl = Deno.env.get("APP_URL") || "https://id-preview--d23d881d-4508-446b-a2fe-10f9fb977280.lovable.app";

    const SEQUENCE_PROMPTS: Record<number, string> = {
      2: `Write ONE short gentle follow-up sentence (max 20 words) reminding CUSTOMER_NAME about their visit to BUSINESS_NAME and asking if they'd take a moment to leave a review. Output ONLY that one sentence.`,
      3: `Write ONE short final friendly nudge sentence (max 20 words) for CUSTOMER_NAME about BUSINESS_NAME, mentioning this is a last reminder to share their experience. Output ONLY that one sentence.`,
    };

    const SEQUENCE_SUBJECTS: Record<number, (name: string, biz: string) => string> = {
      2: (_name, biz) => `Still thinking about ${biz}?`,
      3: (name) => `Last chance to share your experience, ${name}`,
    };

    let totalProcessed = 0;

    for (const [userId, entries] of Object.entries(byUser)) {
      // Get profile for this user
      const { data: profile } = await supabase
        .from("profiles")
        .select("business_name, review_url, direct_review_url")
        .eq("id", userId)
        .single();

      if (!profile?.review_url) continue;

      const businessName = profile.business_name || "our business";
      const reviewUrl = profile.direct_review_url || profile.review_url;

      for (const entry of entries) {
        const step = entry.step;
        for (const customerId of entry.ids) {
          // Get customer
          const { data: customer } = await supabase
            .from("customers")
            .select("*")
            .eq("id", customerId)
            .single();

          if (!customer) continue;

          // Check if stopped (in case it changed)
          if ((customer as any).sequence_stopped) continue;

          const promptTemplate = SEQUENCE_PROMPTS[step];
          if (!promptTemplate) continue;

          const prompt = promptTemplate
            .replace("CUSTOMER_NAME", customer.name)
            .replace("BUSINESS_NAME", businessName);

          try {
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
                messages: [{ role: "user", content: prompt }],
              }),
            });

            if (!anthropicResponse.ok) {
              console.error(`Anthropic error for ${customer.email}:`, await anthropicResponse.text());
              continue;
            }

            const aiData = await anthropicResponse.json();
            const personalizedLine = aiData.content?.[0]?.text?.trim() || `We'd love to hear about your experience at ${businessName}.`;

            const feedbackPageUrl = `${appUrl}/feedback/${customer.id}`;
            const subjectFn = SEQUENCE_SUBJECTS[step];
            const subject = subjectFn ? subjectFn(customer.name, businessName) : `${customer.name}, we'd love your feedback`;

            const plainTextBody = `Hi ${customer.name},

${personalizedLine}
It only takes 30 seconds:

${feedbackPageUrl}

Thanks,
${businessName} team`;

            const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;font-family:sans-serif;font-size:14px;color:#222;">
<pre style="white-space:pre-wrap;font-family:inherit;font-size:inherit;margin:0;">${plainTextBody}</pre>
<img src="${trackOpenUrl}?cid=${customer.id}" width="1" height="1" style="display:none;" alt="" />
</body></html>`;

            const sendResp = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: `${businessName} <reviews@nextarcstore.in>`,
                to: [customer.email],
                subject,
                html: htmlBody,
                text: plainTextBody,
              }),
            });

            if (!sendResp.ok) {
              console.error(`Resend error for ${customer.email}:`, await sendResp.text());
              continue;
            }

            console.log(`[Seq ${step}] Sent to ${customer.email}`);

            // Update sequence tracking
            let nextSendAt: string | null = null;
            if (step === 2) {
              const d = new Date();
              d.setDate(d.getDate() + 4);
              nextSendAt = d.toISOString();
            }

            await supabase
              .from("customers")
              .update({
                sequence_step: step,
                next_send_at: nextSendAt,
                sequence_stopped: step >= 3,
              })
              .eq("id", customerId);

            totalProcessed++;
          } catch (err) {
            console.error(`Error processing ${customer.email}:`, err);
          }
        }
      }
    }

    console.log(`Processed ${totalProcessed} sequence emails`);
    return new Response(
      JSON.stringify({ processed: totalProcessed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-sequence error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
