const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const { full_name, email, phone, block, building, apartment, resident_type } = await req.json();

    const adminEmail = "vilaolimpica.cmvomz@gmail.com";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #1a5d1a;">🔔 Novo Pedido de Acesso</h2>
        <p>Um novo morador submeteu um pedido de acesso à Área do Morador:</p>
        <div style="background: #f4f4f4; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Nome:</strong> ${full_name}</p>
          <p style="margin: 4px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 4px 0;"><strong>Telefone:</strong> ${phone}</p>
          <p style="margin: 4px 0;"><strong>Tipo:</strong> ${resident_type === "proprietario" ? "Proprietário" : "Inquilino"}</p>
          <p style="margin: 4px 0;"><strong>Localização:</strong> Bloco ${block} · Ed. ${building} · Apt. ${apartment}</p>
        </div>
        <p>Aceda ao painel de administração para aprovar ou rejeitar este pedido.</p>
        <br/>
        <p style="color: #888; font-size: 12px;">Esta é uma notificação automática do Portal Vila Olímpica.</p>
      </div>
    `;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Vila Olímpica <noreply@vilaolimp.co.mz>",
        to: [adminEmail],
        subject: `Novo Pedido de Acesso - ${full_name}`,
        html: emailHtml,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", errText);
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", (error as Error).message);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
