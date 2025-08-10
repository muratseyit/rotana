import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GenerateRequest {
  business: {
    companyName: string;
    businessDescription: string;
    industry?: string;
    websiteUrl?: string | null;
  };
  catalogText?: string;
}

interface Partner {
  id: string;
  name: string;
  url: string;
  specialty: string[]; // tags like ["GDPR","UKCA","MHRA","ICO","Cybersecurity"]
}

// MVP verified partner pool (mocked)
const verifiedPartnerPool: Partner[] = [
  { id: "p1", name: "Northstar Data Compliance", url: "https://example.com/northstar", specialty: ["GDPR","ICO","DPIA","Privacy Policies"] },
  { id: "p2", name: "Atlas Conformity Assessors", url: "https://example.com/atlas", specialty: ["UKCA","CE","Product Safety","Technical File"] },
  { id: "p3", name: "RegWorks MHRA Advisory", url: "https://example.com/regworks", specialty: ["MHRA","Medical Devices","Pharma"] },
  { id: "p4", name: "Shield PenTest & PCI", url: "https://example.com/shield", specialty: ["PCI DSS","Cybersecurity","PenTest"] },
  { id: "p5", name: "Crown Trade Compliance", url: "https://example.com/crown", specialty: ["Trading Standards","Consumer Contracts","ADR"] },
];

function pickPartner(tags: string[]): { name: string; url: string } | undefined {
  const tagSet = new Set(tags.map(t => t.toUpperCase()));
  const match = verifiedPartnerPool.find(p => p.specialty.some(s => tagSet.has(s.toUpperCase())));
  return match ? { name: match.name, url: match.url } : undefined;
}

function daysByPriority(priority: string): number {
  switch (priority) {
    case "high": return 30;
    case "medium": return 60;
    default: return 90;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { business, catalogText }: GenerateRequest = await req.json();

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Build prompt with clear JSON schema instruction
    const system = "You are a UK compliance expert generating actionable checklists for market entry.";
    const userPrompt = `
Given this business profile and product catalog (if present), infer the precise UK industry and product types, then generate a concise, prioritized compliance checklist covering applicable UK regimes (GDPR/ICO, CE/UKCA, MHRA (if medical), Trading Standards/Consumer Contracts, PCI DSS, HSE, FCA (if financial), etc.).

Business:
- Company: ${business.companyName}
- Description: ${business.businessDescription}
- Provided industry: ${business.industry ?? "unknown"}
- Website: ${business.websiteUrl ?? "none"}

Catalog (free text, may be empty):
${catalogText ?? ""}

Rules:
- Output MUST be valid JSON only and match the schema below.
- Each item: include category, requirement, description, law, priority in {high|medium|low}, and 1-3 official resources URLs.
- Focus strictly on UK context. If a regime is not relevant, omit it.

JSON schema:
{
  "inferredIndustry": string,
  "inferredProductTypes": string[],
  "items": [
    {
      "id": string, // slug-like unique id
      "category": string,
      "requirement": string,
      "description": string,
      "law": string, // e.g., "GDPR", "UKCA", "MHRA", "Consumer Contracts Regulations"
      "priority": "high" | "medium" | "low",
      "resources": string[]
    }
  ]
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
      }),
    });

    const data = await response.json();
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error("No content from OpenAI");
    }

    const content: string = data.choices[0].message.content;
    // Extract JSON block
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in model response");
    const parsed = JSON.parse(match[0]);

    // Attach partner recommendations and default deadlines client can use
    const enrichedItems = (parsed.items || []).map((item: any) => {
      const partner = pickPartner([item.law, item.category]);
      const deadlineDays = daysByPriority(item.priority);
      return { ...item, partner, deadlineDays };
    });

    const result = {
      inferredIndustry: parsed.inferredIndustry,
      inferredProductTypes: parsed.inferredProductTypes,
      items: enrichedItems,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("generate-compliance-checklist error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
