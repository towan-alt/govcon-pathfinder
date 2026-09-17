const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const OPTIONS = [
  {
    id: "strategy-session",
    name: "Free 15-Minute Strategy Session",
    price: "Free",
    href: "/book",
  },
  {
    id: "masterclass",
    name: "Monthly GovCon Masterclass",
    price: "$197/month",
    href: "/#masterclass",
  },
  {
    id: "vip",
    name: "VIP Done-For-You Strategy Engagement",
    price: "$997",
    href: "/#vip-dfy",
  },
];

const SYSTEM = `You are an advisor for GoGovCon, Towan Isom's government contracting coaching practice.
You recommend exactly one starting option for a small business owner, based on their answers.

The three options are:
1. "strategy-session" — Free 15-minute strategy session. Best for beginners, the unregistered, the unsure, and anyone who has never bid.
2. "masterclass" — $197/month live monthly masterclass. Best for people who are registered and want to learn the process steadily on their own time, on a modest budget.
3. "vip" — $997 VIP done-for-you engagement. Best for people who are registered, have real revenue or urgency, and want deliverables built for them fast.

Write in plain, warm, direct language. No jargon, no acronyms without a short explanation.
Reference their stated work area and goal specifically.`;

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["recommended_id", "headline", "why", "next_steps", "also_consider"],
  properties: {
    recommended_id: { type: "string", enum: ["strategy-session", "masterclass", "vip"] },
    headline: { type: "string", description: "One short sentence naming the best starting point." },
    why: { type: "string", description: "2-3 sentences on why this fits their goal and work area." },
    next_steps: {
      type: "array",
      description: "3 to 4 concrete next steps, each one short sentence.",
      items: { type: "string" },
    },
    also_consider: {
      type: ["string", "null"],
      description: "One sentence about a second option worth keeping in mind, or null.",
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const apiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "AI is not configured." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { goal, naicsArea, stage, experience, budget, timeline } = await req.json();

    const prompt = `Here are the business owner's answers. Reply with json matching the schema.
Main goal: ${goal ?? "not given"}
Work area / NAICS area: ${naicsArea ?? "not given"}
Where they are today: ${stage ?? "not given"}
Bidding experience: ${experience ?? "not given"}
Budget comfort: ${budget ?? "not given"}
Timeline: ${timeline ?? "not given"}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        instructions: SYSTEM,
        input: prompt,
        reasoning: { effort: "low", summary: "auto" },
        store: false,
        text: {
          format: {
            type: "json_schema",
            name: "service_fit",
            strict: true,
            schema,
          },
        },
      }),
    });

    if (!res.ok || !res.body) {
      const detail = await res.text();
      console.error("AI gateway error:", res.status, detail);
      return new Response(
        JSON.stringify({ error: "The recommendation service is unavailable right now.", status: res.status }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Read the SSE stream and accumulate the final text.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let text = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const evt = JSON.parse(payload);
          if (evt.type === "response.output_text.delta" && typeof evt.delta === "string") {
            text += evt.delta;
          } else if (evt.type === "response.completed" && evt.response?.output_text) {
            text = evt.response.output_text;
          }
        } catch {
          // ignore keep-alive / partial frames
        }
      }
    }

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Unparsable model output:", text.slice(0, 500));
    }

    if (!parsed || typeof parsed.recommended_id !== "string") {
      return new Response(
        JSON.stringify({ error: "Could not build a recommendation. Please try again." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const option = OPTIONS.find((o) => o.id === parsed!.recommended_id) ?? OPTIONS[0];

    return new Response(JSON.stringify({ ...parsed, option }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("fit-quiz error:", e instanceof Error ? e.message : String(e));
    return new Response(JSON.stringify({ error: "Unexpected error." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
