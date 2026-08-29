import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-MZ", { style: "currency", currency: "MZN" }).format(value);

const sendEmail = async (apiKey: string, params: { from: string; to: string[]; subject: string; html: string }) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const body = await req.json();
    const { emails, referenceMonth, referenceYear, amount, dueDate } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return new Response(JSON.stringify({ error: "No emails provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const results = [];
    const errors = [];

    for (const email of emails) {
      try {
        const emailResponse = await sendEmail(resendApiKey, {
          from: "Vila Olímpica <noreply@vilaolimp.co.mz>",
          to: [email],
          subject: `Nova Taxa Condominial — ${referenceMonth}/${referenceYear}`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 22px;">Vila Olímpica</h1>
                <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Condomínio Residencial</p>
              </div>
              <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="display: inline-block; background: #fef3c7; color: #d97706; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px;">
                    📋 Nova Taxa Condominial
                  </div>
                </div>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                  Prezado(a) morador(a),<br><br>
                  Uma nova taxa condominial foi registada para o seu apartamento. Seguem os detalhes:
                </p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 0; color: #6b7280; font-size: 13px;">Referência</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1f2937;">${referenceMonth} de ${referenceYear}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #f3f4f6;">
                    <td style="padding: 12px 0; color: #6b7280; font-size: 13px;">Valor</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px; color: #1a365d;">${formatCurrency(amount)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; color: #6b7280; font-size: 13px;">Vencimento</td>
                    <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1f2937;">${dueDate}</td>
                  </tr>
                </table>
                <div style="text-align: center; margin-top: 24px;">
                  <p style="color: #374151; font-size: 14px;">
                    Acesse a <strong>Área do Morador</strong> para efectuar o pagamento.
                  </p>
                </div>
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
                  Em caso de dúvida, contacte a administração.
                </p>
              </div>
              <div style="background: #f9fafb; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                  Este email foi enviado automaticamente. Por favor não responda.
                </p>
              </div>
            </div>
          `,
        });
        results.push({ email, success: true, id: emailResponse?.id });
      } catch (err: unknown) {
        console.error(`Error sending to ${email}:`, err);
        errors.push({ email, error: (err as Error).message });
      }
    }

    return new Response(
      JSON.stringify({ sent: results.length, failed: errors.length, results, errors }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error in send-fee-notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
