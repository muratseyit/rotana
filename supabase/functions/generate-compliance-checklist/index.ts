import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const businessSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  businessDescription: z.string().trim().min(1).max(5000),
  industry: z.string().trim().max(100).optional(),
  websiteUrl: z.string().url().max(500).nullable().optional()
});

const requestSchema = z.object({
  business: businessSchema,
  catalogText: z.string().max(10000).optional()
});

interface RegulatoryUpdate {
  title: string;
  description: string;
  effectiveDate?: string;
  source: string;
  relevance: 'high' | 'medium' | 'low';
  category: string;
}

interface Partner {
  id: string;
  name: string;
  url: string;
  specialty: string[];
}

// Embedded partner pool as fallback
const verifiedPartnerPool: Partner[] = [
  { id: "p1", name: "Northstar Data Compliance", url: "https://example.com/northstar", specialty: ["GDPR","ICO","DPIA","Privacy Policies"] },
  { id: "p2", name: "Atlas Conformity Assessors", url: "https://example.com/atlas", specialty: ["UKCA","CE","Product Safety","Technical File"] },
  { id: "p3", name: "RegWorks MHRA Advisory", url: "https://example.com/regworks", specialty: ["MHRA","Medical Devices","Pharma"] },
  { id: "p4", name: "Shield PenTest & PCI", url: "https://example.com/shield", specialty: ["PCI DSS","Cybersecurity","PenTest"] },
  { id: "p5", name: "Crown Trade Compliance", url: "https://example.com/crown", specialty: ["Trading Standards","Consumer Contracts","ADR"] },
];

// Fetch live regulatory updates using Perplexity
async function fetchRegulatoryUpdates(
  perplexityApiKey: string, 
  industry: string, 
  businessDescription: string
): Promise<{ updates: RegulatoryUpdate[]; sources: string[] }> {
  try {
    console.log(`Fetching live regulatory updates for: ${industry}`);
    
    const query = `What are the most important UK regulatory changes and compliance updates in 2024-2025 for ${industry} businesses exporting to the UK? Include specific new requirements, deadline changes, enforcement actions, and official guidance updates. Focus on GDPR, UKCA, product safety, and sector-specific regulations.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { 
            role: 'system', 
            content: 'You are a UK regulatory compliance expert. Provide specific, recent regulatory updates with sources. Be precise about dates and requirements.'
          },
          { role: 'user', content: query }
        ],
        search_recency_filter: 'month',
      }),
    });

    if (!response.ok) {
      console.error('Perplexity API error for regulations:', response.status);
      return { updates: [], sources: [] };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    // Parse regulatory updates from response
    const structurePrompt = `Extract regulatory updates from this text into JSON array format:
${content}

Return ONLY valid JSON (no markdown):
[{"title": "string", "description": "string", "effectiveDate": "string or null", "source": "string", "relevance": "high|medium|low", "category": "string"}]`;

    const structureResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'Extract data into JSON. Return ONLY valid JSON array.' },
          { role: 'user', content: structurePrompt }
        ],
      }),
    });

    if (!structureResponse.ok) {
      return { updates: [], sources: citations };
    }

    const structureData = await structureResponse.json();
    let parsed = structureData.choices?.[0]?.message?.content || '[]';
    
    // Clean markdown if present
    parsed = parsed.trim();
    if (parsed.startsWith('```json')) parsed = parsed.slice(7);
    if (parsed.startsWith('```')) parsed = parsed.slice(3);
    if (parsed.endsWith('```')) parsed = parsed.slice(0, -3);
    
    const updates = JSON.parse(parsed.trim());
    return { updates: Array.isArray(updates) ? updates.slice(0, 5) : [], sources: citations };
    
  } catch (error) {
    console.error('Error fetching regulatory updates:', error);
    return { updates: [], sources: [] };
  }
}

