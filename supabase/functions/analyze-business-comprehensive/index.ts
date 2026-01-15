import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';
import { calculateComprehensiveScore } from './scoring-engine.ts';
import { getIndustryBenchmark, getRegulatoryRequirements, getMarketSizeData, getTurkeyUKTradeData, getCompetitionIndex } from './market-data.ts';
import { generateEnhancedPartnerRecommendations } from './partner-matching.ts';
import { scrapeWithFirecrawlFallback } from '../_shared/website-scraper.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const businessData = await req.json();
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!lovableApiKey && !openaiApiKey) {
      console.error('Neither LOVABLE_API_KEY nor OPENAI_API_KEY found in environment');
      throw new Error('AI key not configured');
    }
    console.log('AI keys loaded:', { lovable: !!lovableApiKey, openai: !!openaiApiKey });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing comprehensive analysis for:', businessData.companyName);

    // Run independent operations in parallel for better performance
    console.log('Starting parallel operations: website scraping, company verification, partner fetching, market research, competitor research...');
    
    const [websiteAnalysis, companyVerification, partnersResult, liveMarketResearch, competitorResearch] = await Promise.all([
      // 1. Scrape website if URL provided
      (async () => {
        if (!businessData.websiteUrl) return null;
        
        console.log('Scraping website content with Firecrawl fallback...');
        try {
          const analysis = await scrapeWithFirecrawlFallback(businessData.websiteUrl);
          if (analysis) {
            console.log('Website scraping successful:', {
              title: analysis.title,
              contentLength: analysis.content.length,
              hasEcommerce: analysis.ecommerce.hasShoppingCart,
              ukAlignment: analysis.ukAlignment.hasPoundsGBP || analysis.ukAlignment.hasUKAddress
            });
          } else {
            console.log('Website scraping failed, continuing with URL only');
          }
          return analysis;
        } catch (error) {
          console.log('Website scraping error:', error);
          return null;
        }
      })(),
      
      // 2. Verify UK company registration if company number provided
      (async () => {
        if (!businessData.companyNumber && businessData.ukRegistered !== 'yes') return null;
        
        try {
          const verifyResponse = await fetch(`${supabaseUrl}/functions/v1/verify-uk-company`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              companyName: businessData.companyName,
              companyNumber: businessData.companyNumber
            })
          });
          
          if (verifyResponse.ok) {
            const verification = await verifyResponse.json();
            console.log('Company verification result:', verification.verified);
            return verification;
          }
          return null;
        } catch (verifyError) {
          console.log('Company verification failed, continuing without it:', verifyError);
          return null;
        }
      })(),
      
      // 3. Fetch verified partners from database
      (async () => {
        console.log('Fetching verified partners...');
        const { data: partners, error: partnersError } = await supabase
          .from('partners')
          .select('*')
          .eq('verification_status', 'verified');

        if (partnersError) {
          console.error('Error fetching partners:', partnersError);
          return null;
        }
        
        console.log('Partners fetched:', partners?.length || 0);
        return partners;
      })(),
      
      // 4. Fetch real-time market research via Perplexity
      (async () => {
        try {
          console.log('Fetching real-time market intelligence via Perplexity...');
          const researchResponse = await fetch(`${supabaseUrl}/functions/v1/market-research`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              industry: businessData.industry || 'general',
              productDescription: businessData.description || businessData.businessDescription,
              targetMarket: 'UK',
              researchType: 'comprehensive'
            })
          });
          
          if (researchResponse.ok) {
            const research = await researchResponse.json();
            if (research.success) {
              console.log('Real-time market research successful:', {
                marketSize: research.data?.marketSize?.valueGBP,
                tradeVolume: research.data?.tradeFlow?.turkeyUKVolume,
                confidence: research.data?.marketSize?.confidence
              });
              return research.data;
            }
          }
          console.log('Real-time research unavailable, will use embedded data');
          return null;
        } catch (researchError) {
          console.log('Real-time market research failed:', researchError);
          return null;
        }
      })(),
      
      // 5. Fetch real-time competitor intelligence via Perplexity
      (async () => {
        try {
          console.log('Fetching real-time competitor intelligence...');
          const competitorResponse = await fetch(`${supabaseUrl}/functions/v1/competitor-research`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              industry: businessData.industry || 'general',
              businessDescription: businessData.description || businessData.businessDescription,
              productNiche: businessData.productNiche,
              targetMarket: 'UK'
            })
          });
          
          if (competitorResponse.ok) {
            const competitors = await competitorResponse.json();
            if (competitors.success) {
              console.log('Competitor research successful:', {
                competitorCount: competitors.data?.competitors?.length || 0,
                hasInsights: !!competitors.data?.marketInsights
              });
              return competitors.data;
            }
          }
          console.log('Competitor research unavailable');
          return null;
        } catch (error) {
          console.log('Competitor research failed:', error);
          return null;
        }
      })()
    ]);

    console.log('Parallel operations completed');
    console.log('Calculating comprehensive scores with dynamic market intelligence...');

    // Calculate comprehensive scores using evidence-based algorithms with website data
    // NOTE: calculateComprehensiveScore is now async to support dynamic data fetching
    const scoringResult = await calculateComprehensiveScore(businessData, companyVerification, websiteAnalysis);
    console.log('Calculated scores:', {
      overall: scoringResult.overallScore,
      confidence: scoringResult.confidenceLevel,
      dataCompleteness: scoringResult.dataCompleteness,
      dataSources: scoringResult.dataSources?.length || 0
    });

    // Get industry benchmarks and regulatory requirements
    const industryBenchmark = getIndustryBenchmark(businessData.industry || '');
    const regulatoryRequirements = getRegulatoryRequirements(businessData.industry || '');
    
    // Get market intelligence data - prefer real-time Perplexity data, fallback to embedded
    const marketSizeData = getMarketSizeData(businessData.industry || '');
    const tradeData = getTurkeyUKTradeData(businessData.industry || '');
    const competitionData = getCompetitionIndex(businessData.industry || '');
    
    // Merge real-time research with embedded data for best accuracy
    const effectiveMarketData = {
      marketSizeGBP: liveMarketResearch?.marketSize?.valueGBP || marketSizeData.marketSizeGBP,
      growthRate: liveMarketResearch?.marketSize?.growthRate || marketSizeData.growthRate,
      forecast2027: liveMarketResearch?.marketSize?.forecast2027 || marketSizeData.forecast2027,
      turkishExporterCount: marketSizeData.turkishExporterCount,
      dataSource: liveMarketResearch?.marketSize?.source || 'Converta Embedded Data',
      confidence: liveMarketResearch?.marketSize?.confidence || 'medium',
      lastUpdated: liveMarketResearch?.lastUpdated || null
    };
    
    const effectiveTradeData = {
      annualVolumeGBP: liveMarketResearch?.tradeFlow?.turkeyUKVolume || tradeData.annualVolumeGBP,
      growthTrend: liveMarketResearch?.tradeFlow?.trend || tradeData.growthTrend,
      yearOverYearChange: liveMarketResearch?.tradeFlow?.yoyChange || tradeData.yearOverYearChange,
      topProducts: liveMarketResearch?.tradeFlow?.topProducts || tradeData.topProducts,
      ftaBenefit: liveMarketResearch?.tradeFlow?.ftaBenefit ?? tradeData.ftaBenefit
    };
    
    const effectiveCompetitionData = {
      saturationLevel: liveMarketResearch?.competition?.saturationLevel || competitionData.saturationLevel,
      entryOpportunity: liveMarketResearch?.competition?.entryOpportunity || competitionData.entryOpportunity,
      nichePotential: liveMarketResearch?.competition?.nichePotential || competitionData.nichePotential,
      majorPlayers: liveMarketResearch?.competition?.majorPlayers || [],
      marketGaps: competitionData.marketGaps
    };
    
    const effectiveRegulations = liveMarketResearch?.regulations || null;
    
    console.log('Industry benchmark data:', industryBenchmark);
    console.log('Regulatory requirements:', regulatoryRequirements.length);
    console.log('Market intelligence loaded:', { 
      marketSize: effectiveMarketData.marketSizeGBP, 
      tradeVolume: effectiveTradeData.annualVolumeGBP,
      dataSource: effectiveMarketData.dataSource,
      isRealTime: !!liveMarketResearch
    });
    
    // Build AI prompt in smaller chunks to avoid memory issues
    console.log('Building AI analysis prompt...');
    
    const promptParts: string[] = [];
    promptParts.push('You are a senior UK market entry analyst. Provide actionable insights based on calculated scores.\n\n');
    promptParts.push(`BUSINESS: ${businessData.companyName}\n`);
    promptParts.push(`Industry: ${businessData.industry}\n`);
    promptParts.push(`Description: ${businessData.description || businessData.businessDescription || 'Not provided'}\n\n`);
    
    promptParts.push('CALCULATED SCORES:\n');
    promptParts.push(`Overall: ${scoringResult.overallScore}/100\n`);
    promptParts.push(`Product-Market Fit: ${scoringResult.scoreBreakdown.productMarketFit}/100\n`);
    promptParts.push(`Regulatory: ${scoringResult.scoreBreakdown.regulatoryCompatibility}/100\n`);
    promptParts.push(`Digital Readiness: ${scoringResult.scoreBreakdown.digitalReadiness}/100\n`);
    promptParts.push(`Logistics: ${scoringResult.scoreBreakdown.logisticsPotential}/100\n`);
    promptParts.push(`Scalability: ${scoringResult.scoreBreakdown.scalabilityAutomation}/100\n`);
    promptParts.push(`Team: ${scoringResult.scoreBreakdown.founderTeamStrength}/100\n`);
    promptParts.push(`Investment: ${scoringResult.scoreBreakdown.investmentReadiness}/100\n\n`);
    
    // Handle website analysis with proper scraping status detection
    const websiteScrapedSuccessfully = websiteAnalysis && 
      (websiteAnalysis as any).scrapingStatus === 'success' && 
      websiteAnalysis.content && 
      websiteAnalysis.content.length > 0;
    
    if (websiteScrapedSuccessfully) {
      promptParts.push('WEBSITE ANALYSIS (Live Scraped Data - Successfully Retrieved):\n');
      promptParts.push(`- Title: ${websiteAnalysis.title || 'Not found'}\n`);
      promptParts.push(`- Description: ${websiteAnalysis.description || 'Not found'}\n`);
      promptParts.push(`- Content Length: ${websiteAnalysis.content?.length || 0} characters\n`);
      promptParts.push(`- SSL Security: ${websiteAnalysis.trustSignals.hasSSL ? 'Yes (HTTPS)' : 'No (HTTP only - security risk)'}\n`);
      promptParts.push(`- Professional Navigation: ${websiteAnalysis.structure.hasNavigation ? 'Yes' : 'No'}\n`);
      promptParts.push(`- Contact Form: ${websiteAnalysis.structure.hasContactForm ? 'Yes' : 'No'}\n`);
      promptParts.push(`- Social Media Links: ${websiteAnalysis.structure.hasSocialLinks ? 'Yes' : 'No'}\n`);
      promptParts.push(`- Languages Detected: ${websiteAnalysis.structure.languages.join(', ') || 'Unknown'}\n`);
      promptParts.push(`- E-commerce Cart: ${websiteAnalysis.ecommerce.hasShoppingCart ? 'Yes' : 'No'}\n`);
      promptParts.push(`- Pricing Displayed: ${websiteAnalysis.ecommerce.hasPricing ? 'Yes' : 'No'}\n`);
      promptParts.push(`- Payment Acceptance: ${websiteAnalysis.ecommerce.acceptsPayments ? 'Yes' : 'No'}\n`);
      promptParts.push(`- Privacy Policy: ${websiteAnalysis.trustSignals.hasPrivacyPolicy ? 'Yes' : 'No'}\n`);
      promptParts.push(`- Terms of Service: ${websiteAnalysis.trustSignals.hasTermsOfService ? 'Yes' : 'No'}\n`);
      promptParts.push(`- UK Price Display (£GBP): ${websiteAnalysis.ukAlignment.hasPoundsGBP ? 'Yes' : 'No'}\n`);
      promptParts.push(`- UK Address Present: ${websiteAnalysis.ukAlignment.hasUKAddress ? 'Yes' : 'No'}\n`);
      promptParts.push(`- UK Phone Number: ${websiteAnalysis.ukAlignment.hasUKPhone ? 'Yes' : 'No'}\n`);
      // Include first 500 chars of website content for context
      if (websiteAnalysis.content && websiteAnalysis.content.length > 0) {
        const contentPreview = websiteAnalysis.content.substring(0, 500).replace(/\s+/g, ' ').trim();
        promptParts.push(`- Content Preview: "${contentPreview}..."\n`);
      }
      promptParts.push('\n');
    } else if (businessData.websiteUrl) {
      promptParts.push(`WEBSITE: URL provided (${businessData.websiteUrl}) but automated scraping failed.\n`);
      promptParts.push('IMPORTANT: This is a TECHNICAL LIMITATION of our scraper, NOT a reflection of the business.\n');
      promptParts.push('The website likely exists and functions properly but may use bot protection or require JavaScript.\n');
      promptParts.push('DO NOT penalize the business for this scraping failure.\n');
      promptParts.push('For Digital Readiness scoring, assume AVERAGE performance (50-60/100) since we cannot verify.\n');
      promptParts.push('Base your assessment on other available business data.\n\n');
    } else {
      promptParts.push('WEBSITE: No website URL provided - this is a significant gap for UK market credibility\n\n');
    }
    
    if (companyVerification?.verified) {
      promptParts.push('UK COMPANY VERIFIED\n\n');
    }
    
    promptParts.push(`INDUSTRY BENCHMARKS (${businessData.industry}):\n`);
    promptParts.push(`- Market size: £${industryBenchmark.marketSize}B\n`);
    promptParts.push(`- Growth rate: ${industryBenchmark.averageGrowthRate}%\n`);
    promptParts.push(`- Competition: ${industryBenchmark.competitionLevel}\n\n`);
    
    // Add market intelligence context with real-time data priority
    promptParts.push(`CONVERTA MARKET INTELLIGENCE (${liveMarketResearch ? 'Real-Time via Perplexity' : 'Embedded Data'}):\n`);
    promptParts.push(`- UK addressable market: £${effectiveMarketData.marketSizeGBP}B (${effectiveMarketData.confidence} confidence)\n`);
    promptParts.push(`- Market growth forecast: ${effectiveMarketData.growthRate}% annually\n`);
    promptParts.push(`- 2027 forecast: £${effectiveMarketData.forecast2027}B\n`);
    promptParts.push(`- Turkey-UK trade volume: £${effectiveTradeData.annualVolumeGBP}M (${effectiveTradeData.growthTrend})\n`);
    promptParts.push(`- Trade trend: ${effectiveTradeData.yearOverYearChange > 0 ? '+' : ''}${effectiveTradeData.yearOverYearChange}% YoY\n`);
    promptParts.push(`- Top Turkish exports: ${effectiveTradeData.topProducts.slice(0, 4).join(', ')}\n`);
    promptParts.push(`- Competition saturation: ${effectiveCompetitionData.saturationLevel}%\n`);
    promptParts.push(`- Entry opportunity: ${effectiveCompetitionData.entryOpportunity}\n`);
    if (effectiveCompetitionData.majorPlayers.length > 0) {
      promptParts.push(`- Major players: ${effectiveCompetitionData.majorPlayers.slice(0, 3).join(', ')}\n`);
    }
    promptParts.push(`- Active Turkish exporters: ~${effectiveMarketData.turkishExporterCount}\n`);
    if (effectiveCompetitionData.nichePotential.length > 0) {
      promptParts.push(`- Niche opportunities: ${effectiveCompetitionData.nichePotential.slice(0, 3).join(', ')}\n`);
    }
    promptParts.push(`- UK-Turkey FTA benefit: ${effectiveTradeData.ftaBenefit ? 'Yes' : 'No'}\n`);
    if (effectiveRegulations) {
      promptParts.push(`- Key regulations: ${effectiveRegulations.keyRequirements?.slice(0, 3).join(', ')}\n`);
      promptParts.push(`- Required certifications: ${effectiveRegulations.certifications?.join(', ')}\n`);
      promptParts.push(`- Compliance cost estimate: ${effectiveRegulations.estimatedComplianceCost}\n`);
    }
    promptParts.push('\n');
    
    promptParts.push('TASK: Provide JSON with:\n');
    promptParts.push('1. "summary": 2-3 sentence executive summary incorporating market opportunity insights AND website assessment\n');
    promptParts.push('2. "detailedInsights": array of 8 categories (Product-Market Fit, Regulatory Compatibility, Digital Readiness, Logistics Potential, Scalability, Team, Investment, Market Opportunity), each with:\n');
    promptParts.push('   - "category": name\n');
    promptParts.push('   - "score": use the calculated score above\n');
    promptParts.push('   - "strengths": array of 2-3 strengths (reference website findings where relevant)\n');
    promptParts.push('   - "weaknesses": array of 2-3 weaknesses (reference website gaps where relevant)\n');
    promptParts.push('   - "actionItems": array of 2-3 actions with "action", "priority" (high/medium/low), "timeframe" (immediate/1-3 months/3-6 months)\n');
    promptParts.push('3. "websiteInsights": object with website-specific analysis:\n');
    promptParts.push('   - "overallAssessment": 1-2 sentence assessment of website readiness for UK market\n');
    promptParts.push('   - "strengths": array of 2-3 website strengths based on scraped data\n');
    promptParts.push('   - "improvements": array of 3-5 specific improvements needed for UK market (prioritized)\n');
    promptParts.push('   - "ukReadinessScore": number 0-100 based on UK alignment signals\n');
    promptParts.push('4. "recommendations": object with "immediate", "shortTerm", "longTerm" arrays (2-3 items each, include website-related actions)\n');
    promptParts.push('5. "risks": array of 3-5 key risks with "risk", "severity" (high/medium/low), "mitigation"\n');
    promptParts.push('6. "opportunities": array of 3-5 opportunities based on market intelligence with "opportunity", "impact" (high/medium/low), "timeline"\n\n');
    promptParts.push('IMPORTANT: Base Digital Readiness insights heavily on the actual website analysis data. If website was not analyzed, note this as a critical gap.\n');
    promptParts.push('Keep insights specific to UK market entry. Focus on actionable recommendations.');
    
    const prompt = promptParts.join('');
    console.log('Prompt built successfully, length:', prompt.length);

    // AI call helper function
    const callAI = async (provider: 'lovable' | 'openai'): Promise<Response> => {
      const isLovable = provider === 'lovable';
      const apiKey = isLovable ? lovableApiKey : openaiApiKey;
      const endpoint = isLovable 
        ? 'https://ai.gateway.lovable.dev/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';
      const model = isLovable ? 'google/gemini-3-flash-preview' : 'gpt-4o-mini';
      
      console.log(`Calling ${provider} AI with model ${model}...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000);
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { 
                role: 'system', 
                content: 'You are a senior UK market entry analyst. Provide concise, actionable JSON analysis with specific evidence for each score. Respond ONLY with valid JSON, no markdown or extra text.' 
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 5000,
            ...(isLovable ? { response_format: { type: "json_object" } } : {})
          }),
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        console.log(`${provider} AI responded with status:`, response.status);
        return response;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        console.error(`${provider} AI fetch error:`, fetchError);
        throw fetchError;
      }
    };

    // Try Lovable AI first, fallback to OpenAI if it fails with 401/402/429
    let aiResponse: Response | null = null;
    let usedProvider = 'lovable';
    
    if (lovableApiKey) {
      try {
        aiResponse = await callAI('lovable');
        
        // If Lovable returns auth/rate limit error and we have OpenAI, try fallback
        if (!aiResponse.ok && [401, 402, 429].includes(aiResponse.status) && openaiApiKey) {
          console.log(`Lovable AI returned ${aiResponse.status}, falling back to OpenAI...`);
          aiResponse = await callAI('openai');
          usedProvider = 'openai';
        }
      } catch (lovableError) {
        console.error('Lovable AI failed:', lovableError);
        if (openaiApiKey) {
          console.log('Falling back to OpenAI...');
          aiResponse = await callAI('openai');
          usedProvider = 'openai';
        }
      }
    } else if (openaiApiKey) {
      // Only OpenAI available
      aiResponse = await callAI('openai');
      usedProvider = 'openai';
    }

    if (!aiResponse || !aiResponse.ok) {
      const errorText = aiResponse ? await aiResponse.text() : 'No AI response';
      const errorStatus = aiResponse?.status || 500;
      console.error('All AI providers failed:', errorStatus, errorText);
      
      // Return calculated scores even if AI analysis fails
      return new Response(
        JSON.stringify({
          overallScore: scoringResult.overallScore,
          scoreBreakdown: scoringResult.scoreBreakdown,
          scoreEvidence: scoringResult.scoreEvidence,
          summary: `Analysis completed with an overall score of ${scoringResult.overallScore}/100. AI insights temporarily unavailable.`,
          partnerRecommendations: generateEnhancedPartnerRecommendations(
            partnersResult || [],
            businessData,
            { scoreBreakdown: scoringResult.scoreBreakdown }
          ),
          metadata: {
            dataCompleteness: {
              score: scoringResult.dataCompleteness,
              missingFields: [],
              completedSections: []
            },
            analysisVersion: 'v2.2-market-intelligence',
            modelUsed: 'proprietary-scoring-engine + market-intelligence',
            analysisDate: new Date().toISOString(),
            confidenceLevel: scoringResult.confidenceLevel,
            scoringMethod: 'evidence-based-algorithms',
            aiAnalysisError: `AI error: ${errorStatus}`,
            industryBenchmark,
            regulatoryRequirements,
            marketIntelligence: scoringResult.marketIntelligence
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    console.log(`AI analysis successful using ${usedProvider}`);

    const aiData = await aiResponse.json();
    console.log('Lovable AI response received, structure check...');
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Invalid AI response structure:', JSON.stringify(aiData, null, 2));
      throw new Error('Invalid AI response structure');
    }
    
    const analysisText = aiData.choices[0].message.content;
    console.log('Analysis text length:', analysisText?.length || 0);
    
    if (!analysisText || analysisText.trim() === '') {
      console.error('Empty AI response received. Full response:', JSON.stringify(aiData, null, 2));
      throw new Error('Empty AI response');
    }
    
    console.log('AI Analysis received, parsing...');
    
    // Sanitize the response text to remove problematic control characters
    // but preserve valid JSON escape sequences
    const sanitizedText = analysisText
      .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, ' '); // Replace control chars with space, preserve \n and \r
    
    // Parse AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(sanitizedText);
    } catch (parseError) {
      console.error('Failed to parse AI response. First 500 chars:', sanitizedText.substring(0, 500));
      console.error('Parse error details:', parseError);
      throw new Error(`Invalid AI response format: ${parseError.message}`);
    }

    console.log('Merging AI insights with calculated scores...');

    // Use partners fetched in parallel (already available from Promise.all above)
    const partners = partnersResult;

    // Advanced partner matching algorithm using calculated scores and enhanced matching
    const partnerRecommendations = generateEnhancedPartnerRecommendations(
      partners || [],
      businessData,
      { ...aiAnalysis, scoreBreakdown: scoringResult.scoreBreakdown }
    );

    // Build comprehensive result with calculated scores + AI insights
    const comprehensiveResult = {
      ...aiAnalysis,
      overallScore: scoringResult.overallScore, // Use calculated score
      scoreBreakdown: scoringResult.scoreBreakdown, // Use calculated breakdown
      scoreEvidence: scoringResult.scoreEvidence, // Add scoring evidence
      partnerRecommendations,
      metadata: {
        dataCompleteness: {
          score: scoringResult.dataCompleteness,
          missingFields: [],
          completedSections: []
        },
        analysisVersion: 'v2.3-realtime-intelligence',
        modelUsed: `${usedProvider === 'openai' ? 'gpt-4o-mini' : 'gemini-2.5-pro'} + proprietary-scoring-engine + perplexity-research`,
        analysisDate: new Date().toISOString(),
        confidenceLevel: scoringResult.confidenceLevel,
        aiProvider: usedProvider,
        scoringMethod: 'evidence-based-algorithms',
        companyVerification: companyVerification ? {
          verified: companyVerification.verified,
          data: companyVerification.data,
          insights: companyVerification.insights
        } : { verified: false },
        industryBenchmark,
        regulatoryRequirements,
        marketIntelligence: {
          ...scoringResult.marketIntelligence,
          // Enhanced with real-time data
          marketSizeGBP: effectiveMarketData.marketSizeGBP,
          growthRate: effectiveMarketData.growthRate,
          forecast2027: effectiveMarketData.forecast2027,
          tradeVolumeGBP: effectiveTradeData.annualVolumeGBP,
          tradeGrowthTrend: effectiveTradeData.growthTrend,
          yoyChange: effectiveTradeData.yearOverYearChange,
          topExportProducts: effectiveTradeData.topProducts,
          saturationLevel: effectiveCompetitionData.saturationLevel,
          entryOpportunity: effectiveCompetitionData.entryOpportunity,
          nichePotential: effectiveCompetitionData.nichePotential,
          majorPlayers: effectiveCompetitionData.majorPlayers,
          ftaBenefit: effectiveTradeData.ftaBenefit,
          dataSource: scoringResult.marketIntelligence?.source || effectiveMarketData.dataSource,
          dataConfidence: scoringResult.marketIntelligence?.confidence || effectiveMarketData.confidence,
          isRealTimeData: !!liveMarketResearch || (scoringResult.marketIntelligence?.source !== 'Static Benchmark'),
          lastUpdated: scoringResult.marketIntelligence?.lastUpdated || effectiveMarketData.lastUpdated,
          researchSources: liveMarketResearch?.sources || []
        },
        // Add data sources attribution from scoring engine
        dataSourcesAttribution: scoringResult.dataSources?.filter(ds => ds.isLive).map(ds => ({
          name: ds.name,
          type: ds.type,
          lastUpdated: ds.lastUpdated,
          confidence: ds.confidence,
          freshnessLabel: ds.lastUpdated ? getDataFreshnessLabel(ds.lastUpdated) : 'Unknown'
        })) || [],
        competitorIntelligence: competitorResearch ? {
          competitors: competitorResearch.competitors || [],
          marketInsights: competitorResearch.marketInsights || null,
          sources: competitorResearch.sources || [],
          researchedAt: competitorResearch.researchedAt,
          isLiveData: true
        } : null,
        liveRegulations: effectiveRegulations,
        websiteAnalysis: websiteAnalysis ? {
          url: businessData.websiteUrl,
          title: websiteAnalysis.title,
          description: websiteAnalysis.description,
          contentLength: websiteAnalysis.content?.length || 0,
          structure: websiteAnalysis.structure,
          ecommerce: websiteAnalysis.ecommerce,
          trustSignals: websiteAnalysis.trustSignals,
          ukAlignment: websiteAnalysis.ukAlignment,
          scrapedAt: new Date().toISOString()
        } : null,
        dataSourcesUsed: [
          'Evidence-Based Scoring Algorithms',
          'Business Form Data',
          websiteAnalysis ? 'Live Website Scraping & Analysis' : null,
          companyVerification?.verified ? 'Companies House API (Verified)' : null,
          'UK Industry Benchmarks (2024-2025)',
          'UK Government Regulatory Database',
          liveMarketResearch ? 'Perplexity Real-Time Research (2024-2025)' : 'Converta Embedded Market Data',
          competitorResearch ? 'Perplexity Competitor Intelligence' : null,
          'Turkey-UK Trade Flow Data',
          'HS Code Classification Database',
          'Supabase Partner Database',
          `${usedProvider === 'openai' ? 'OpenAI GPT-4o-mini' : 'Google Gemini 2.5 Pro'} AI Analysis`
        ].filter(Boolean)
      }
    };

    console.log('Comprehensive analysis completed successfully');

    return new Response(
      JSON.stringify(comprehensiveResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in analyze-business-comprehensive:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Helper function to get data freshness label
function getDataFreshnessLabel(lastUpdated: string): string {
  const age = Date.now() - new Date(lastUpdated).getTime();
  const hoursOld = age / (1000 * 60 * 60);
  const daysOld = Math.floor(hoursOld / 24);
  
  if (hoursOld < 24) return 'Just updated';
  if (daysOld < 7) return `${daysOld} days ago`;
  if (daysOld < 30) return `${Math.floor(daysOld / 7)} weeks ago`;
  return `${Math.floor(daysOld / 30)} months ago`;
}

// Calculate data completeness score
function calculateDataCompleteness(data: any): {
  score: number;
  missingFields: string[];
  completedSections: string[];
} {
  const criticalFields = {
    'Company Information': ['companyName', 'businessDescription', 'industry', 'companySize'],
    'Digital Presence': ['onlineSalesPlatform', 'socialMediaPlatforms', 'websiteFeatures'],
    'Compliance': ['ukRegistered', 'businessType', 'complianceCompleted'],
    'Strategy': ['primaryObjective', 'targetMarket', 'marketEntryTimeline']
  };

  let totalFields = 0;
  let completedFields = 0;
  const missingFields: string[] = [];
  const completedSections: string[] = [];

  for (const [section, fields] of Object.entries(criticalFields)) {
    let sectionComplete = true;
    
    for (const field of fields) {
      totalFields++;
      const value = data[field];
      
      if (value && value !== 'Not specified' && value !== 'Not provided' && 
          !(Array.isArray(value) && value.length === 0)) {
        completedFields++;
      } else {
        missingFields.push(field);
        sectionComplete = false;
      }
    }
    
    if (sectionComplete) {
      completedSections.push(section);
    }
  }

  return {
    score: Math.round((completedFields / totalFields) * 100),
    missingFields,
    completedSections
  };
}
