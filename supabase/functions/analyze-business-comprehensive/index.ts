import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';
import { calculateComprehensiveScore } from './scoring-engine.ts';
import { getIndustryBenchmark, getRegulatoryRequirements } from './market-data.ts';
import { generateEnhancedPartnerRecommendations } from './partner-matching.ts';
import { scrapeWebsite } from '../_shared/website-scraper.ts';

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
    
    // Normalize field names for consistency
    const normalizedData = {
      ...businessData,
      businessDescription: businessData.businessDescription || businessData.description || '',
      websiteUrl: businessData.websiteUrl || businessData.website || '',
      companyName: businessData.companyName || 'Unknown Company'
    };
    
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      console.error('LOVABLE_API_KEY not found in environment');
      throw new Error('Lovable AI key not configured');
    }
    console.log('Lovable AI key loaded successfully');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing comprehensive analysis for:', normalizedData.companyName);

    // Run independent operations in parallel for better performance
    console.log('Starting parallel operations: website scraping, company verification, partner fetching...');
    
    const [websiteAnalysis, companyVerification, partnersResult] = await Promise.all([
      // 1. Scrape website if URL provided
      (async () => {
        const websiteUrl = normalizedData.websiteUrl || normalizedData.website;
        if (!websiteUrl || websiteUrl === 'Not provided') return null;
        
        console.log('Scraping website content...');
        try {
          const analysis = await scrapeWebsite(websiteUrl);
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
        if (!normalizedData.companyNumber && normalizedData.ukRegistered !== 'yes') return null;
        
        try {
          const verifyResponse = await fetch(`${supabaseUrl}/functions/v1/verify-uk-company`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              companyName: normalizedData.companyName,
              companyNumber: normalizedData.companyNumber
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
      })()
    ]);

    console.log('Parallel operations completed');
    console.log('Calculating comprehensive scores...');

    // Calculate comprehensive scores using evidence-based algorithms with website data
    const scoringResult = calculateComprehensiveScore(normalizedData, companyVerification, websiteAnalysis);
    console.log('Calculated scores:', {
      overall: scoringResult.overallScore,
      confidence: scoringResult.confidenceLevel,
      dataCompleteness: scoringResult.dataCompleteness
    });

    // Get industry benchmarks and regulatory requirements
    const industryBenchmark = getIndustryBenchmark(normalizedData.industry || '');
    const regulatoryRequirements = getRegulatoryRequirements(normalizedData.industry || '');
    
    console.log('Industry benchmark data:', industryBenchmark);
    console.log('Regulatory requirements:', regulatoryRequirements.length);
    
    // Build AI prompt in smaller chunks to avoid memory issues
    console.log('Building AI analysis prompt...');
    
    const promptParts: string[] = [];
    promptParts.push('You are a senior UK market entry analyst. Provide actionable insights based on calculated scores.\n\n');
    promptParts.push(`BUSINESS: ${normalizedData.companyName}\n`);
    promptParts.push(`Industry: ${normalizedData.industry}\n`);
    promptParts.push(`Description: ${normalizedData.businessDescription || 'Not provided'}\n\n`);
    
    promptParts.push('CALCULATED SCORES:\n');
    promptParts.push(`Overall: ${scoringResult.overallScore}/100\n`);
    promptParts.push(`Product-Market Fit: ${scoringResult.scoreBreakdown.productMarketFit}/100\n`);
    promptParts.push(`Regulatory: ${scoringResult.scoreBreakdown.regulatoryCompatibility}/100\n`);
    promptParts.push(`Digital Readiness: ${scoringResult.scoreBreakdown.digitalReadiness}/100\n`);
    promptParts.push(`Logistics: ${scoringResult.scoreBreakdown.logisticsPotential}/100\n`);
    promptParts.push(`Scalability: ${scoringResult.scoreBreakdown.scalabilityAutomation}/100\n`);
    promptParts.push(`Team: ${scoringResult.scoreBreakdown.founderTeamStrength}/100\n`);
    promptParts.push(`Investment: ${scoringResult.scoreBreakdown.investmentReadiness}/100\n\n`);
    
    if (websiteAnalysis) {
      promptParts.push('WEBSITE ANALYSIS:\n');
      promptParts.push(`- SSL: ${websiteAnalysis.trustSignals.hasSSL ? 'Yes' : 'No'}\n`);
      promptParts.push(`- E-commerce: ${websiteAnalysis.ecommerce.hasShoppingCart ? 'Yes' : 'No'}\n`);
      promptParts.push(`- UK signals: ${websiteAnalysis.ukAlignment.hasPoundsGBP || websiteAnalysis.ukAlignment.hasUKAddress ? 'Yes' : 'No'}\n\n`);
    }
    
    if (companyVerification?.verified) {
      promptParts.push('UK COMPANY VERIFIED\n\n');
    }
    
    promptParts.push(`INDUSTRY BENCHMARKS (${businessData.industry}):\n`);
    promptParts.push(`- Market size: £${industryBenchmark.marketSize}B\n`);
    promptParts.push(`- Growth rate: ${industryBenchmark.averageGrowthRate}%\n`);
    promptParts.push(`- Competition: ${industryBenchmark.competitionLevel}\n\n`);
    
    promptParts.push('TASK: Provide ONLY valid JSON (no markdown) with:\n');
    promptParts.push('{\n');
    promptParts.push('  "summary": "2-3 sentence executive summary",\n');
    promptParts.push('  "detailedInsights": [\n');
    promptParts.push('    {\n');
    promptParts.push('      "category": "Product-Market Fit",\n');
    promptParts.push('      "score": <use calculated score>,\n');
    promptParts.push('      "strengths": ["strength1", "strength2"],\n');
    promptParts.push('      "weaknesses": ["weakness1", "weakness2"],\n');
    promptParts.push('      "actionItems": [{"action": "text", "priority": "high/medium/low", "timeframe": "immediate/1-3 months/3-6 months"}]\n');
    promptParts.push('    },\n');
    promptParts.push('    // Repeat for: Regulatory Compatibility, Digital Readiness, Logistics Potential, Scalability Automation, Founder Team Strength, Investment Readiness\n');
    promptParts.push('  ],\n');
    promptParts.push('  "recommendations": {\n');
    promptParts.push('    "immediate": ["action1", "action2"],\n');
    promptParts.push('    "shortTerm": ["action1", "action2"],\n');
    promptParts.push('    "longTerm": ["action1", "action2"]\n');
    promptParts.push('  },\n');
    promptParts.push('  "complianceAssessment": {\n');
    promptParts.push('    "criticalRequirements": ["requirement1", "requirement2"],\n');
    promptParts.push('    "riskAreas": ["risk1", "risk2"],\n');
    promptParts.push('    "complianceScore": <0-100>\n');
    promptParts.push('  }\n');
    promptParts.push('}\n\n');
    promptParts.push('IMPORTANT: Return ONLY the JSON object. No markdown, no explanations.');
    
    const prompt = promptParts.join('');
    console.log('Prompt built successfully, length:', prompt.length);

    // Call Lovable AI (Gemini) with timeout
    console.log('Initiating Lovable AI call...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45 second timeout
    
    let aiResponse;
    try {
      aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              content: 'You are a senior UK market entry analyst. Provide concise, actionable JSON analysis with specific evidence for each score. Respond ONLY with valid JSON, no markdown or extra text.' 
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 5000,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log('Lovable AI responded with status:', aiResponse.status);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('Lovable AI fetch error:', fetchError);
      throw new Error(`Failed to connect to Lovable AI: ${fetchError.message}`);
    }

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      
      // Return calculated scores even if AI analysis fails
      console.warn('AI analysis failed, returning calculated scores with fallback insights');
      
      const fallbackResult = {
        overallScore: scoringResult.overallScore,
        scoreBreakdown: scoringResult.scoreBreakdown,
        scoreEvidence: scoringResult.scoreEvidence,
        summary: `Analysis completed for ${normalizedData.companyName} with an overall UK market readiness score of ${scoringResult.overallScore}/100. Based on proprietary scoring algorithms analyzing your business data, regulatory status, and digital presence.`,
        detailedInsights: createDefaultDetailedInsights(scoringResult),
        recommendations: {
          immediate: ['Complete UK company registration', 'Review industry-specific regulations', 'Establish UK business bank account'],
          shortTerm: ['Build local partnerships', 'Adapt marketing for UK audience', 'Set up UK-compliant payment processing'],
          longTerm: ['Scale UK operations', 'Expand distribution network', 'Build strong brand presence']
        },
        complianceAssessment: {
          criticalRequirements: regulatoryRequirements.map(r => r.requirement).slice(0, 5),
          riskAreas: ['Regulatory compliance', 'Market competition', 'Cultural adaptation'],
          complianceScore: Math.round(scoringResult.scoreBreakdown.regulatoryCompatibility)
        },
        partnerRecommendations: generateEnhancedPartnerRecommendations(
          partnersResult || [],
          normalizedData,
          { scoreBreakdown: scoringResult.scoreBreakdown }
        ),
        metadata: {
          dataCompleteness: {
            score: scoringResult.dataCompleteness,
            missingFields: [],
            completedSections: []
          },
          analysisVersion: 'v2.1-evidence-based',
          modelUsed: 'proprietary-scoring-engine',
          analysisDate: new Date().toISOString(),
          confidenceLevel: scoringResult.confidenceLevel,
          scoringMethod: 'evidence-based-algorithms',
          aiAnalysisError: `Lovable AI error: ${aiResponse.status} - ${errorText.substring(0, 200)}`,
          industryBenchmark,
          regulatoryRequirements: regulatoryRequirements.slice(0, 10),
          dataSourcesUsed: [
            'Evidence-Based Scoring Algorithms',
            'Business Form Data',
            companyVerification?.verified ? 'Companies House API (Verified)' : null,
            'UK Industry Benchmarks (2024-2025)',
            'UK Government Regulatory Database',
            'Supabase Partner Database'
          ].filter(Boolean)
        }
      };
      
      return new Response(
        JSON.stringify(fallbackResult),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const aiData = await aiResponse.json();
    console.log('Lovable AI response received, structure check...');
    
    if (!aiData.choices || !aiData.choices[0] || !aiData.choices[0].message) {
      console.error('Invalid AI response structure:', JSON.stringify(aiData, null, 2));
      throw new Error('Invalid AI response structure');
    }
    
    let analysisText = aiData.choices[0].message.content;
    console.log('Analysis text length:', analysisText?.length || 0);
    
    if (!analysisText || analysisText.trim() === '') {
      console.error('Empty AI response received. Full response:', JSON.stringify(aiData, null, 2));
      throw new Error('Empty AI response');
    }
    
    console.log('AI Analysis received, parsing...');
    
    // Remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Sanitize the response text to remove problematic control characters
    const sanitizedText = analysisText
      .replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F]/g, ' ');
    
    // Parse AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(sanitizedText);
      console.log('AI analysis parsed successfully');
      
      // Validate required fields
      if (!aiAnalysis.summary) {
        console.warn('Missing summary, adding default');
        aiAnalysis.summary = `Analysis completed for ${normalizedData.companyName} with an overall score of ${scoringResult.overallScore}/100.`;
      }
      
      if (!aiAnalysis.detailedInsights || !Array.isArray(aiAnalysis.detailedInsights)) {
        console.warn('Missing or invalid detailedInsights, creating defaults');
        aiAnalysis.detailedInsights = createDefaultDetailedInsights(scoringResult);
      }
      
      if (!aiAnalysis.recommendations) {
        console.warn('Missing recommendations, adding defaults');
        aiAnalysis.recommendations = {
          immediate: ['Review UK regulatory requirements', 'Set up UK business entity'],
          shortTerm: ['Establish local partnerships', 'Adapt products for UK market'],
          longTerm: ['Build UK market presence', 'Scale operations']
        };
      }
      
      if (!aiAnalysis.complianceAssessment) {
        console.warn('Missing complianceAssessment, adding default');
        aiAnalysis.complianceAssessment = {
          criticalRequirements: ['UK company registration', 'Data protection compliance'],
          riskAreas: ['Regulatory compliance', 'Market competition'],
          complianceScore: Math.round(scoringResult.scoreBreakdown.regulatoryCompatibility)
        };
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response. First 500 chars:', sanitizedText.substring(0, 500));
      console.error('Parse error details:', parseError);
      
      // Create fallback analysis
      aiAnalysis = {
        summary: `Comprehensive analysis completed for ${normalizedData.companyName}. Overall readiness score: ${scoringResult.overallScore}/100. Review detailed metrics below for specific guidance on UK market entry.`,
        detailedInsights: createDefaultDetailedInsights(scoringResult),
        recommendations: {
          immediate: ['Complete UK company registration process', 'Review regulatory requirements for your industry'],
          shortTerm: ['Establish local partnerships', 'Develop UK-specific marketing strategy', 'Set up local payment processing'],
          longTerm: ['Build brand presence in UK market', 'Scale operations based on market response', 'Expand distribution channels']
        },
        complianceAssessment: {
          criticalRequirements: ['UK company registration', 'GDPR compliance', 'Industry-specific licenses'],
          riskAreas: ['Regulatory complexity', 'Market competition', 'Supply chain logistics'],
          complianceScore: Math.round(scoringResult.scoreBreakdown.regulatoryCompatibility)
        }
      };
      console.log('Using fallback analysis structure');
    }

    console.log('Merging AI insights with calculated scores...');

    // Use partners fetched in parallel (already available from Promise.all above)
    const partners = partnersResult;

    // Advanced partner matching algorithm using calculated scores and enhanced matching
    const partnerRecommendations = generateEnhancedPartnerRecommendations(
      partners || [],
      normalizedData,
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
        analysisVersion: 'v2.1-evidence-based',
        modelUsed: 'gemini-2.5-flash + proprietary-scoring-engine',
        analysisDate: new Date().toISOString(),
        confidenceLevel: scoringResult.confidenceLevel,
        scoringMethod: 'evidence-based-algorithms',
        companyVerification: companyVerification ? {
          verified: companyVerification.verified,
          data: companyVerification.data,
          insights: companyVerification.insights
        } : { verified: false },
        industryBenchmark,
        regulatoryRequirements,
        dataSourcesUsed: [
          'Evidence-Based Scoring Algorithms',
          'Business Form Data',
          companyVerification?.verified ? 'Companies House API (Verified)' : null,
          'UK Industry Benchmarks (2024-2025)',
          'UK Government Regulatory Database',
          'Supabase Partner Database',
          'Gemini 2.5 Flash AI Analysis'
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

// Helper function to create default detailed insights from scoring results
function createDefaultDetailedInsights(scoringResult: any) {
  const categories = [
    { key: 'productMarketFit', name: 'Product-Market Fit' },
    { key: 'regulatoryCompatibility', name: 'Regulatory Compatibility' },
    { key: 'digitalReadiness', name: 'Digital Readiness' },
    { key: 'logisticsPotential', name: 'Logistics Potential' },
    { key: 'scalabilityAutomation', name: 'Scalability Automation' },
    { key: 'founderTeamStrength', name: 'Founder Team Strength' },
    { key: 'investmentReadiness', name: 'Investment Readiness' }
  ];

  return categories.map(cat => {
    const score = scoringResult.scoreBreakdown[cat.key] || 0;
    const evidence = scoringResult.scoreEvidence?.find((e: any) => 
      e.category?.toLowerCase().includes(cat.name.toLowerCase().split(' ')[0])
    );

    const strengths = evidence?.factors
      ?.filter((f: any) => f.impact === 'positive')
      ?.slice(0, 3)
      ?.map((f: any) => f.evidence) || ['Baseline capabilities present'];

    const weaknesses = evidence?.factors
      ?.filter((f: any) => f.impact === 'negative')
      ?.slice(0, 3)
      ?.map((f: any) => f.evidence) || ['Areas for improvement identified'];

    return {
      category: cat.name,
      score,
      strengths,
      weaknesses,
      actionItems: [
        {
          action: score < 60 ? `Improve ${cat.name.toLowerCase()}` : `Maintain ${cat.name.toLowerCase()}`,
          priority: score < 60 ? 'high' : 'medium',
          timeframe: score < 60 ? 'immediate' : '1-3 months'
        }
      ]
    };
  });
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
