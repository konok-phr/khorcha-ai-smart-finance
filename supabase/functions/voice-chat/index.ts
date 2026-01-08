import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const now = new Date();
const todayStr = now.toISOString().split('T')[0];

const SYSTEM_PROMPT = `তুমি Khorcha AI — ভয়েস-ভিত্তিক ট্রান্স্যাকশন সহায়ক।
আজকের তারিখ: ${todayStr}

✅ নিয়ম:
- ইউজার ভয়েসে লেনদেন বলবে (transcribed text আসবে)
- তুমি শুধু ১ লাইন JSON আউটপুট দেবে
- কোনো অতিরিক্ত টেক্সট দেবে না

📌 JSON ফরম্যাট:
{"type":"expense","amount":500,"category":"transport","description":"রিকশা ভাড়া","transaction_date":"${todayStr}","account_name":null}

❓ অস্পষ্ট হলে:
{"unclear":true,"question":"কত টাকা খরচ করেছেন বলুন?"}

🏷️ Category:
Expense: food, transport, shopping, bills, health, entertainment, education, others
Income: salary, business, investment, freelance, gift, others

💳 Account:
- bkash/bikash → "bKash" | nagad → "Nagad" | card → "Card" | bank → "Bank"
- না বললে → null

⚠️ লেনদেন বোঝা গেলে JSON ONLY.`;

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
