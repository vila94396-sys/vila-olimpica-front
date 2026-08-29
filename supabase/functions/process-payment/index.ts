// Edge function: process-payment
// Centraliza a lógica de pagamentos online (M-Pesa, e-Mola, Cartão Visa/Mastercard).
// As chaves de API serão adicionadas via secrets. Enquanto isso, cada gateway
// funciona em MODO SIMULAÇÃO quando a respetiva secret não existir, para que
// o fluxo end-to-end da app continue funcional.
//
// Secrets esperadas (adicionar via add_secret quando disponíveis):
//   - MPESA_API_KEY, MPESA_PUBLIC_KEY, MPESA_SERVICE_PROVIDER_CODE      (Vodacom C2B)
//   - EMOLA_API_KEY, EMOLA_MERCHANT_ID                                  (Movitel e-Mola)
//   - CARD_GATEWAY_API_KEY, CARD_GATEWAY_MERCHANT_ID, CARD_GATEWAY_URL  (Visa/Mastercard)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Method = "mpesa" | "emola" | "card";

interface PaymentRequest {
  feeId: string;
  method: Method;
  amount: number;
  // Mobile money
  phone?: string;
  // Cartão
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardName?: string;
}

interface GatewayResult {
  success: boolean;
  transactionId?: string;
  message: string;
  simulated?: boolean;
}

// ============ M-Pesa (Vodacom) ============
async function processMpesa(req: PaymentRequest): Promise<GatewayResult> {
  const apiKey = Deno.env.get("MPESA_API_KEY");
  const publicKey = Deno.env.get("MPESA_PUBLIC_KEY");
  const spCode = Deno.env.get("MPESA_SERVICE_PROVIDER_CODE");

  if (!apiKey || !publicKey || !spCode) {
    // Modo simulação até as chaves serem adicionadas
    await new Promise((r) => setTimeout(r, 2000));
    return { success: true, transactionId: `SIM-MPESA-${Date.now()}`, message: "Pagamento simulado (M-Pesa)", simulated: true };
  }

  // TODO: integração real com a API C2B da Vodacom M-Pesa.
  // Fluxo típico: gerar bearer token via chave pública RSA (JWT) e chamar
  // POST https://api.vm.co.mz:18352/ipg/v1x/c2bPayment/singleStage/
  // com { input_Amount, input_CustomerMSISDN, input_ServiceProviderCode, input_TransactionReference, input_ThirdPartyReference }
  return { success: false, message: "Integração M-Pesa ainda não implementada" };
}

// ============ e-Mola (Movitel) ============
async function processEmola(req: PaymentRequest): Promise<GatewayResult> {
  const apiKey = Deno.env.get("EMOLA_API_KEY");
  const merchantId = Deno.env.get("EMOLA_MERCHANT_ID");

  if (!apiKey || !merchantId) {
    await new Promise((r) => setTimeout(r, 2000));
    return { success: true, transactionId: `SIM-EMOLA-${Date.now()}`, message: "Pagamento simulado (e-Mola)", simulated: true };
  }

  // TODO: integração real com a API e-Mola (Movitel).
  return { success: false, message: "Integração e-Mola ainda não implementada" };
}

// ============ Cartão Visa/Mastercard ============
async function processCard(req: PaymentRequest): Promise<GatewayResult> {
  const apiKey = Deno.env.get("CARD_GATEWAY_API_KEY");
  const merchantId = Deno.env.get("CARD_GATEWAY_MERCHANT_ID");
  const gatewayUrl = Deno.env.get("CARD_GATEWAY_URL");

  if (!apiKey || !merchantId || !gatewayUrl) {
    await new Promise((r) => setTimeout(r, 2500));
    return { success: true, transactionId: `SIM-CARD-${Date.now()}`, message: "Pagamento simulado (Cartão)", simulated: true };
  }

  // TODO: integração real com o gateway de cartões (ex.: Ponto24, Visa Direct, Mastercard Payment Gateway).
  return { success: false, message: "Integração de cartão ainda não implementada" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as PaymentRequest;
    const { feeId, method, amount } = body;

    if (!feeId || !method || !amount || amount <= 0) {
      return new Response(JSON.stringify({ error: "Parâmetros inválidos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Confirma que a taxa pertence a este utilizador
    const { data: fee, error: feeError } = await supabase
      .from("condominium_fees")
      .select("id, user_id, amount, status")
      .eq("id", feeId)
      .maybeSingle();

    if (feeError || !fee || fee.user_id !== userData.user.id) {
      return new Response(JSON.stringify({ error: "Taxa não encontrada" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (fee.status === "paid") {
      return new Response(JSON.stringify({ error: "Taxa já paga" }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let result: GatewayResult;
    switch (method) {
      case "mpesa": result = await processMpesa(body); break;
      case "emola": result = await processEmola(body); break;
      case "card":  result = await processCard(body); break;
      default:
        return new Response(JSON.stringify({ error: "Método inválido" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.message }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Atualiza a taxa como paga
    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("condominium_fees")
      .update({
        status: "paid",
        payment_method: method,
        paid_at: now,
        valor_pago: Number(amount),
        updated_at: now,
      })
      .eq("id", feeId);

    if (updateError) {
      console.error("Erro ao atualizar taxa:", updateError);
      return new Response(JSON.stringify({ error: "Pagamento efectuado mas falhou registo. Contacte a administração." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        transactionId: result.transactionId,
        simulated: !!result.simulated,
        message: result.message,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("process-payment error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
