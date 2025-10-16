import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { scrapeWebsite } from '../_shared/website-scraper.ts';

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

    // Create comprehensive analysis prompt
    const analysisPrompt = `You are a UK market entry expert. Analyze this business for UK market readiness:

Company: ${companyName}
Industry: ${industry}
Company Size: ${companySize}
Description: ${businessDescription}
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

Financial Metrics: ${JSON.stringify(financialMetrics || {})}
Compliance Status: ${JSON.stringify(complianceStatus || {})}

Provide a comprehensive analysis with the following structure:
1. Overall UK Market Readiness Score (0-100)
2. Score Breakdown by Category:
   - Market Fit
   - Financial Readiness
   - Compliance Readiness
   - Operational Capability
   - Growth Potential
3. Key Strengths (3-5 bullet points)
4. Key Challenges (3-5 bullet points)
5. Priority Actions (5-7 specific, actionable recommendations)
6. Market Entry Timeline Estimate
7. Investment Requirements
8. Risk Assessment

Format the response as a JSON object with these exact keys:
{
  "overallScore": number,
  "scoreBreakdown": {
    "marketFit": number,
    "financialReadiness": number,
    "complianceReadiness": number,
    "operationalCapability": number,
    "growthPotential": number
  },
  "strengths": string[],
  "challenges": string[],
  "priorityActions": string[],
  "timeline": string,
  "investmentRequirements": string,
  "riskAssessment": string
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
