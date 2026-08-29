import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ATTEMPTS = 3;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string") {
      return new Response(JSON.stringify({ error: "email required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Fetch current record
    const { data: existing } = await admin
      .from("login_attempts")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    const newCount = (existing?.failed_count || 0) + 1;
    const shouldLock = newCount >= MAX_ATTEMPTS;

    if (existing) {
      await admin
        .from("login_attempts")
        .update({
          failed_count: newCount,
          is_locked: shouldLock || existing.is_locked,
          locked_at: shouldLock && !existing.is_locked ? new Date().toISOString() : existing.locked_at,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await admin.from("login_attempts").insert({
        email: normalizedEmail,
        failed_count: newCount,
        is_locked: shouldLock,
        locked_at: shouldLock ? new Date().toISOString() : null,
      });
    }

    // If crossing threshold, ban the auth user
    if (shouldLock) {
      try {
        const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const authUser = list?.users?.find(
          (u: any) => (u.email || "").toLowerCase() === normalizedEmail,
        );
        if (authUser) {
          await admin.auth.admin.updateUserById(authUser.id, { ban_duration: "876000h" } as any);
        }
      } catch (e) {
        console.error("Ban failed:", e);
      }
    }

    return new Response(
      JSON.stringify({
        failed_count: newCount,
        is_locked: shouldLock,
        remaining: Math.max(0, MAX_ATTEMPTS - newCount),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
