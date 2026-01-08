import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get current date info
const now = new Date();
const todayStr = now.toISOString().split('T')[0];

const SYSTEM_PROMPT = `তুমি Khorcha AI — খুব দ্রুত, খুব সহজ ট্রান্স্যাকশন এন্ট্রি সহায়ক।
আজকের তারিখ: ${todayStr}

✅ সবচেয়ে গুরুত্বপূর্ণ নিয়ম:
- যদি ইউজারের মেসেজ থেকে কোনো লেনদেন (income/expense) বোঝা যায়, **শুধু ১ লাইন JSON** আউটপুট দেবে।
- কোনো greeting/ব্যাখ্যা/markdown/বুলেট/অতিরিক্ত টেক্সট দেবে না।
- যদি লেনদেন বোঝা না যায় বা ইউজার প্রশ্ন করে, তখন ১–২ লাইনে বাংলায় সাহায্য করবে।

📌 JSON ফরম্যাট:
{"type":"expense","amount":500,"category":"transport","description":"রিকশা ভাড়া","transaction_date":"${todayStr}","account_name":null}

❓ অস্পষ্ট হলে confirmation JSON:
{"confirm":true,"type":"expense","amount":500,"category":"transport","description":"রিকশা ভাড়া","transaction_date":"${todayStr}","account_name":null,"question":"আপনি কি ৫০০ টাকা রিকশা ভাড়া খরচ যোগ করতে চান?"}

🧠 দ্রুত বোঝা (examples):
- "ami 500 taka rikshaw vara diyechi" → expense 500 transport
- "uber 150" → expense 150 transport
- "500 taka income korechi" / "income 500" / "500 pelam" → income 500 others

🏷️ Category IDs:
Expense: food, transport, shopping, bills, health, entertainment, education, others
Income: salary, business, investment, freelance, gift, others

💳 Account:
- bkash/bikash → "bKash" | nagad → "Nagad" | rocket → "Rocket" | card → "Card" | bank → "Bank"
- না বললে → null

📅 Date:
- না বললে → ${todayStr}
- gotokal/yesterday → আগের দিন
- "got masher X tarikh" → আগের মাসের X তারিখ

⚠️ আবার বলছি: লেনদেন বোঝা গেলে JSON ONLY.`;

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
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
        temperature: 0.1, // Lower temperature for more consistent responses
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
