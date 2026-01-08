import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Get current date info
const now = new Date();
const todayStr = now.toISOString().split('T')[0];

const SYSTEM_PROMPT = `তুমি Khorcha AI - দ্রুত এবং স্মার্ট মানি ম্যানেজমেন্ট সহায়ক।

আজ: ${todayStr}

🎯 কাজ: ইউজারের কথা থেকে লেনদেন বুঝে JSON দাও।

⚡ দ্রুত পার্সিং রুল:
"ami/আমি X tk/taka Y" → expense, X, category, Y
"X tk khoroj/diyechi" → expense
"X tk pelam/peyechi/income" → income

🔤 Common Words → Category:
- rikshaw/uber/cng/bus/pathao/vara/ভাড়া → transport
- khabar/food/lunch/dinner/cha/coffee → food  
- bill/current/gas/water/mobile/recharge → bills
- shopping/kapor/phone/gadget → shopping
- salary/beton/income → salary (income type)
- freelance/project → freelance (income type)

📅 তারিখ:
- না বললে: ${todayStr}
- gotokal/yesterday: আগের দিন
- "got masher X tarikh": আগের মাসের X তারিখ
- "X din age": X দিন আগে

💳 Account:
- bkash/bikash → "bKash"
- nagad → "Nagad"
- card → "Card"
- bank → "Bank"
- না বললে → null

✅ ক্লিয়ার হলে সরাসরি JSON:
{"type":"expense","amount":500,"category":"transport","description":"রিকশা ভাড়া","transaction_date":"${todayStr}","account_name":null}

❓ কনফিউজড হলে (amount বা type unclear):
{"confirm":true,"type":"expense","amount":500,"category":"transport","description":"রিকশা ভাড়া?","transaction_date":"${todayStr}","account_name":null,"question":"আপনি কি ৫০০ টাকা রিকশা ভাড়া খরচ যোগ করতে চান?"}

🎯 উদাহরণ:
"500 tk rikshaw" → {"type":"expense","amount":500,"category":"transport","description":"রিকশা ভাড়া","transaction_date":"${todayStr}","account_name":null}
"uber 150" → {"type":"expense","amount":150,"category":"transport","description":"উবার","transaction_date":"${todayStr}","account_name":null}
"bkash e 1000 pelam" → {"type":"income","amount":1000,"category":"others","description":"বিকাশে পেয়েছি","transaction_date":"${todayStr}","account_name":"bKash"}
"ami gotokal 300 tk khoroj korchi" → expense, 300, others, তারিখ = yesterday

⚠️ নিয়ম:
1. সহজ বাক্য = সরাসরি JSON (confirm:false বা confirm নেই)
2. অস্পষ্ট হলে = confirm:true + question দাও
3. amount MUST be number
4. লেনদেন না বুঝলে বাংলায় জিজ্ঞেস করো`;

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
