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

    // Calculate digital readiness based on website analysis
    let digitalReadinessScore = 0;
    if (websiteAnalysis) {
      // SSL Certificate (15 points)
      if (websiteAnalysis.trustSignals.hasSSL) digitalReadinessScore += 15;
      
      // Content Quality (20 points)
      if (websiteAnalysis.content.length > 2000) digitalReadinessScore += 20;
      else if (websiteAnalysis.content.length > 1000) digitalReadinessScore += 12;
      else if (websiteAnalysis.content.length > 500) digitalReadinessScore += 6;
      
      // Contact Form (15 points)
      if (websiteAnalysis.structure.hasContactForm) digitalReadinessScore += 15;
      
      // E-commerce Readiness (20 points)
      if (websiteAnalysis.ecommerce.hasShoppingCart) digitalReadinessScore += 20;
      else if (websiteAnalysis.ecommerce.hasPricing) digitalReadinessScore += 10;
      
      // UK Alignment (20 points)
      if (websiteAnalysis.ukAlignment.hasPoundsGBP) digitalReadinessScore += 10;
      if (websiteAnalysis.ukAlignment.hasUKAddress || websiteAnalysis.ukAlignment.hasUKPhone) digitalReadinessScore += 10;
      
      // Professional Structure (10 points)
      if (websiteAnalysis.structure.hasNavigation) digitalReadinessScore += 5;
      if (websiteAnalysis.structure.hasSocialLinks) digitalReadinessScore += 5;
    }

    const avgUKScore = 72;

    // Create comprehensive analysis prompt with enhanced scoring instructions
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
- **UK Industry Average Score: ${avgUKScore}/100** (use this as benchmark for comparison)

${websiteUrl ? `Website: ${websiteUrl}` : 'No website provided'}
${websiteAnalysis ? `
Website Analysis (Pre-calculated Digital Readiness: ${digitalReadinessScore}/100):
- Title: ${websiteAnalysis.title}
- Description: ${websiteAnalysis.description}
- Content Quality: ${websiteAnalysis.content.length > 1000 ? 'Comprehensive ✓' : 'Limited ✗'} (${websiteAnalysis.content.length} chars)
- Navigation: ${websiteAnalysis.structure.hasNavigation ? 'Yes ✓' : 'No ✗'}
- Contact Form: ${websiteAnalysis.structure.hasContactForm ? 'Yes ✓' : 'No ✗'}
- E-commerce Ready: ${websiteAnalysis.ecommerce.hasShoppingCart ? 'Yes ✓' : 'No ✗'}
- SSL Secured: ${websiteAnalysis.trustSignals.hasSSL ? 'Yes ✓' : 'No ✗'}
- UK Alignment: ${websiteAnalysis.ukAlignment.hasPoundsGBP || websiteAnalysis.ukAlignment.hasUKAddress ? 'Strong ✓' : 'Weak ✗'}
` : 'Website not analyzed - Digital Readiness Score: 0/100 ✗'}

SCORING INSTRUCTIONS:
- **Market Fit Score** (0-100): How well does this business fit UK market needs?
  - Consider: Industry growth in UK, competition level, consumer demand
  - Be realistic: most should score 50-75
  
- **Business Model Score** (0-100): How scalable and competitive is the business model?
  - Consider: Revenue model strength, scalability, years operating, competitive advantage
  - Be realistic: most should score 50-75
  
