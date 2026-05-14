import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Utility to verify Lemon Squeezy webhook signature
async function verifySignature(payload: string, signature: string, secret: string) {
    const enc = new TextEncoder();

    const keyIdentifier = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        keyIdentifier,
        enc.encode(payload)
    );

    const hexSignature = Array.from(new Uint8Array(signatureBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

    return hexSignature === signature;
}

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-signature",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const rawBody = await req.text();
        const signature = req.headers.get("x-signature");
        const secret = Deno.env.get("LEMON_SQUEEZY_WEBHOOK_SECRET");

        if (!signature || !secret || !(await verifySignature(rawBody, signature, secret))) {
            return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
        }

        const payload = JSON.parse(rawBody);
        const event = payload.meta.event_name;
        const attrs = payload.data.attributes;

        // We expect the variant ID to act as the source of truth for plan tiers
        const variantId = attrs.variant_id?.toString();
        const customerEmail = attrs.user_email;
        const subscriptionId = payload.data.id;
        const customerId = attrs.customer_id?.toString();
        const endsAt = attrs.ends_at;

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Map your actual Lemon Squeezy variant IDs to plans
        // Using placeholder logic: adjust based on actual IDs
        let plan = "free";
        if (attrs.product_name?.toLowerCase().includes("starter")) plan = "starter";
        if (attrs.product_name?.toLowerCase().includes("pro")) plan = "pro";
        if (attrs.product_name?.toLowerCase().includes("agency")) plan = "agency";

        // Fallback dictionary for variant IDs
        const VARIANT_TO_PLAN: Record<string, string> = {
            "1398674": "starter",
            "1399966": "agency",
            "1399999": "pro",
        };
        if (VARIANT_TO_PLAN[variantId]) plan = VARIANT_TO_PLAN[variantId];

        if (event === "subscription_created" || event === "subscription_updated") {
            // Find the user by their email using auth admin
            const { data: users } = await supabase.auth.admin.listUsers();
            const user = users.users.find((u: any) => u.email === customerEmail);

            if (user) {
                await supabase.from("profiles").update({
                    plan: plan,
                    subscription_status: attrs.status,
                    lemon_squeezy_subscription_id: subscriptionId,
                    lemon_squeezy_customer_id: customerId,
                    plan_expires_at: endsAt || null
                }).eq("id", user.id);
            }
        } else if (event === "subscription_cancelled" || event === "subscription_expired") {
            await supabase.from("profiles").update({
                plan: "free",
                subscription_status: attrs.status, // e.g., 'cancelled' or 'expired'
                plan_expires_at: endsAt || null
            }).eq("lemon_squeezy_subscription_id", subscriptionId);
        } else if (event === "subscription_resumed") {
            await supabase.from("profiles").update({
                plan: plan,
                subscription_status: "active"
            }).eq("lemon_squeezy_subscription_id", subscriptionId);
        }

        return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
    }
});
