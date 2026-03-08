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
  const cid = url.searchParams.get("cid");
  const fallbackUrl = url.searchParams.get("url") || "https://google.com";

  // Redirect to the sentiment landing page instead of directly to Google
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const projectId = SUPABASE_URL.replace("https://", "").replace(".supabase.co", "");
  
  // Build the review landing page URL on the frontend app
  // We need to get the app URL - use the referer or construct from project
  const appOrigin = req.headers.get("referer") 
    ? new URL(req.headers.get("referer")!).origin 
    : null;

  // Redirect to the sentiment filter page with customer ID
  const sentimentUrl = `/review?cid=${cid}&url=${encodeURIComponent(fallbackUrl)}`;

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (cid) {
      // Update clicked status
      const { error: updateErr } = await supabase
        .from("customers")
        .update({ clicked: true })
        .eq("id", cid);

      if (updateErr) {
        console.error("Failed to update clicked:", updateErr.message);
      }

      // Fetch review_url from profiles via the customer's user_id
      const { data: customer } = await supabase
        .from("customers")
        .select("user_id")
        .eq("id", cid)
        .single();

      if (customer?.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("review_url, direct_review_url")
          .eq("id", customer.user_id)
          .single();

        let reviewUrl = fallbackUrl;
        if (profile?.direct_review_url) {
          reviewUrl = profile.direct_review_url;
        } else if (profile?.review_url) {
          reviewUrl = profile.review_url;
        }

        // Redirect to sentiment landing page on the app
        // We use a special edge function that serves the HTML page
        const landingUrl = `${SUPABASE_URL}/functions/v1/review-landing?cid=${cid}&url=${encodeURIComponent(reviewUrl)}`;
        return new Response(null, {
          status: 302,
          headers: { Location: landingUrl, "Access-Control-Allow-Origin": "*" },
        });
      }
    }
  } catch (err) {
    console.error("track-click error:", err);
  }

  // Fallback: redirect to the review URL directly
  return new Response(null, {
    status: 302,
    headers: {
      Location: fallbackUrl,
      "Access-Control-Allow-Origin": "*",
    },
  });
});
