import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PaymentNotificationRequest {
  referenceMonth: string;
  referenceYear: number;
  amount: number;
  paymentMethod: string;
  paidAt: string;
  receiptId: string;
}

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

    const userId = user.id;
    const userEmail = user.email;

    const body: PaymentNotificationRequest = await req.json();
    const { referenceMonth, referenceYear, amount, paymentMethod, paidAt, receiptId } = body;

    if (!referenceMonth || !referenceYear || !amount || !receiptId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data: feeData, error: feeError } = await supabase
      .from("condominium_fees")
      .select("id, user_id, status")
      .eq("id", receiptId)
      .eq("user_id", userId)
      .eq("status", "paid")
      .maybeSingle();

    if (feeError || !feeData) {
      return new Response(JSON.stringify({ error: "Payment not found or not authorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const emailResponse = await sendEmail(resendApiKey, {
      from: "Vila Olímpica <noreply@vilaolimp.co.mz>",
      to: [userEmail as string],
      subject: `Pagamento Confirmado — Taxa ${referenceMonth}/${referenceYear}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <div style="background: linear-gradient(135deg, #1a365d 0%, #2563eb 100%); color: #ffffff; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 22px;">Vila Olímpica</h1>
            <p style="margin: 4px 0 0; font-size: 13px; opacity: 0.85;">Condomínio Residencial</p>
          </div>
          <div style="padding: 30px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="display: inline-block; background: #dcfce7; color: #16a34a; padding: 8px 20px; border-radius: 20px; font-weight: 700; font-size: 14px;">
                ✓ Pagamento Confirmado
              </div>
            </div>
            <p style="color: #374151; font-size: 15px; line-height: 1.6;">
              O seu pagamento da taxa condominial foi processado com sucesso. Seguem os detalhes:
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 13px;">Referência</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1f2937;">${referenceMonth} de ${referenceYear}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 13px;">Valor Pago</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 700; font-size: 18px; color: #1a365d;">${formatCurrency(amount)}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f3f4f6;">
                <td style="padding: 12px 0; color: #6b7280; font-size: 13px;">Método</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1f2937;">${paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 13px;">Data</td>
                <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1f2937;">${paidAt}</td>
              </tr>
            </table>
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 24px;">
              Pode descarregar o comprovativo de pagamento na Área do Morador.<br>
              ID: ${receiptId}
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

    console.log("Payment notification email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending payment notification:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
