import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const now = new Date();
const todayStr = now.toISOString().split('T')[0];

const SYSTEM_PROMPT = `You are Khorcha AI — a voice-based transaction assistant.
Today is: ${todayStr}

Rules:
- The user will speak and you receive transcribed text.
- Output MUST be exactly ONE LINE of JSON.
- No greetings. No extra text. JSON only.
- Voice mode is ENGLISH ONLY. If the input is not English or unclear, ask for clarification.

Transaction JSON format:
{"type":"expense","amount":500,"category":"transport","description":"rickshaw fare","transaction_date":"${todayStr}","account_name":null}

If unclear, output:
{"unclear":true,"question":"Please repeat in English. Tell me the amount and what it was for."}

Categories:
Expense: food, transport, shopping, bills, health, entertainment, education, others
Income: salary, business, investment, freelance, gift, others

Accounts (optional):
- bkash/bikash → "bKash" | nagad → "Nagad" | card → "Card" | bank → "Bank"
- If not mentioned, set account_name to null

Notes:
- The transcript may include extra context like "User clarifies: ...". Use it.
- If amount is missing, ask for amount. If purpose/category is missing, ask what it was for.

JSON ONLY.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: transcript },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      throw new Error("AI processing failed");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Voice chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
