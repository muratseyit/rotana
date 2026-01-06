import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { scrapeWithFirecrawlFallback } from '../_shared/website-scraper.ts';

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
    let websiteScrapingStatus: 'success' | 'failed' | 'not_provided' = 'not_provided';
    
    if (websiteUrl && isSafeUrl(websiteUrl)) {
      console.log('Scraping website content with Firecrawl fallback for:', websiteUrl);
      websiteAnalysis = await scrapeWithFirecrawlFallback(websiteUrl);
      if (websiteAnalysis && websiteAnalysis.scrapingStatus === 'success') {
        console.log('Website scraping successful');
        websiteScrapingStatus = 'success';
      } else if (websiteAnalysis) {
        console.log('Website scraping failed but URL exists, status:', websiteAnalysis.scrapingStatus);
        websiteScrapingStatus = 'failed';
      } else {
        console.log('Website scraping returned null');
        websiteScrapingStatus = 'failed';
      }
    } else if (websiteUrl) {
      console.log('Website URL provided but failed safety check:', websiteUrl);
      websiteScrapingStatus = 'failed';
    }

    // Get industry benchmark data for comparison
    const industryBenchmark = getIndustryBenchmark(industry);
    console.log(`Industry benchmark loaded for: ${industry}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Lovable API key (pre-configured)
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not configured');
      throw new Error('AI API key not configured');
    }

    console.log('Starting AI analysis with Lovable AI Gateway...');

    // Calculate digital readiness based on website analysis
    let digitalReadinessScore = 0;
    
    if (websiteAnalysis && websiteAnalysis.scrapingStatus === 'success') {
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
      
      console.log('Digital readiness score from scraped data:', digitalReadinessScore);
    } else if (websiteUrl) {
      // Website exists but scraping failed - use neutral score (don't penalize)
      digitalReadinessScore = 50;
      console.log('Website exists but scraping failed, using neutral score:', digitalReadinessScore);
    } else {
      // No website provided
      digitalReadinessScore = 0;
      console.log('No website provided, digital readiness score:', digitalReadinessScore);
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

${websiteUrl ? `Website URL: ${websiteUrl}` : 'No website provided'}
${websiteAnalysis && websiteAnalysis.scrapingStatus === 'success' ? `
Website Analysis (Pre-calculated Digital Readiness: ${digitalReadinessScore}/100):
- Title: ${websiteAnalysis.title}
- Description: ${websiteAnalysis.description}
- Content Quality: ${websiteAnalysis.content.length > 1000 ? 'Comprehensive ✓' : 'Limited ✗'} (${websiteAnalysis.content.length} chars)
- Navigation: ${websiteAnalysis.structure.hasNavigation ? 'Yes ✓' : 'No ✗'}
- Contact Form: ${websiteAnalysis.structure.hasContactForm ? 'Yes ✓' : 'No ✗'}
- E-commerce Ready: ${websiteAnalysis.ecommerce.hasShoppingCart ? 'Yes ✓' : 'No ✗'}
- SSL Secured: ${websiteAnalysis.trustSignals.hasSSL ? 'Yes ✓' : 'No ✗'}
- UK Alignment: ${websiteAnalysis.ukAlignment.hasPoundsGBP || websiteAnalysis.ukAlignment.hasUKAddress ? 'Strong ✓' : 'Weak ✗'}
` : websiteUrl ? `
IMPORTANT: Website exists at ${websiteUrl} but automated scraping failed (site may block bots or require JavaScript).
DO NOT penalize this business for scraping failure - the website exists and is functional.
Assume average digital readiness (50/100) for scoring purposes since we cannot verify website quality.
` : 'No website URL provided - this is a gap for UK market credibility'}

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

    // Call Lovable AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert business analyst specializing in UK market entry for international companies. Provide detailed, actionable insights based on the business information provided. Always respond with valid JSON only, no markdown formatting.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI Gateway error:', aiResponse.status, errorText);
      
      // Handle rate limits and payment errors
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service rate limit exceeded. Please try again in a few moments.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service payment required. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${aiResponse.statusText}`);
    }

    const aiData = await aiResponse.json();
    console.log('Lovable AI response received');

    const analysisText = aiData.choices[0]?.message?.content;
    if (!analysisText) {
      throw new Error('No analysis generated from AI');
    }

    let result;
    try {
      // Clean up the response - remove markdown code blocks if present
      let cleanedText = analysisText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
      }
      if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.slice(3);
      }
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      result = JSON.parse(cleanedText.trim());
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, 'Raw:', analysisText);
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

    // Generate website insights with proper scraping status handling
    let websiteInsights;
    
    if (websiteAnalysis && websiteAnalysis.scrapingStatus === 'success') {
      websiteInsights = {
        hasWebsite: true,
        scrapingStatus: 'success',
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
      };
    } else if (websiteUrl) {
      // Website URL was provided but scraping failed
      websiteInsights = {
        hasWebsite: true,
        scrapingStatus: 'failed',
        websiteUrl: websiteUrl,
        digitalScore: 50, // Neutral score - don't penalize for scraping failure
        message: 'Website exists but could not be automatically analyzed. Manual review recommended.',
        note: 'Scraping may fail due to bot protection, JavaScript requirements, or temporary issues. This does not reflect poorly on the business.'
      };
    } else {
      // No website provided
      websiteInsights = {
        hasWebsite: false,
        scrapingStatus: 'not_provided',
        digitalScore: 0,
        criticalIssue: 'No website detected - essential for UK market credibility and partner trust'
      };
    }

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
        ],
        disclaimer: "AI-generated analysis results are for informational purposes only and do not constitute legal or financial advice."
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
