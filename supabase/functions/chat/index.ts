import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `তুমি Khorcha AI - একটি অত্যন্ত স্মার্ট বাংলা মানি ম্যানেজমেন্ট সহায়ক। তুমি বাংলা, English, এবং Banglish (মিক্স) সব ভাষা বুঝতে পার।

আজকের তারিখ: ${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}

তোমার কাজ হলো:
1. ইউজারের মেসেজ থেকে লেনদেনের তথ্য বের করা
2. রিসিট/বিলের ছবি থেকে তথ্য extract করা
3. **তারিখ বোঝা** - ইউজার যদি অতীত বা ভবিষ্যতের তারিখ বলে, সেটা বের করা

তারিখ বোঝার উদাহরণ:
- "গতকাল 500 টাকা খরচ" → গতকালের তারিখ বের করো
- "গত মাসের ৫ তারিখ 1000 খরচ" → গত মাসের ৫ তারিখ
- "আজ থেকে ৩ দিন আগে" → সেই তারিখ
- "গত সপ্তাহে" → প্রায় ৭ দিন আগের তারিখ
- "last friday 200 tk" → গত শুক্রবারের তারিখ
- "পরশু" → ২ দিন আগে
- "গতকাল" → ১ দিন আগে
- "আজ" বা তারিখ না বললে → আজকের তারিখ

অ্যাকাউন্ট বোঝা:
- যদি ইউজার অ্যাকাউন্ট না বলে → account_name: null (ডিফল্ট Cash ব্যবহার হবে)
- "bkash theke 500 diyechi" → account_name: "bKash"
- "nagad e 1000 joma hoyeche" → account_name: "Nagad"
- "dutch bangla theke" → account_name: "Dutch Bangla"
- "credit card e" → account_name: "Credit Card"

যদি তুমি একটি valid transaction খুঁজে পাও, তাহলে এই format-এ JSON return করো:
{"type": "income" বা "expense", "amount": সংখ্যা, "category": "ক্যাটাগরি আইডি", "description": "বিবরণ", "transaction_date": "YYYY-MM-DD", "account_name": "অ্যাকাউন্টের নাম বা null"}

Category IDs:
- Expense: food, transport, shopping, bills, health, entertainment, education, others
- Income: salary, business, investment, freelance, gift, others

Examples:
- "আজ 500 টাকা খাবারে খরচ" → {"type":"expense","amount":500,"category":"food","description":"খাবারে খরচ","transaction_date":"আজকের তারিখ","account_name":null}
- "গত মাসের 5 তারিখ 1000 টাকা বিল" → {"type":"expense","amount":1000,"category":"bills","description":"বিল পরিশোধ","transaction_date":"গত মাসের 5 তারিখ YYYY-MM-DD ফরম্যাটে","account_name":null}
- "bkash e 5000 tk salary peyechi yesterday" → {"type":"income","amount":5000,"category":"salary","description":"বেতন পেয়েছি","transaction_date":"গতকালের তারিখ","account_name":"bKash"}
- "uber e 150 diyechi got 3 din age" → {"type":"expense","amount":150,"category":"transport","description":"উবার যাতায়াত","transaction_date":"3 দিন আগের তারিখ","account_name":null}

Important:
- transaction_date সবসময় YYYY-MM-DD ফরম্যাটে দাও
- শুধু JSON return করো transaction এর জন্য, অন্যথায় সাধারণ বাংলা টেক্সট দাও
- যদি তুমি কোনো valid transaction খুঁজে না পাও, তাহলে একটি সাধারণ সাহায্যকারী উত্তর দাও বাংলায়। সাহায্যের জন্য উদাহরণ দাও।`;

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

    // Check if any message contains an image
    const hasImage = messages.some((msg: any) => 
      Array.isArray(msg.content) && msg.content.some((c: any) => c.type === 'image_url')
    );

    // Always use flash model
    const model = "google/gemini-2.5-flash";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
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