// Discover real partners using Perplexity
async function discoverPartners(
  perplexityApiKey: string,
  specialty: string,
  industry: string
): Promise<Partner | undefined> {
  try {
    const query = `What are the top UK-based ${specialty} consultants or firms that help Turkish businesses enter the UK market? Include company names and websites.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'You are a business consultant. Return real UK service providers.' },
          { role: 'user', content: query }
        ],
      }),
    });

    if (!response.ok) return undefined;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Extract first company name and URL if mentioned
    const urlMatch = content.match(/https?:\/\/[^\s)]+/);
    const nameMatch = content.match(/([A-Z][a-zA-Z&\s]+(?:Ltd|LLP|Limited|Consultants|Advisory|Partners))/);
    
    if (nameMatch) {
      return {
        id: `live-${Date.now()}`,
        name: nameMatch[1].trim(),
        url: urlMatch?.[0] || '',
        specialty: [specialty]
      };
    }
    
    return undefined;
  } catch (error) {
    console.error('Error discovering partners:', error);
    return undefined;
  }
}

function pickPartner(tags: string[], businessInfo?: any): { name: string; url: string; score: number } | undefined {
  const tagSet = new Set(tags.map(t => t.toUpperCase()));
  
  const scoredPartners = verifiedPartnerPool.map(partner => {
    let score = 0;
    let matches = 0;
    
    partner.specialty.forEach(spec => {
      if (tagSet.has(spec.toUpperCase())) {
        matches++;
        score += 10;
      }
    });
    
    if (matches > 1) score += matches * 5;
    
    if (businessInfo?.industry) {
      const industry = businessInfo.industry.toLowerCase();
      if (industry.includes('health') && partner.specialty.some(s => s.includes('MHRA'))) score += 15;
      if (industry.includes('data') && partner.specialty.some(s => s.includes('GDPR'))) score += 15;
      if (industry.includes('finance') && partner.specialty.some(s => s.includes('PCI'))) score += 15;
    }
    
    return { ...partner, score };
  }).filter(p => p.score > 0);
  
  const bestMatch = scoredPartners.sort((a, b) => b.score - a.score)[0];
  return bestMatch ? { name: bestMatch.name, url: bestMatch.url, score: bestMatch.score } : undefined;
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
    const rawBody = await req.json();
    const validationResult = requestSchema.safeParse(rawBody);
    
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: "Invalid input", details: validationResult.error.errors.map(e => e.message) }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { business, catalogText } = validationResult.data;

    const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
    const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
    
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: "Missing OPENAI_API_KEY" }), 
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch live regulatory updates if Perplexity is available
    let regulatoryUpdates: RegulatoryUpdate[] = [];
    let regulatorySources: string[] = [];
    
    if (perplexityApiKey) {
      const regData = await fetchRegulatoryUpdates(
        perplexityApiKey, 
        business.industry || 'general',
        business.businessDescription
      );
      regulatoryUpdates = regData.updates;
      regulatorySources = regData.sources;
      console.log(`Fetched ${regulatoryUpdates.length} live regulatory updates`);
    }

    // Build enhanced prompt with live regulatory context
    const regulatoryContext = regulatoryUpdates.length > 0 
      ? `\n\nRecent UK Regulatory Updates (from live research):\n${regulatoryUpdates.map(u => 
          `- ${u.title}: ${u.description} (${u.relevance} relevance, ${u.category})`
        ).join('\n')}`
      : '';

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
${regulatoryContext}

Rules:
- Output MUST be valid JSON only and match the schema below.
- Each item: include category, requirement, description, law, priority in {high|medium|low}, and 1-3 official resources URLs.
- Focus strictly on UK context. If a regime is not relevant, omit it.
- Incorporate any recent regulatory updates mentioned above.

JSON schema:
{
  "inferredIndustry": string,
  "inferredProductTypes": string[],
  "items": [
    {
      "id": string,
      "category": string,
      "requirement": string,
      "description": string,
      "law": string,
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
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in model response");
    const parsed = JSON.parse(match[0]);

    // Enrich items with partners (using live discovery if available)
    const enrichedItems = await Promise.all((parsed.items || []).map(async (item: any) => {
      let partner = pickPartner([item.law, item.category], business);
      
      // Try live partner discovery for high-priority items if no embedded match
      if (!partner && perplexityApiKey && item.priority === 'high') {
        const livePartner = await discoverPartners(perplexityApiKey, item.law, business.industry || '');
        if (livePartner) {
          partner = { name: livePartner.name, url: livePartner.url, score: 5 };
        }
      }
      
      const deadlineDays = daysByPriority(item.priority);
      return { ...item, partner, deadlineDays };
    }));

    const result = {
      inferredIndustry: parsed.inferredIndustry,
      inferredProductTypes: parsed.inferredProductTypes,
      items: enrichedItems,
      regulatoryUpdates: regulatoryUpdates.length > 0 ? regulatoryUpdates : undefined,
      metadata: {
        hasLiveData: regulatoryUpdates.length > 0,
        sources: regulatorySources,
        generatedAt: new Date().toISOString()
      }
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
