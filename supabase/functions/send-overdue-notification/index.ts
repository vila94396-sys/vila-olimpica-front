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

interface OverdueFee {
  email: string;
  referenceMonth: string;
  referenceYear: number;
  amount: number;
  dueDate: string;
  daysOverdue: number;
}

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
    const { overdueFees } = body as { overdueFees: OverdueFee[] };

    if (!overdueFees || !Array.isArray(overdueFees) || overdueFees.length === 0) {
      return new Response(JSON.stringify({ error: "No overdue fees provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Group fees by email
    const grouped: Record<string, OverdueFee[]> = {};
    for (const fee of overdueFees) {
      if (!grouped[fee.email]) grouped[fee.email] = [];
      grouped[fee.email].push(fee);
    }

    const results = [];
    const errors = [];

    for (const [email, fees] of Object.entries(grouped)) {
      const totalAmount = fees.reduce((sum, f) => sum + f.amount, 0);
      const feeRows = fees.map(f => `
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 8px; color: #1f2937; font-size: 13px;">${f.referenceMonth}/${f.referenceYear}</td>
          <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: #1f2937;">${formatCurrency(f.amount)}</td>
          <td style="padding: 10px 8px; text-align: right; color: #1f2937;">${f.dueDate}</td>
          <td style="padding: 10px 8px; text-align: right; color: #dc2626; font-weight: 600;">${f.daysOverdue} dias</td>
        </tr>
      `).join("");

      try {
        const emailResponse = await sendEmail(resendApiKey, {
          from: "Vila Olímpica <noreply@vilaolimp.co.mz>",
          to: [email],
          subject: `⚠️ Aviso de Inadimplência — ${fees.length} taxa(s) em atraso`,
          html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
              <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="margin: 0; font-size: 22px;">Vila Olímpica</h1>
                <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Condomínio Residencial</p>
              </div>
              <div style="padding: 30px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <div style="display: inline-block; background: #fef2f2; color: #dc2626; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px;">
                    ⚠️ Aviso de Inadimplência
                  </div>
                </div>
                <p style="color: #374151; font-size: 15px; line-height: 1.6;">
                  Prezado(a) morador(a),<br><br>
                  Identificámos que possui <strong>${fees.length} taxa(s) condominial(ais)</strong> em atraso. Solicitamos a regularização o mais breve possível.
                </p>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                  <thead>
                    <tr style="border-bottom: 2px solid #e5e7eb;">
                      <th style="padding: 10px 8px; text-align: left; color: #6b7280; font-size: 12px; text-transform: uppercase;">Referência</th>
                      <th style="padding: 10px 8px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;">Valor</th>
                      <th style="padding: 10px 8px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;">Vencimento</th>
                      <th style="padding: 10px 8px; text-align: right; color: #6b7280; font-size: 12px; text-transform: uppercase;">Atraso</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${feeRows}
                  </tbody>
                  <tfoot>
                    <tr style="border-top: 2px solid #e5e7eb;">
                      <td style="padding: 12px 8px; font-weight: 700; color: #1f2937;">Total</td>
                      <td style="padding: 12px 8px; text-align: right; font-weight: 700; font-size: 16px; color: #dc2626;">${formatCurrency(totalAmount)}</td>
                      <td colspan="2"></td>
                    </tr>
                  </tfoot>
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
        results.push({ email, feesCount: fees.length, success: true, id: emailResponse?.id });
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
    console.error("Error in send-overdue-notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
