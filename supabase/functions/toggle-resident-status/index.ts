import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roles) {
      return new Response(JSON.stringify({ error: "Acesso negado: apenas administradores" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const body = await req.json();
    const { request_id, action } = body as { request_id: string; action: "deactivate" | "reactivate" };
    if (!request_id || !["deactivate", "reactivate"].includes(action)) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: request, error: reqErr } = await admin
      .from("access_requests")
      .select("id, email, status")
      .eq("id", request_id)
      .maybeSingle();
    if (reqErr || !request) {
      return new Response(JSON.stringify({ error: "Morador não encontrado" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Find auth user by email
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const authUser = list?.users?.find((u: any) => (u.email || "").toLowerCase() === request.email.toLowerCase());

    if (action === "deactivate") {
      if (authUser) {
        // Ban for 100 years
        await admin.auth.admin.updateUserById(authUser.id, { ban_duration: "876000h" } as any);
      }
      await admin.from("access_requests").update({ status: "deactivated", updated_at: new Date().toISOString() }).eq("id", request_id);
    } else {
      if (authUser) {
        await admin.auth.admin.updateUserById(authUser.id, { ban_duration: "none" } as any);
      }
      await admin.from("access_requests").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", request_id);
    }

    return new Response(JSON.stringify({ success: true, action, email: request.email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
