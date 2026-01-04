import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const RequestSchema = z.object({
  industry: z.string().min(1).max(100),
  businessDescription: z.string().max(1000).optional(),
  productNiche: z.string().max(200).optional(),
  targetMarket: z.string().default('UK'),
});

interface Competitor {
  name: string;
  website?: string;
  description: string;
  positioning: string;
  marketShare?: string;
  pricePoint?: string;
  strengths: string[];
  weaknesses: string[];
  relevanceScore: number;
}

interface CompetitorResearchResult {
  competitors: Competitor[];
  marketInsights: {
    totalMarketPlayers: string;
    marketConcentration: string;
    entryBarriers: string[];
    differentiationOpportunities: string[];
  };
  sources: string[];
  researchedAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const validationResult = RequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationResult.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { industry, businessDescription, productNiche, targetMarket } = validationResult.data;
    
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Competitor research service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting competitor research for: ${industry} in ${targetMarket}`);

    // Build competitor research query
    const nicheContext = productNiche ? ` specifically in ${productNiche}` : '';
    const descContext = businessDescription ? ` The business focuses on: ${businessDescription}` : '';
    
    const competitorQuery = `Who are the top 5-7 competitors in the ${targetMarket} ${industry} market${nicheContext}?${descContext}

For each competitor, provide:
- Company name and website
- Brief description of their business
- Market positioning (premium, mid-market, budget)
- Approximate market share or size indicator
- Key strengths (2-3 points)
- Notable weaknesses or gaps (1-2 points)

Also include overall market insights:
- Approximate number of total players
- Market concentration (fragmented vs consolidated)
- Main entry barriers for new entrants
- Potential differentiation opportunities`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-pro', // Use pro for deeper research
        messages: [
          { 
            role: 'system', 
            content: 'You are a competitive intelligence analyst specializing in UK markets. Provide detailed, factual competitor analysis with specific company names and data. Be precise and cite sources when available.'
          },
          { role: 'user', content: competitorQuery }
        ],
        search_recency_filter: 'year',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Perplexity API error: ${response.status}`, errorText);
      throw new Error(`Competitor research failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const citations = data.citations || [];

    // Structure the response using Perplexity
    const structurePrompt = `Based on this competitor research, extract and structure the data into JSON format.

Research Data:
${content}

Return ONLY valid JSON (no markdown code blocks):
{
  "competitors": [
    {
      "name": "Company Name",
      "website": "https://...",
      "description": "Brief description",
      "positioning": "premium|mid-market|budget",
      "marketShare": "e.g., ~15% or 'significant'",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["weakness1"],
      "relevanceScore": 1-10
    }
  ],
  "marketInsights": {
    "totalMarketPlayers": "e.g., 50+",
    "marketConcentration": "fragmented|moderate|consolidated",
    "entryBarriers": ["barrier1", "barrier2"],
    "differentiationOpportunities": ["opportunity1", "opportunity2"]
  }
}`;

    const structureResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          { role: 'system', content: 'Extract data into the exact JSON format. Return ONLY valid JSON.' },
          { role: 'user', content: structurePrompt }
        ],
      }),
    });

    if (!structureResponse.ok) {
      console.error('Failed to structure competitor results');
      // Return raw insights as fallback
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            competitors: [],
            marketInsights: {
              totalMarketPlayers: 'Unknown',
              marketConcentration: 'Unknown',
              entryBarriers: [],
              differentiationOpportunities: []
            },
            rawInsights: content,
            sources: citations,
            researchedAt: new Date().toISOString()
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const structureData = await structureResponse.json();
    let parsedContent = structureData.choices?.[0]?.message?.content || '{}';
    
    // Clean markdown if present
    parsedContent = parsedContent.trim();
    if (parsedContent.startsWith('```json')) parsedContent = parsedContent.slice(7);
    if (parsedContent.startsWith('```')) parsedContent = parsedContent.slice(3);
    if (parsedContent.endsWith('```')) parsedContent = parsedContent.slice(0, -3);

    const parsed = JSON.parse(parsedContent.trim());

    const result: CompetitorResearchResult = {
      competitors: parsed.competitors || [],
      marketInsights: parsed.marketInsights || {
        totalMarketPlayers: 'Unknown',
        marketConcentration: 'Unknown',
        entryBarriers: [],
        differentiationOpportunities: []
      },
      sources: citations.slice(0, 5),
      researchedAt: new Date().toISOString()
    };

    console.log(`Competitor research complete: ${result.competitors.length} competitors found`);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
        industry,
        targetMarket
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Competitor research error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Research failed',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
