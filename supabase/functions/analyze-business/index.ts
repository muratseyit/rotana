import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { scrapeWebsite } from '../_shared/website-scraper.ts';

// Industry benchmarks for UK market comparison
interface IndustryBenchmark {
  industry: string;
  averageGrowthRate: number;
  marketSize: string;
  competitionLevel: 'low' | 'medium' | 'high';
  digitalAdoptionRate: number;
  averageMargins: number;
}

const UK_INDUSTRY_BENCHMARKS: Record<string, IndustryBenchmark> = {
  'Technology & Software': {
    industry: 'Technology & Software',
    averageGrowthRate: 12.5,
    marketSize: '£200B',
    competitionLevel: 'high',
    digitalAdoptionRate: 95,
    averageMargins: 25
  },
  'Retail & E-commerce': {
    industry: 'Retail & E-commerce',
    averageGrowthRate: 8.3,
    marketSize: '£450B',
    competitionLevel: 'high',
    digitalAdoptionRate: 85,
    averageMargins: 15
  },
  'Manufacturing': {
    industry: 'Manufacturing',
    averageGrowthRate: 5.2,
    marketSize: '£180B',
    competitionLevel: 'medium',
    digitalAdoptionRate: 65,
    averageMargins: 18
  },
  'Professional Services': {
    industry: 'Professional Services',
    averageGrowthRate: 7.8,
    marketSize: '£220B',
    competitionLevel: 'medium',
    digitalAdoptionRate: 80,
    averageMargins: 22
  },
  'default': {
    industry: 'General',
    averageGrowthRate: 7.5,
    marketSize: '£100B',
    competitionLevel: 'medium',
    digitalAdoptionRate: 70,
    averageMargins: 20
  }
};

