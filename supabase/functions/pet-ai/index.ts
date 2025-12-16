import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, message, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userContent: any[] = [];

    if (type === "breed-detection") {
      systemPrompt = `You are a friendly pet expert specializing in breed identification. When analyzing a pet image:
• Identify the breed(s) with confidence percentages
• Provide key characteristics of the breed
• Share 2-3 fun facts about the breed
• Give care tips specific to this breed

Format your response in a friendly, conversational way. Use bullet points (•) instead of asterisks. Never use asterisks (*) for formatting. Keep it clean and readable.`;

      userContent = [
        {
          type: "text",
          text: "Please analyze this pet photo and identify the breed. Share interesting details about this breed."
        },
        {
          type: "image_url",
          image_url: { url: imageBase64 }
        }
      ];
    } else {
      // Chat mode for pet questions
      systemPrompt = `You are a friendly and knowledgeable pet care assistant. You help pet owners with questions about:
• What foods are safe or toxic for their pets
• Health and wellness tips
• Training advice
• Breed-specific care
• Nutrition recommendations
• General pet care

Keep responses helpful, concise, and easy to understand. Use bullet points (•) instead of asterisks for lists. Never use asterisks (*) for formatting or emphasis. Be warm and supportive. When suggesting foods or products, always mention any potential risks.`;

      userContent = [{ type: "text", text: message }];
    }

    console.log("Calling Lovable AI Gateway with type:", type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || "I couldn't process that request. Please try again.";

    console.log("AI response received successfully");

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("Error in pet-ai function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
