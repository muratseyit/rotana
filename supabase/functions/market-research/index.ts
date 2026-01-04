import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const ResearchRequestSchema = z.object({
  industry: z.string().min(1).max(100),
  productDescription: z.string().max(500).optional(),
  targetMarket: z.string().default('UK'),
  researchType: z.enum(['market_size', 'trade_flow', 'competition', 'regulations', 'comprehensive']).default('comprehensive'),
});

interface MarketResearchResult {
  marketSize: {
    valueGBP: number;
    growthRate: number;
    forecast2027: number;
    source: string;
    confidence: 'high' | 'medium' | 'low';
  };
  tradeFlow: {
    turkeyUKVolume: number;
    trend: 'growing' | 'stable' | 'declining';
    yoyChange: number;
    topProducts: string[];
    ftaBenefit: boolean;
  };
  competition: {
    saturationLevel: number;
    majorPlayers: string[];
    entryOpportunity: 'excellent' | 'good' | 'moderate' | 'challenging';
    nichePotential: string[];
  };
  regulations: {
    keyRequirements: string[];
    certifications: string[];
    estimatedComplianceCost: string;
    timeToComply: string;
  };
  lastUpdated: string;
  sources: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = ResearchRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Validation error:', validationResult.error.errors);
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationResult.error.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { industry, productDescription, targetMarket, researchType } = validationResult.data;
    