function getIndustryBenchmark(industry: string): IndustryBenchmark {
  return UK_INDUSTRY_BENCHMARKS[industry] || UK_INDUSTRY_BENCHMARKS['default'];
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const businessSchema = z.object({
  companyName: z.string().trim().min(1).max(200),
  businessDescription: z.string().trim().min(1).max(5000),
  industry: z.string().min(1).max(100),
  companySize: z.string().max(100),
  websiteUrl: z.string().url().max(500).optional().or(z.literal("")),
  financialMetrics: z.object({
    annualRevenue: z.number().min(0).max(1000000000000),
    grossMargin: z.number().min(0).max(100),
    netProfit: z.number().min(-1000000000000).max(1000000000000),
    monthlyGrowthRate: z.number().min(-100).max(1000),
    cashPosition: z.number().min(0).max(1000000000000),
    fundingStage: z.string().max(100),
    exportPercentage: z.number().min(0).max(100),
    avgOrderValue: z.number().min(0).max(1000000000),
    customerAcquisitionCost: z.number().min(0).max(1000000000),
    customerLifetimeValue: z.number().min(0).max(1000000000)
  }).optional(),
  complianceStatus: z.any().optional()
});

const isSafeUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    // Block localhost, private IPs, and internal addresses
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '10.', '192.168.', '172.16.'];
    if (blockedHosts.some(blocked => hostname.includes(blocked))) {
      return false;
    }
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Validate input data
    const validated = businessSchema.parse(requestData);
    
    // Validate website URL to prevent SSRF
    if (validated.websiteUrl && !isSafeUrl(validated.websiteUrl)) {
      throw new Error("Invalid or unsafe website URL provided");
    }
    
    console.log('Received business analysis request:', {
      companyName: validated.companyName,
      industry: validated.industry,
      hasWebsite: !!validated.websiteUrl
    });

    const {
      companyName,
      businessDescription,
      industry,
      companySize,
      websiteUrl,
      financialMetrics,
      complianceStatus
    } = validated;

    // Scrape website if URL provided
    let websiteAnalysis = null;
    if (websiteUrl && isSafeUrl(websiteUrl)) {
      console.log('Scraping website content...');
      websiteAnalysis = await scrapeWebsite(websiteUrl);
      if (websiteAnalysis) {
        console.log('Website scraping successful');
      } else {
        console.log('Website scraping failed, continuing with URL only');
      }
    }

    // Get industry benchmark data for comparison
    const industryBenchmark = getIndustryBenchmark(industry);
    console.log(`Industry benchmark loaded for: ${industry}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get OpenAI API key
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Starting AI analysis...');

    // Create comprehensive analysis prompt with industry benchmarks
    const analysisPrompt = `You are a UK market entry expert analyzing a Turkish SME's readiness for UK market expansion.

BUSINESS INFORMATION:
Company: ${companyName}
Industry: ${industry}
Company Size: ${companySize}
Description: ${businessDescription}

UK MARKET CONTEXT FOR ${industry}:
- Market Size: ${industryBenchmark.marketSize}
- Average Growth Rate: ${industryBenchmark.averageGrowthRate}% per year
- Competition Level: ${industryBenchmark.competitionLevel.toUpperCase()}
- Digital Adoption Rate: ${industryBenchmark.digitalAdoptionRate}%
- Average Profit Margins: ${industryBenchmark.averageMargins}%
- **UK Industry Average Score: 72/100** (use this as benchmark for comparison)

${websiteUrl ? `Website: ${websiteUrl}` : ''}
${websiteAnalysis ? `
Website Analysis:
- Title: ${websiteAnalysis.title}
- Description: ${websiteAnalysis.description}
- Content Quality: ${websiteAnalysis.content.length > 1000 ? 'Comprehensive content (1000+ chars)' : websiteAnalysis.content.length > 500 ? 'Moderate content' : 'Limited content'}
- Navigation: ${websiteAnalysis.structure.hasNavigation ? 'Yes' : 'No'}
- Contact Form: ${websiteAnalysis.structure.hasContactForm ? 'Yes' : 'No'}
- Social Media: ${websiteAnalysis.structure.hasSocialLinks ? 'Yes' : 'No'}
- Languages: ${websiteAnalysis.structure.languages.join(', ')}
- E-commerce Ready: ${websiteAnalysis.ecommerce.hasShoppingCart ? 'Yes (Shopping Cart)' : 'No'}
- Pricing Displayed: ${websiteAnalysis.ecommerce.hasPricing ? 'Yes' : 'No'}
- SSL Secured: ${websiteAnalysis.trustSignals.hasSSL ? 'Yes' : 'No'}
- Privacy Policy: ${websiteAnalysis.trustSignals.hasPrivacyPolicy ? 'Yes' : 'No'}
- UK Alignment: ${websiteAnalysis.ukAlignment.hasPoundsGBP || websiteAnalysis.ukAlignment.hasUKAddress || websiteAnalysis.ukAlignment.hasUKPhone ? 'Strong (GBP pricing or UK contact details present)' : 'Weak (no UK-specific signals detected)'}
- Content Preview: ${websiteAnalysis.content.substring(0, 300)}...
` : 'Website not analyzed (no URL provided or scraping failed)'}

IMPORTANT: Compare this business against the ${industry} UK market average score of 72/100. Provide context on whether they're above or below average.

Provide a JSON response with this EXACT structure:
{
  "overallScore": <number 0-100>,
  "categoryScores": {
    "marketFit": <number 0-100>,
    "businessModel": <number 0-100>,
    "digitalReadiness": <number 0-100>
  },
  "industryComparison": {
    "averageUKScore": 72,
    "yourPosition": "<Above Average|Average|Below Average>",
    "scoreGap": <number - positive if above average, negative if below>
  },
  "summary": "<2-3 sentence assessment with industry benchmark comparison>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "challenges": ["<challenge 1 with ${industry} context>", "<challenge 2>", "<challenge 3>"],
  "priorityActions": ["<action 1 based on ${industry} benchmarks>", "<action 2>", "<action 3>"],
  "riskAssessment": "<brief risk summary with ${industry} market context>"
}`;

    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert business analyst specializing in UK market entry for international companies. Provide detailed, actionable insights based on the business information provided. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI response received');

    const analysisText = openaiData.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No analysis generated from OpenAI');
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse AI analysis result');
    }

    // Fetch relevant partners based on industry and compliance needs
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('*')
      .eq('verification_status', 'verified')
      .limit(5);

    if (partnersError) {
      console.error('Error fetching partners:', partnersError);
    }

    // Add partner recommendations to analysis
    if (partners && partners.length > 0) {
      analysisResult.recommendedPartners = partners.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        specialties: p.specialties
      }));
    }

    console.log('Analysis complete, returning results');

    return new Response(
      JSON.stringify(analysisResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in analyze-business function:', error);
    
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error',
          details: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An error occurred during analysis',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
