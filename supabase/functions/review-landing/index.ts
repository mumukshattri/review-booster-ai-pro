import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const cid = url.searchParams.get("cid") || "";
  const reviewUrl = url.searchParams.get("url") || "https://google.com";
  const businessName = url.searchParams.get("biz") || "us";

  // Handle feedback submission (POST)
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { message } = body;
      if (!message || !cid) {
        return new Response(JSON.stringify({ error: "Missing data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      // Get customer info
      const { data: customer } = await supabase
        .from("customers")
        .select("user_id, name, email")
        .eq("id", cid)
        .single();

      if (!customer) {
        return new Response(JSON.stringify({ error: "Customer not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("feedback").insert({
        customer_id: cid,
        user_id: customer.user_id,
        message: message.substring(0, 1000),
        customer_name: customer.name,
        customer_email: customer.email,
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Feedback submission error:", err);
      return new Response(JSON.stringify({ error: "Server error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  // Serve the sentiment landing page (GET)
  const escapedBiz = businessName.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const escapedUrl = reviewUrl.replace(/"/g, "&quot;");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>How was your experience?</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0a0a0f;color:#e4e4e7;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:16px}
    .card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:40px;max-width:420px;width:100%;text-align:center;backdrop-filter:blur(20px)}
    .icon{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#7c3aed,#a855f7);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
    .icon svg{width:28px;height:28px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    h1{font-size:22px;font-weight:700;margin-bottom:8px;line-height:1.3}
    .subtitle{font-size:14px;color:#a1a1aa;margin-bottom:32px}
    .choices{display:flex;gap:16px;justify-content:center}
    .choice{flex:1;display:flex;flex-direction:column;align-items:center;gap:12px;padding:24px 16px;border-radius:16px;border:1px solid rgba(255,255,255,0.1);cursor:pointer;transition:all .2s}
    .choice:hover{transform:scale(1.03)}
    .choice-positive{background:rgba(16,185,129,0.08);border-color:rgba(16,185,129,0.2)}
    .choice-positive:hover{background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.4)}
    .choice-negative{background:rgba(255,255,255,0.03)}
    .choice-negative:hover{background:rgba(255,255,255,0.06);border-color:rgba(255,255,255,0.2)}
    .emoji{font-size:40px;line-height:1}
    .choice-label{font-size:14px;font-weight:600}
    .choice-positive .choice-label{color:#34d399}
    .choice-negative .choice-label{color:#a1a1aa}
    textarea{width:100%;min-height:120px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:14px;color:#e4e4e7;font-size:14px;font-family:inherit;resize:none;outline:none;margin-bottom:16px}
    textarea:focus{border-color:rgba(124,58,237,0.5)}
    textarea::placeholder{color:#52525b}
    .btn-row{display:flex;gap:12px}
    .btn{flex:1;padding:12px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;border:none;transition:all .15s}
    .btn-back{background:rgba(255,255,255,0.06);color:#a1a1aa}
    .btn-back:hover{background:rgba(255,255,255,0.1)}
    .btn-send{background:linear-gradient(135deg,#7c3aed,#a855f7);color:#fff}
    .btn-send:hover{opacity:0.9}
    .btn-send:disabled{opacity:0.4;cursor:not-allowed}
    .success-icon{width:56px;height:56px;border-radius:50%;background:rgba(16,185,129,0.15);display:flex;align-items:center;justify-content:center;margin:0 auto 24px}
    .success-icon svg{width:28px;height:28px;stroke:#34d399;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .hidden{display:none}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    .pulse{animation:pulse 1.5s infinite}
    @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    .fade-in{animation:fadeIn .3s ease-out}
  </style>
</head>
<body>
  <!-- Step 1: Choice -->
  <div id="step-choice" class="card fade-in">
    <div class="icon">
      <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    </div>
    <h1>How was your experience at ${escapedBiz}?</h1>
    <p class="subtitle">Your feedback means everything to us</p>
    <div class="choices">
      <div class="choice choice-positive" onclick="handlePositive()">
        <span class="emoji">😊</span>
        <span class="choice-label">Great!</span>
      </div>
      <div class="choice choice-negative" onclick="showFeedback()">
        <span class="emoji">😞</span>
        <span class="choice-label">Not so great</span>
      </div>
    </div>
  </div>

  <!-- Step 2: Feedback form -->
  <div id="step-feedback" class="card hidden">
    <h1>Tell us what went wrong</h1>
    <p class="subtitle" style="margin-bottom:24px">We take your feedback seriously and will work to improve.</p>
    <textarea id="feedback-text" placeholder="Share your experience..." maxlength="1000"></textarea>
    <div class="btn-row">
      <button class="btn btn-back" onclick="showChoice()">Back</button>
      <button class="btn btn-send" id="btn-submit" onclick="submitFeedback()">Send Feedback</button>
    </div>
  </div>

  <!-- Step 3: Thank you -->
  <div id="step-thankyou" class="card hidden">
    <div class="success-icon">
      <svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
    </div>
    <h1>Thank you!</h1>
    <p class="subtitle">Your feedback has been received. We appreciate you taking the time to help us improve.</p>
  </div>

  <!-- Step 4: Redirecting -->
  <div id="step-redirect" class="card hidden">
    <div class="icon pulse">
      <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    </div>
    <h1>Awesome! 🎉</h1>
    <p class="subtitle">Redirecting you to leave a review...</p>
  </div>

  <script>
    const reviewUrl = "${escapedUrl}";
    const cid = "${cid}";
    const feedbackEndpoint = "${SUPABASE_URL}/functions/v1/review-landing";

    function show(id) {
      document.querySelectorAll('.card').forEach(c => c.classList.add('hidden'));
      const el = document.getElementById(id);
      el.classList.remove('hidden');
      el.classList.remove('fade-in');
      void el.offsetWidth;
      el.classList.add('fade-in');
    }

    function handlePositive() {
      show('step-redirect');
      setTimeout(() => { window.location.href = reviewUrl; }, 1200);
    }

    function showFeedback() { show('step-feedback'); }
    function showChoice() { show('step-choice'); }

    async function submitFeedback() {
      const msg = document.getElementById('feedback-text').value.trim();
      if (!msg) return;
      const btn = document.getElementById('btn-submit');
      btn.disabled = true;
      btn.textContent = 'Sending...';
      try {
        await fetch(feedbackEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cid, message: msg })
        });
      } catch(e) { console.error(e); }
      show('step-thankyou');
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
  });
});