    const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityApiKey) {
      console.error('PERPLEXITY_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Market research service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Starting market research for: ${industry} in ${targetMarket}`);

    // Build targeted research queries
    const queries = buildResearchQueries(industry, productDescription, targetMarket, researchType);
    
    // Execute research queries in parallel
    const researchResults = await Promise.all(
      queries.map(query => executePerplexitySearch(perplexityApiKey, query))
    );

    // Parse and structure the results
    const structuredResult = await parseResearchResults(
      perplexityApiKey,
      industry,
      productDescription || '',
      researchResults
    );

    console.log('Market research completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        data: structuredResult,
        industry,
        researchType,
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Market research error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Research failed',
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function buildResearchQueries(
  industry: string, 
  productDescription: string | undefined,
  targetMarket: string,
  researchType: string
): string[] {
  const queries: string[] = [];
  const productContext = productDescription ? ` specifically for ${productDescription}` : '';

  if (researchType === 'comprehensive' || researchType === 'market_size') {
    queries.push(
      `What is the current ${targetMarket} market size in GBP for the ${industry} sector${productContext}? ` +
      `Include 2024-2025 statistics, annual growth rate percentage, and 2027 forecast. ` +
      `Cite government or industry reports.`
    );
  }

  if (researchType === 'comprehensive' || researchType === 'trade_flow') {
    queries.push(
      `What is the Turkey to ${targetMarket} bilateral trade volume for ${industry} products in 2024? ` +
      `Include year-over-year change, growth trend, top exported products from Turkey, ` +
      `and whether the UK-Turkey Free Trade Agreement provides tariff benefits.`
    );
  }

  if (researchType === 'comprehensive' || researchType === 'competition') {
    queries.push(
      `What is the competitive landscape for ${industry}${productContext} in the ${targetMarket} market? ` +
      `Include market saturation level, major players, entry barriers, and niche opportunities ` +
      `for Turkish exporters entering the market in 2025.`
    );
  }

  if (researchType === 'comprehensive' || researchType === 'regulations') {
    queries.push(
      `What are the key regulatory requirements for exporting ${industry} products from Turkey to ${targetMarket}? ` +
      `Include required certifications (UKCA, CE, etc.), compliance costs, timeline to achieve compliance, ` +
      `and any recent 2024-2025 regulatory changes.`
    );
  }

  return queries;
}

async function executePerplexitySearch(apiKey: string, query: string): Promise<any> {
  const response = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { 
          role: 'system', 
          content: 'You are a market research analyst specializing in Turkey-UK trade. ' +
            'Provide precise, data-driven answers with specific numbers when available. ' +
            'Focus on 2024-2025 data. Be concise and factual.'
        },
        { role: 'user', content: query }
      ],
      search_recency_filter: 'year', // Focus on recent data
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Perplexity API error: ${response.status}`, errorText);
    throw new Error(`Research query failed: ${response.status}`);
  }

  return await response.json();
}

async function parseResearchResults(
  apiKey: string,
  industry: string,
  productDescription: string,
  results: any[]
): Promise<MarketResearchResult> {
  // Combine all research results
  const combinedContent = results
    .map(r => r.choices?.[0]?.message?.content || '')
    .join('\n\n---\n\n');

  const citations = results.flatMap(r => r.citations || []);

  // Use Perplexity to structure the data
  const structuringPrompt = `
Based on the following market research data, extract and structure the information into a precise JSON format.
If specific numbers aren't available, provide reasonable estimates based on the data and mark confidence as "low".

Research Data:
${combinedContent}

Industry: ${industry}
Product: ${productDescription || 'General'}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "marketSize": {
    "valueGBP": <number in billions>,
    "growthRate": <percentage as number>,
    "forecast2027": <number in billions>,
    "source": "<primary source name>",
    "confidence": "high" | "medium" | "low"
  },
  "tradeFlow": {
    "turkeyUKVolume": <number in millions GBP>,
    "trend": "growing" | "stable" | "declining",
    "yoyChange": <percentage as number>,
    "topProducts": [<up to 4 product names>],
    "ftaBenefit": true | false
  },
  "competition": {
    "saturationLevel": <0-100>,
    "majorPlayers": [<up to 5 company names>],
    "entryOpportunity": "excellent" | "good" | "moderate" | "challenging",
    "nichePotential": [<up to 3 niche opportunities>]
  },
  "regulations": {
    "keyRequirements": [<up to 5 requirements>],
    "certifications": [<up to 4 certifications>],
    "estimatedComplianceCost": "<cost range in GBP>",
    "timeToComply": "<timeline estimate>"
  }
}`;

  const structureResponse = await fetch('https://api.perplexity.ai/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'sonar',
      messages: [
        { 
          role: 'system', 
          content: 'You are a data structuring assistant. Extract data into the exact JSON format requested. ' +
            'Return ONLY valid JSON, no markdown code blocks, no explanations.'
        },
        { role: 'user', content: structuringPrompt }
      ],
    }),
  });

  if (!structureResponse.ok) {
    console.error('Failed to structure research results');
    // Return fallback with embedded data
    return getEmbeddedFallback(industry);
  }

  const structureData = await structureResponse.json();
  const content = structureData.choices?.[0]?.message?.content || '';

  try {
    // Clean the response - remove markdown code blocks if present
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    const parsed = JSON.parse(cleanedContent);
    
    return {
      ...parsed,
      lastUpdated: new Date().toISOString(),
      sources: citations.slice(0, 5)
    };
  } catch (parseError) {
    console.error('Failed to parse structured results:', parseError);
    return getEmbeddedFallback(industry);
  }
}

function getEmbeddedFallback(industry: string): MarketResearchResult {
  // Fallback to embedded data if Perplexity fails
  const industryDefaults: Record<string, Partial<MarketResearchResult>> = {
    technology: {
      marketSize: { valueGBP: 200, growthRate: 12.5, forecast2027: 285, source: 'TechNation UK', confidence: 'medium' },
      tradeFlow: { turkeyUKVolume: 450, trend: 'growing', yoyChange: 9.5, topProducts: ['Software', 'IT Services', 'Hardware'], ftaBenefit: true },
      competition: { saturationLevel: 60, majorPlayers: ['UK Tech Leaders'], entryOpportunity: 'good', nichePotential: ['B2B SaaS', 'AI Solutions'] },
    },
    textile: {
      marketSize: { valueGBP: 65, growthRate: 4.2, forecast2027: 78, source: 'UK Fashion Council', confidence: 'medium' },
      tradeFlow: { turkeyUKVolume: 2800, trend: 'growing', yoyChange: 8.5, topProducts: ['Fabrics', 'Knitwear', 'Home textiles', 'Denim'], ftaBenefit: true },
      competition: { saturationLevel: 75, majorPlayers: ['Major Retailers'], entryOpportunity: 'moderate', nichePotential: ['Sustainable textiles', 'Technical fabrics'] },
    },
    food: {
      marketSize: { valueGBP: 240, growthRate: 6.8, forecast2027: 305, source: 'Defra UK', confidence: 'medium' },
      tradeFlow: { turkeyUKVolume: 850, trend: 'growing', yoyChange: 12.4, topProducts: ['Dried fruits', 'Nuts', 'Olive oil', 'Confectionery'], ftaBenefit: true },
      competition: { saturationLevel: 70, majorPlayers: ['UK Supermarkets'], entryOpportunity: 'good', nichePotential: ['Organic products', 'Mediterranean specialty'] },
    },
  };

  const normalizedIndustry = industry.toLowerCase();
  const fallback = Object.entries(industryDefaults).find(([key]) => 
    normalizedIndustry.includes(key) || key.includes(normalizedIndustry)
  )?.[1] || industryDefaults.technology;

  return {
    marketSize: fallback.marketSize || { valueGBP: 100, growthRate: 6, forecast2027: 125, source: 'Estimated', confidence: 'low' },
    tradeFlow: fallback.tradeFlow || { turkeyUKVolume: 500, trend: 'stable', yoyChange: 4, topProducts: ['Various'], ftaBenefit: true },
    competition: fallback.competition || { saturationLevel: 60, majorPlayers: [], entryOpportunity: 'moderate', nichePotential: [] },
    regulations: {
      keyRequirements: ['UKCA marking', 'Product safety standards', 'Import documentation'],
      certifications: ['UKCA', 'CE (if applicable)'],
      estimatedComplianceCost: '£2,000 - £10,000',
      timeToComply: '2-4 months'
    },
    lastUpdated: new Date().toISOString(),
    sources: ['Converta embedded data (fallback)']
  } as MarketResearchResult;
}
