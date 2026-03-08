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
    const { name, email } = await req.json();
    if (!name || !email) {
      return new Response(JSON.stringify({ error: "Name and email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const businessName = "ReviewBoost Demo";
    const demoReviewUrl = "https://search.google.com/local/writereview?placeid=demo";

    const htmlBody = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="padding:24px 32px 8px 32px;">
<div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#7c3aed;font-weight:700;margin-bottom:8px;">⚡ REVIEWBOOST DEMO</div>
</td></tr>
<tr><td style="padding:8px 32px;font-size:16px;color:#1f2937;line-height:1.6;">
<p style="margin:0 0 16px 0;">Hi ${name},</p>
<p style="margin:0 0 16px 0;">Thank you for checking out ReviewBoost! 🙏</p>
<p style="margin:0 0 16px 0;">This is exactly what your customers will receive — a warm, personalized review request that makes it effortless to leave a review.</p>
<p style="margin:0 0 16px 0;">In production, the AI personalizes each message and the button links directly to your Google review page. One click, and they're writing a review! ⭐</p>
<p style="margin:0 0 24px 0;font-size:20px;text-align:center;">⭐⭐⭐⭐⭐</p>
<p style="margin:0 0 24px 0;text-align:center;">
<a href="${demoReviewUrl}" style="display:inline-block;background-color:#7c3aed;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:600;">Leave a Review ⭐</a>
</p>
<p style="margin:0 0 16px 0;padding:16px;background:#f9fafb;border-radius:8px;font-size:13px;color:#6b7280;text-align:center;">
👆 This is a demo — in production this links to your actual Google review page.
</p>
</td></tr>
<tr><td style="padding:24px 32px 32px 32px;font-size:12px;color:#9ca3af;line-height:1.5;text-align:center;">
This is a sample email from <a href="https://reviewboost.com" style="color:#7c3aed;text-decoration:none;">ReviewBoost</a>. You requested this demo.
</td></tr>
</table>
</td></tr></table>
</body></html>`;

    const plainText = `Hi ${name},\n\nThis is a sample review request from ReviewBoost!\n\nIn production, AI personalizes each message and the link goes directly to your Google review page.\n\n⭐⭐⭐⭐⭐\n\nLeave a Review: ${demoReviewUrl}\n\n— ReviewBoost Demo`;

    const sendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `ReviewBoost <reviews@nextarcstore.in>`,
        to: [email],
        subject: `${name}, here's what your customers will see ⭐`,
        html: htmlBody,
        text: plainText,
      }),
    });

    if (!sendResp.ok) {
      const errText = await sendResp.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-demo-email error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
