import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SEQUENCE_PROMPTS: Record<number, string> = {
  1: `Write ONE short friendly sentence (max 20 words) thanking CUSTOMER_NAME for visiting BUSINESS_NAME and asking them to share their experience. Warm first-time tone. Output ONLY that one sentence.`,
  2: `Write ONE short gentle follow-up sentence (max 20 words) reminding CUSTOMER_NAME about their visit to BUSINESS_NAME and asking if they'd take a moment to leave a review. Output ONLY that one sentence.`,
  3: `Write ONE short final friendly nudge sentence (max 20 words) for CUSTOMER_NAME about BUSINESS_NAME, mentioning this is a last reminder to share their experience. Output ONLY that one sentence.`,
};

const SEQUENCE_SUBJECTS: Record<number, (name: string, biz: string) => string> = {
  1: (name) => `${name}, how was your visit?`,
  2: (name, biz) => `Still thinking about ${biz}?`,
  3: (name) => `Last chance to share your experience, ${name}`,
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
    const { customerIds, sequenceStep, scheduledFor } = await req.json();
    const step = sequenceStep || 1;

    if (!customerIds?.length) {
      return new Response(JSON.stringify({ error: "No customer IDs provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const PLAN_LIMITS: Record<string, number | null> = {
      free: 3,
      starter: 50,
      pro: 500,
      agency: null
    };

    const { data: profile } = await supabase
      .from("profiles")
      .select("business_name, review_url, direct_review_url, plan")
      .eq("id", userId)
      .single();

    if (!profile?.review_url) {
      return new Response(JSON.stringify({ error: "Please set your Google Review URL in Settings first" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPlan = "agency"; // profile.plan || "free"; // DEV BYPASS
    const maxRequests = PLAN_LIMITS[userPlan];

    if (maxRequests !== null) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      
      const { count, error: countError } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("sent_at", startOfMonth);
        
      if (countError) throw countError;
      
      const currentSends = count || 0;
      if (currentSends + customerIds.length > maxRequests) {
        return new Response(JSON.stringify({ error: `Monthly limit reached. Your ${userPlan} plan allows ${maxRequests} review requests per month. You have already sent ${currentSends}.` }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const businessName = profile.business_name || "our business";
    const reviewUrl = profile.direct_review_url || profile.review_url;
    console.log("Review URL:", reviewUrl);
    const trackOpenUrl = `${SUPABASE_URL}/functions/v1/track-open`;

    const results = [];

    for (const customer of customers) {
      console.log(`[Seq ${step}] Processing: ${customer.name} (${customer.email})`);

      // Handle Scheduling (sequenceStep 1 is standard immediate unless scheduledFor is provided)
      let sendImmediately = true;
      let nextSendAt: string | null = null;
      let nextStep = step;

      if (scheduledFor) {
        const scheduleTime = new Date(scheduledFor).getTime();
        const nowTime = new Date().getTime();
        if (scheduleTime > nowTime) {
          sendImmediately = false;
          nextSendAt = scheduledFor;
          nextStep = 0; // 0 means scheduled to send first email
        }
      }

      if (!sendImmediately) {
        // Just record the schedule in the database and skip sending
        await supabase
          .from("customers")
          .update({
            sequence_step: nextStep,
            next_send_at: nextSendAt,
            sequence_stopped: false,
          } as any)
          .eq("id", customer.id);

        results.push({ id: customer.id, success: true, status: "scheduled" });
        continue;
      }

      const promptTemplate = SEQUENCE_PROMPTS[step] || SEQUENCE_PROMPTS[1];
      const prompt = promptTemplate
        .replace("CUSTOMER_NAME", customer.name)
        .replace("BUSINESS_NAME", businessName);

      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          max_tokens: 100,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!aiResponse.ok) {
        const errorBody = await aiResponse.text();
        console.error("AI gateway error:", aiResponse.status, errorBody);
        throw new Error(`AI gateway error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const personalizedLine = aiData.choices?.[0]?.message?.content?.trim() || `We'd love to hear about your experience at ${businessName}.`;

      const linkUrl = reviewUrl;

      const subjectFn = SEQUENCE_SUBJECTS[step] || SEQUENCE_SUBJECTS[1];
      const subject = subjectFn(customer.name, businessName);

      const plainTextBody = `Hi ${customer.name},

Thank you for visiting ${businessName}!

${personalizedLine}
It only takes 30 seconds:

${linkUrl}

Thanks,
${businessName} team`;

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
            subject,
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
        console.log(`[Seq ${step}] Email sent to ${customer.email}`);

        // Update sequence tracking
        const nextStep = step;
        let nextSendAt: string | null = null;

        if (nextStep === 1) {
          // Schedule email 2 for 3 days later
          const d = new Date();
          d.setDate(d.getDate() + 3);
          nextSendAt = d.toISOString();
        } else if (nextStep === 2) {
          // Schedule email 3 for 4 more days (7 days total)
          const d = new Date();
          d.setDate(d.getDate() + 4);
          nextSendAt = d.toISOString();
        }
        // Step 3: no next send

        await supabase
          .from("customers")
          .update({
            sent_at: new Date().toISOString(),
            sequence_step: nextStep,
            next_send_at: nextSendAt,
            sequence_stopped: nextStep >= 3,
          } as any)
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
