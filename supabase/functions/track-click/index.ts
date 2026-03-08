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
          .select("review_url")
          .eq("id", customer.user_id)
          .single();

        if (profile?.review_url) {
          reviewUrl = profile.review_url;
        }
      }
    }
  } catch (err) {
    console.error("track-click error:", err);
  }

  // Always redirect, never crash
  return new Response(null, {
    status: 302,
    headers: {
      Location: reviewUrl,
      "Access-Control-Allow-Origin": "*",
    },
  });
});