- **Digital Readiness**: Pre-calculated as ${digitalReadinessScore}/100 (don't change this)

- **Overall Score**: Calculate as weighted average:
  - Market Fit: 35%
  - Business Model: 35%
  - Digital Readiness: 30%

- **Industry Comparison**: Compare to ${avgUKScore}/100 average for ${industry}
  - Position: "Above Average" if score ≥ 77, "Average" if 67-76, "Below Average" if < 67

Provide a JSON response with this EXACT structure:
{
  "marketFitScore": <number 0-100>,
  "businessModelScore": <number 0-100>,
  "overallScore": <calculated weighted average>,
  "summary": "<2-3 sentence realistic assessment mentioning they scored X points ${avgUKScore > 65 ? 'below/above' : 'near'} industry average>",
  "keyInsight": "<one critical insight about UK market positioning>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "challenges": ["<specific challenge with ${industry} context>", "<challenge 2>", "<challenge 3>"],
  "priorityActions": ["<actionable step 1>", "<actionable step 2>", "<actionable step 3>"],
  "riskAssessment": "<1-2 sentences on main UK market entry risks for this business>"
}

Be specific, realistic, and actionable. Avoid generic advice.`;

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

    let result;
    try {
      result = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      throw new Error('Failed to parse AI analysis result');
    }

    // Calculate weighted overall score with proper rounding
    const calculatedOverallScore = Math.round(
      (result.marketFitScore * 0.35) + 
      (result.businessModelScore * 0.35) + 
      (digitalReadinessScore * 0.30)
    );
    
    // Use AI's score if reasonable, otherwise use calculated
    const finalOverallScore = result.overallScore && result.overallScore > 0 && result.overallScore <= 100
      ? result.overallScore 
      : calculatedOverallScore;
    
    // Calculate position relative to industry average
    const scoreGap = finalOverallScore - avgUKScore;
    const position = scoreGap >= 5 ? 'Above Average' : 
                     scoreGap >= -5 ? 'Average' : 
                     'Below Average';

    // Determine urgency level for upgrade based on score
    const urgencyLevel = finalOverallScore < 60 ? 'high' : 
                        finalOverallScore < 75 ? 'medium' : 
                        'low';

    // Generate website insights
    const websiteInsights = websiteAnalysis ? {
      hasWebsite: true,
      digitalScore: digitalReadinessScore,
      strengths: [
        websiteAnalysis.trustSignals.hasSSL && 'SSL Security',
        websiteAnalysis.structure.hasContactForm && 'Contact Form',
        websiteAnalysis.ecommerce.hasShoppingCart && 'E-commerce Ready',
        (websiteAnalysis.ukAlignment.hasPoundsGBP || websiteAnalysis.ukAlignment.hasUKAddress) && 'UK-focused Content'
      ].filter(Boolean),
      improvements: [
        !websiteAnalysis.trustSignals.hasSSL && 'Add SSL certificate for security',
        !websiteAnalysis.structure.hasContactForm && 'Add contact form to capture leads',
        websiteAnalysis.content.length < 1000 && 'Expand website content (currently under 1000 chars)',
        !websiteAnalysis.ukAlignment.hasPoundsGBP && !websiteAnalysis.ukAlignment.hasUKAddress && 'Add UK-specific content (GBP pricing, UK address)',
        !websiteAnalysis.ecommerce.hasShoppingCart && industry.toLowerCase().includes('retail') && 'Consider adding e-commerce functionality'
      ].filter(Boolean)
    } : {
      hasWebsite: false,
      digitalScore: 0,
      criticalIssue: 'No website detected - essential for UK market credibility and partner trust'
    };

    console.log('Analysis complete, returning enhanced results');

    return new Response(
      JSON.stringify({
        overallScore: finalOverallScore,
        categoryScores: {
          marketFit: result.marketFitScore,
          businessModel: result.businessModelScore,
          digitalReadiness: digitalReadinessScore
        },
        summary: result.summary,
        keyInsight: result.keyInsight || result.summary,
        strengths: result.strengths,
        challenges: result.challenges,
        priorityActions: result.priorityActions,
        riskAssessment: result.riskAssessment,
        industryComparison: {
          industry: industry,
          averageUKScore: avgUKScore,
          yourPosition: position,
          scoreGap: Math.abs(scoreGap),
          percentile: finalOverallScore > avgUKScore ? 
            Math.min(75, Math.round(50 + (scoreGap * 2))) : 
            Math.max(25, Math.round(50 + (scoreGap * 2)))
        },
        websiteInsights: websiteInsights,
        urgencyLevel: urgencyLevel,
        upgradeMessage: urgencyLevel === 'high' 
          ? "⚠️ Your score indicates significant gaps. Get the Comprehensive Analysis to identify exactly what to fix."
          : urgencyLevel === 'medium'
          ? "📊 You're close to being market-ready. Comprehensive Analysis shows the exact steps to get there."
          : "✅ Good foundation! Comprehensive Analysis helps you optimize and find the right UK partners.",
        missingInsights: [
          "🔍 Detailed compliance checklist with timelines and costs",
          "🤝 3 verified UK partner matches for your specific industry",
          "📋 12-month market entry roadmap with milestones",
          "💰 Complete cost breakdown for UK market entry",
          "⚖️ Legal structure recommendations (Ltd, Branch, etc.)",
          "📞 Expert review session to validate your strategy"
        ]
      }),
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
