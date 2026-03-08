import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const url = new URL(req.url);
  const cid = url.searchParams.get("cid");
  const redirectUrl = url.searchParams.get("url");

  if (cid) {
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      await supabase.from("customers").update({ clicked: true }).eq("id", cid);
    } catch (err) {
      console.error("track-click error:", err);
    }
  }

  // Redirect to the actual review URL
  const destination = redirectUrl || "https://google.com";
  return new Response(null, {
    status: 302,
    headers: {
      Location: destination,
      "Access-Control-Allow-Origin": "*",
    },
  });
});
