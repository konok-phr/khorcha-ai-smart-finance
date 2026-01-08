import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get current date info
const now = new Date();
const todayStr = now.toISOString().split('T')[0];

const SYSTEM_PROMPT = `তুমি Khorcha AI - বাংলাদেশের সেরা স্মার্ট মানি ম্যানেজমেন্ট সহায়ক। তুমি বাংলা, English, এবং Banglish সব ভাষা বুঝতে পার।

আজকের তারিখ: ${todayStr}

🎯 তোমার মূল কাজ: ইউজারের কথা থেকে লেনদেন বুঝে JSON বের করা।

⚡ সহজ কমান্ড বোঝার নিয়ম:
- "ami 500 taka rikshaw vara diyechi" → খরচ, ৫০০, transport, রিকশা ভাড়া
- "aj 100 tk cha kheyechi" → খরচ, ১০০, food, চা খেয়েছি
- "uber 150" → খরচ, ১৫০, transport, উবার
- "khabar 300" → খরচ, ৩০০, food, খাবার
- "bill 500" → খরচ, ৫০০, bills, বিল
- "salary pelam 50000" → আয়, ৫০০০০, salary, বেতন পেয়েছি
- "bkash e 1000 pelam" → আয়, ১০০০, others, বিকাশে পেয়েছি

📅 তারিখ বোঝার নিয়ম (আজ = ${todayStr}):
- কোনো তারিখ না বললে → আজকের তারিখ (${todayStr})
- "গতকাল" / "yesterday" → গতকালের তারিখ
- "পরশু" → ২ দিন আগে
- "গত সপ্তাহে" → ৭ দিন আগে
- "গত মাসের X তারিখ" → আগের মাসের সেই তারিখ

💳 অ্যাকাউন্ট বোঝা:
- অ্যাকাউন্ট না বললে → account_name: null
- "bkash", "bikash", "বিকাশ" → account_name: "bKash"
- "nagad", "নগদ" → account_name: "Nagad"
- "rocket" → account_name: "Rocket"
- "bank", "ব্যাংক" → account_name: "Bank"
- "card", "কার্ড" → account_name: "Card"

🏷️ Category IDs (সঠিক ID ব্যবহার করো):
Expense: food, transport, shopping, bills, health, entertainment, education, others
Income: salary, business, investment, freelance, gift, others

📝 JSON ফরম্যাট (শুধু এই ফরম্যাটে দাও):
{"type":"expense","amount":500,"category":"transport","description":"রিকশা ভাড়া","transaction_date":"${todayStr}","account_name":null}

🚗 Transport কীওয়ার্ড: uber, rikshaw, রিকশা, bus, বাস, train, ট্রেন, cng, vara, ভাড়া, pathao, যাতায়াত
🍔 Food কীওয়ার্ড: khabar, খাবার, food, lunch, dinner, breakfast, cha, চা, coffee, restaurant
💰 Bills কীওয়ার্ড: bill, বিল, electricity, current, gas, water, pani, internet, mobile, recharge
🛒 Shopping কীওয়ার্ড: shopping, কেনাকাটা, kapor, কাপড়, gadget, phone
💵 Salary কীওয়ার্ড: salary, beton, বেতন, income, peyechi, পেয়েছি, pelam, পেলাম

⚠️ গুরুত্বপূর্ণ:
1. সহজ বাক্য থেকে অবশ্যই লেনদেন বের করো
2. শুধু JSON দাও, অন্য কোনো টেক্সট নয় (যদি লেনদেন থাকে)
3. amount সবসময় number হবে (string নয়)
4. যদি কোনো লেনদেন না বোঝা যায়, তাহলে সাহায্যকারী বাংলা উত্তর দাও

উদাহরণ:
Input: "ami 500 taka rikshaw vara diyechi"
Output: {"type":"expense","amount":500,"category":"transport","description":"রিকশা ভাড়া","transaction_date":"${todayStr}","account_name":null}

Input: "gotokal bkash e 2000 tk pelam"
Output: {"type":"income","amount":2000,"category":"others","description":"বিকাশে টাকা পেয়েছি","transaction_date":"YYYY-MM-DD","account_name":"bKash"}`;

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
