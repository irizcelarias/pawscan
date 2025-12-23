import { serve } from "https://deno.land/std@0.168.0/http/server.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, imageBase64 } = await req.json();

    // =========================
    // 1) BREED DETECTION (Image) -> Lovable AI Gateway (keep this)
    // =========================
    if (type === "breed-detection") {
      const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
      if (!LOVABLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const systemPrompt = `You are a friendly pet expert specializing in breed identification. When analyzing a pet image:
• Identify the breed(s) with confidence percentages
• Provide key characteristics of the breed
• Share 2-3 fun facts about the breed
• Give care tips specific to this breed

Format your response in a friendly, conversational way. Use bullet points (•) instead of asterisks. Never use asterisks (*) for formatting. Keep it clean and readable.`;

      const userContent = [
        {
          type: "text",
          text: "Please analyze this pet photo and identify the breed. Share interesting details about this breed.",
        },
        {
          type: "image_url",
          image_url: { url: imageBase64 },
        },
      ];

      const response = await fetch(
        "https://ai.gateway.lovable.dev/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userContent },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI Gateway error:", response.status, errorText);

        if (response.status === 429) {
          return new Response(
            JSON.stringify({
              error: "Rate limit exceeded. Please try again in a moment.",
            }),
            {
              status: 429,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ error: "Usage limit reached. Please add credits." }),
            {
              status: 402,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ error: `AI gateway error: ${response.status}` }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const data = await response.json();
      const aiResponse =
        data.choices?.[0]?.message?.content ||
        "I couldn't process that request. Please try again.";

      return new Response(JSON.stringify({ response: aiResponse }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // =========================
    // 2) CHAT (RAG) -> Flowise
    // =========================
    const FLOWISE_API_URL = Deno.env.get("FLOWISE_API_URL"); 
    // example: https://your-flowise-domain.com/api/v1/prediction/c7c7293d-f5d2-4fc5-8cdd-c95f858befca

    const FLOWISE_API_KEY = Deno.env.get("FLOWISE_API_KEY"); // optional

    if (!FLOWISE_API_URL) {
      return new Response(
        JSON.stringify({
          error:
            "FLOWISE_API_URL is not configured. Use a public Flowise URL, not localhost.",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!message || typeof message !== "string") {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Calling Flowise RAG chat...");

    const flowiseRes = await fetch(FLOWISE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(FLOWISE_API_KEY ? { Authorization: `Bearer ${FLOWISE_API_KEY}` } : {}),
      },
      body: JSON.stringify({
        question: message,
      }),
    });

    const flowiseText = await flowiseRes.text();

    if (!flowiseRes.ok) {
      console.error("Flowise error:", flowiseRes.status, flowiseText);
      return new Response(
        JSON.stringify({
          error: `Flowise error: ${flowiseRes.status}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Flowise usually returns JSON with "text" or "answer"
    let parsed: any = {};
    try {
      parsed = JSON.parse(flowiseText);
    } catch {
      // sometimes it returns plain text
      parsed = { text: flowiseText };
    }

    const answer =
      parsed.text ||
      parsed.answer ||
      parsed.response ||
      (typeof parsed === "string" ? parsed : "") ||
      "No response from Flowise.";

    return new Response(JSON.stringify({ response: answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in pet-ai function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unexpected error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
