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
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: roles } = await admin
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roles) {
      return new Response(JSON.stringify({ error: "Apenas administradores" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email } = await req.json();
    const cleaned = (email || "").toString().trim().toLowerCase();
    // Apenas ASCII (rejeita acentos como "í" que o Supabase Auth não aceita)
    if (!cleaned || !/^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/.test(cleaned)) {
      return new Response(JSON.stringify({
        error: "Email inválido. Use apenas caracteres ASCII (sem acentos), ex.: vilaolimpica.cmvomz@gmail.com"
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (cleaned === (user.email || "").toLowerCase()) {
      return new Response(JSON.stringify({ error: "O novo email é igual ao atual." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verificar se o email já está em uso por outro utilizador
    const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const taken = existing?.users?.some((u: any) => (u.email || "").toLowerCase() === cleaned && u.id !== user.id);
    if (taken) {
      return new Response(JSON.stringify({ error: "Este email já está em uso por outra conta." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { error } = await admin.auth.admin.updateUserById(user.id, {
      email: cleaned,
      email_confirm: true,
    });
    if (error) {
      console.error("updateUserById error:", error);
      const msg = /duplicate|already/i.test(error.message || "")
        ? "Este email já está em uso por outra conta."
        : (error.message || "Falha ao atualizar email");
      return new Response(JSON.stringify({ error: msg }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, email }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
