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

  let reviewUrl = fallbackUrl;
  let businessName = "us";

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (cid) {
      const { error: updateErr } = await supabase
        .from("customers")
        .update({ clicked: true })
        .eq("id", cid);

      if (updateErr) {
        console.error("Failed to update clicked:", updateErr.message);
      }

      const { data: customer } = await supabase
        .from("customers")
        .select("user_id")
        .eq("id", cid)
        .single();

      if (customer?.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("review_url, direct_review_url, business_name")
          .eq("id", customer.user_id)
          .single();

        if (profile?.direct_review_url) {
          reviewUrl = profile.direct_review_url;
        } else if (profile?.review_url) {
          reviewUrl = profile.review_url;
        }
        if (profile?.business_name) {
          businessName = profile.business_name;
        }
      }
    }
  } catch (err) {
    console.error("track-click error:", err);
  }

  // Redirect to the sentiment landing page served by review-landing edge function
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const landingUrl = `${SUPABASE_URL}/functions/v1/review-landing?cid=${encodeURIComponent(cid || "")}&url=${encodeURIComponent(reviewUrl)}&biz=${encodeURIComponent(businessName)}`;

  return new Response(null, {
    status: 302,
    headers: {
      Location: landingUrl,
      "Access-Control-Allow-Origin": "*",
    },
  });
});
