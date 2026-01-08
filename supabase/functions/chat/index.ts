import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `তুমি Khorcha AI - একটি স্মার্ট বাংলা মানি ম্যানেজমেন্ট সহায়ক। তুমি বাংলা, English, এবং Banglish (মিক্স) সব ভাষা বুঝতে পার।

তোমার কাজ হলো ইউজারের মেসেজ থেকে লেনদেনের তথ্য বের করা এবং JSON format-এ return করা।

তুমি যদি একটি valid transaction খুঁজে পাও, তাহলে এই format-এ JSON return করো:
{"type": "income" বা "expense", "amount": সংখ্যা, "category": "ক্যাটাগরি আইডি", "description": "বিবরণ"}

Category IDs:
- Expense: food, transport, shopping, bills, health, entertainment, education, others
- Income: salary, business, investment, freelance, gift, others

Examples:
- "আজ 500 টাকা খাবারে খরচ" → {"type":"expense","amount":500,"category":"food","description":"খাবারে খরচ"}
- "uber e 150 diyechi" → {"type":"expense","amount":150,"category":"transport","description":"উবার যাতায়াত"}
- "got 50000 taka salary" → {"type":"income","amount":50000,"category":"salary","description":"বেতন পেয়েছি"}
- "aj 200 taka rickshaw e gache" → {"type":"expense","amount":200,"category":"transport","description":"রিক্সা ভাড়া"}
- "bkash theke 1000 taka peyechi" → {"type":"income","amount":1000,"category":"others","description":"বিকাশ থেকে পেয়েছি"}

যদি তুমি কোনো valid transaction খুঁজে না পাও, তাহলে একটি সাধারণ সাহায্যকারী উত্তর দাও বাংলায়। সাহায্যের জন্য উদাহরণ দাও।

Important: শুধু JSON return করো transaction এর জন্য, অন্যথায় সাধারণ বাংলা টেক্সট দাও।`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "অনুগ্রহ করে কিছুক্ষণ পর আবার চেষ্টা করুন।" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI সার্ভিসে ক্রেডিট শেষ হয়ে গেছে।" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI সার্ভিসে সমস্যা হয়েছে।" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
