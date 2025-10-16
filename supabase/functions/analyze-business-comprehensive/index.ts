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
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not found in environment');
      throw new Error('OpenAI API key not configured');
    }
    console.log('OpenAI API key loaded successfully');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing comprehensive analysis for:', businessData.companyName);

    // Run independent operations in parallel for better performance
    console.log('Starting parallel operations: website scraping, company verification, partner fetching...');
    
    const [websiteAnalysis, companyVerification, partnersResult] = await Promise.all([
      // 1. Scrape website if URL provided
      (async () => {
        if (!businessData.websiteUrl) return null;
        
        console.log('Scraping website content...');
        try {
          const analysis = await scrapeWebsite(businessData.websiteUrl);
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
      })()
    ]);

    console.log('Parallel operations completed');
    console.log('Calculating comprehensive scores...');

    // Calculate comprehensive scores using evidence-based algorithms with website data
    const scoringResult = calculateComprehensiveScore(businessData, companyVerification, websiteAnalysis);
    console.log('Calculated scores:', {
      overall: scoringResult.overallScore,
      confidence: scoringResult.confidenceLevel,
      dataCompleteness: scoringResult.dataCompleteness
    });

    // Get industry benchmarks and regulatory requirements
    const industryBenchmark = getIndustryBenchmark(businessData.industry || '');
    const regulatoryRequirements = getRegulatoryRequirements(businessData.industry || '');
    
    console.log('Industry benchmark data:', industryBenchmark);
    console.log('Regulatory requirements:', regulatoryRequirements.length);
    
    console.log('Preparing AI prompt with data...');
    console.log('Prompt will include website analysis:', !!websiteAnalysis);
    console.log('Prompt will include company verification:', !!companyVerification);

    // Create detailed prompt for AI to generate insights based on calculated scores
    let prompt;
    try {
      console.log('Building prompt string...');
      prompt = `You are a senior UK market entry analyst with 15+ years of expertise in business assessment, regulatory compliance, and market strategy across multiple industries.

A comprehensive scoring analysis has been completed for this business. Your task is to provide detailed, industry-specific insights, actionable recommendations with concrete timelines and costs, and strategic guidance based on the calculated scores and evidence.

Conduct a rigorous, evidence-based analysis of the following business for UK market entry readiness.

BUSINESS PROFILE:
Company: ${businessData.companyName}
Description: ${businessData.businessDescription}
Industry: ${businessData.industry}
Company Size: ${businessData.companySize}
Website: ${businessData.websiteUrl || 'Not provided'}
Target Market: ${businessData.targetMarket || 'Not specified'}
Market Entry Timeline: ${businessData.marketEntryTimeline || 'Not specified'}

${websiteAnalysis ? `
DETAILED WEBSITE ANALYSIS:
Core Metrics:
- Page Title: ${websiteAnalysis.title}
- Meta Description: ${websiteAnalysis.description}
- Content Length: ${websiteAnalysis.content.length} characters
- Content Quality: ${websiteAnalysis.content.length > 1500 ? 'Comprehensive and detailed' : websiteAnalysis.content.length > 800 ? 'Moderate depth' : 'Basic content'}
- Content Preview: ${websiteAnalysis.content.substring(0, 500)}...

Digital Infrastructure:
- Navigation Menu: ${websiteAnalysis.structure.hasNavigation ? 'Yes - Professional site structure' : 'No - May impact user experience'}
- Contact Form: ${websiteAnalysis.structure.hasContactForm ? 'Yes - Enables lead capture' : 'No - Missing lead generation tool'}
- Social Media Integration: ${websiteAnalysis.structure.hasSocialLinks ? 'Yes - Connected to social platforms' : 'No - Limited social presence'}
- Multi-language Support: ${websiteAnalysis.structure.languages.length > 1 ? `Yes (${websiteAnalysis.structure.languages.join(', ')})` : 'English only'}

E-commerce Capabilities:
- Shopping Cart: ${websiteAnalysis.ecommerce.hasShoppingCart ? 'Yes - E-commerce enabled' : 'No - Not e-commerce ready'}
- Pricing Displayed: ${websiteAnalysis.ecommerce.hasPricing ? 'Yes - Transparent pricing' : 'No - Pricing not visible'}
- Payment Integration: ${websiteAnalysis.ecommerce.acceptsPayments ? 'Yes - Checkout flow present' : 'No - No payment processing'}

UK Market Readiness Signals:
- GBP Pricing: ${websiteAnalysis.ukAlignment.hasPoundsGBP ? 'Yes - UK market targeting detected' : 'No - No GBP pricing found'}
- UK Address Listed: ${websiteAnalysis.ukAlignment.hasUKAddress ? 'Yes - UK presence confirmed' : 'No - No UK address detected'}
- UK Phone Number: ${websiteAnalysis.ukAlignment.hasUKPhone ? 'Yes - UK contact available' : 'No - No UK phone number'}

Trust & Compliance:
- SSL Certificate: ${websiteAnalysis.trustSignals.hasSSL ? 'Yes - Secure HTTPS connection' : 'No - CRITICAL: No SSL security'}
- Privacy Policy: ${websiteAnalysis.trustSignals.hasPrivacyPolicy ? 'Yes - GDPR compliance indicator' : 'No - Missing privacy policy'}
- Terms of Service: ${websiteAnalysis.trustSignals.hasTermsOfService ? 'Yes - Legal protection present' : 'No - Missing terms'}

WEBSITE QUALITY ASSESSMENT:
${websiteAnalysis.content.length > 1500 && websiteAnalysis.structure.hasNavigation && websiteAnalysis.trustSignals.hasSSL ? 
  'Professional website with comprehensive content and proper infrastructure' :
  websiteAnalysis.content.length > 800 && websiteAnalysis.trustSignals.hasSSL ?
  'Functional website but could benefit from more content and features' :
  'Basic website requiring significant enhancement for UK market credibility'}
` : 'Website not analyzed (no URL provided or scraping failed)'}

DIGITAL INFRASTRUCTURE:
Online Sales Platform: ${businessData.onlineSalesPlatform || 'No'}
Social Media: ${businessData.socialMediaPlatforms?.join(', ') || 'None'}
Website Features: ${businessData.websiteFeatures?.join(', ') || 'None'}
Digital Marketing Budget: ${businessData.digitalMarketingBudget || 'Not specified'}

COMPLIANCE STATUS:
UK Registered: ${businessData.ukRegistered || 'No'}
Business Type: ${businessData.businessType || 'Not specified'}
Completed Compliance: ${businessData.complianceCompleted?.join(', ') || 'None'}
IP Protection: ${businessData.ipProtection?.join(', ') || 'None'}

STRATEGIC OBJECTIVES:
Primary Goal: ${businessData.primaryObjective || 'Not specified'}
Planned Investments: ${businessData.plannedInvestments?.join(', ') || 'None'}
Support Needed: ${businessData.requiredSupport?.join(', ') || 'None'}
Success Metrics: ${businessData.keySuccessMetrics?.join(', ') || 'None'}

CALCULATED SCORES (Evidence-Based Algorithms):
Overall Score: ${scoringResult.overallScore}/100
Data Completeness: ${scoringResult.dataCompleteness}%
Confidence Level: ${scoringResult.confidenceLevel.toUpperCase()}

Score Breakdown:
- Product-Market Fit: ${scoringResult.scoreBreakdown.productMarketFit}/100
- Regulatory Compatibility: ${scoringResult.scoreBreakdown.regulatoryCompatibility}/100
- Digital Readiness: ${scoringResult.scoreBreakdown.digitalReadiness}/100
- Logistics Potential: ${scoringResult.scoreBreakdown.logisticsPotential}/100
- Scalability & Automation: ${scoringResult.scoreBreakdown.scalabilityAutomation}/100
- Founder & Team Strength: ${scoringResult.scoreBreakdown.founderTeamStrength}/100
- Investment Readiness: ${scoringResult.scoreBreakdown.investmentReadiness}/100

SCORING EVIDENCE:
${scoringResult.scoreEvidence.map(evidence => `
${evidence.category} (${evidence.score}/100):
${evidence.factors.map(f => `  • ${f.factor} (${f.points > 0 ? '+' : ''}${f.points} points): ${f.evidence}`).join('\n')}
`).join('\n')}

UK MARKET-SPECIFIC REQUIREMENTS TO EVALUATE:

REGULATORY COMPLIANCE:
- Companies House registration and annual filing requirements
- HMRC tax registration (Corporation Tax, VAT if turnover >£90k, PAYE if employing)
- Industry-specific licenses (FSA for food, FCA for financial services, CQC for healthcare, etc.)
- GDPR compliance and ICO registration (if processing personal data)
- Product safety and CE/UKCA marking requirements
- Trading Standards compliance
- Anti-money laundering (AML) requirements for relevant sectors

INDUSTRY-SPECIFIC CRITERIA FOR ${businessData.industry}:
- Analyze this industry's competitive landscape in the UK
- Identify UK-specific regulations, certifications, or standards required
- Assess market saturation and growth trends in the UK for this sector
- Evaluate typical customer acquisition costs and sales cycles in UK market
- Consider seasonal variations and UK consumer behavior patterns
- Identify key UK competitors and market positioning opportunities

MARKET ENTRY BARRIERS:
- Legal entity setup costs and timeline (£12-£500 + professional fees)
- UK business bank account requirements and processing times (2-6 weeks)
- Physical presence requirements (registered office address, trade premises)
- Professional indemnity insurance requirements for the sector
- Employee rights and employment law compliance (if hiring UK staff)
- Import duties, customs procedures, and Brexit implications (if importing goods)

YOUR TASK:

Based on the calculated scores and evidence above, provide:

1. STRATEGIC INSIGHTS (for each category):
   - WHY the score is at its current level based on UK market context
   - Specific UK market benchmarks and how this business compares
   - Industry-specific considerations and competitive positioning in UK

2. STRENGTHS TO LEVERAGE:
   - Concrete competitive advantages for UK market entry
   - How to maximize these strengths in UK context
   - Potential UK partnerships or channels to leverage

3. CRITICAL WEAKNESSES:
   - Specific gaps that will prevent or delay UK market success
   - UK regulatory non-compliance risks with potential penalties
   - Competitive disadvantages versus established UK players

4. PRIORITIZED ACTION ITEMS (for each category):
   - SPECIFIC action with detailed steps (not generic advice)
   - ESTIMATED cost range in GBP (e.g., "£2,000-£5,000")
   - TIMELINE with milestones (e.g., "Week 1-2: X, Week 3-4: Y")
   - RESOURCES needed (people, tools, partners)
   - EXPECTED IMPACT on score and business outcomes
   - PRIORITY level based on urgency and UK legal requirements

5. UK MARKET-SPECIFIC RECOMMENDATIONS:
   - Immediate actions required for UK legal compliance
   - Industry-specific UK certifications or memberships to pursue
   - Recommended UK service providers (accountants, solicitors, etc.)
   - UK government grants, schemes, or support programs available
   - Networking opportunities and industry associations in UK
   - Geographic considerations (London vs. regions for this industry)

INDUSTRY BENCHMARKS (UK Market Data):
Average Industry Growth Rate: ${industryBenchmark.averageGrowthRate}% per year
UK Market Size: £${industryBenchmark.marketSize} billion
Competition Level: ${industryBenchmark.competitionLevel.toUpperCase()}
Entry Barriers: ${industryBenchmark.entryBarriers.toUpperCase()}
Digital Adoption Rate: ${industryBenchmark.digitalAdoptionRate}%
Average Profit Margins: ${industryBenchmark.averageMargins}%
Typical Customer Acquisition Cost: ${industryBenchmark.typicalCustomerAcquisitionCost}
Average Time to Market: ${industryBenchmark.averageTimeToMarket}
Regulatory Complexity: ${industryBenchmark.regulatoryComplexity.toUpperCase()}
Seasonality Impact: ${industryBenchmark.seasonality.toUpperCase()}
Key Success Factors: ${industryBenchmark.keySuccessFactors.join(', ')}

REGULATORY REQUIREMENTS (Real-time UK Compliance):
${regulatoryRequirements.map(req => `
- ${req.name} (${req.authority})
  Required: ${req.required ? 'YES' : 'NO'} | Urgency: ${req.urgency.toUpperCase()}
  Cost: ${req.estimatedCost} | Timeline: ${req.timeToComplete}
  Description: ${req.description}
  More info: ${req.link}
`).join('\n')}

COMPANY VERIFICATION DATA:
${companyVerification?.verified ? `
Verified UK Company: YES
Company Number: ${companyVerification.data?.companyNumber || 'N/A'}
Company Status: ${companyVerification.data?.companyStatus || 'N/A'}
Company Age: ${companyVerification.insights?.ageInYears || 'N/A'} years
Filing Compliance: ${companyVerification.insights?.filingCompliance ? 'UP TO DATE' : 'OVERDUE'}
Accounts Overdue: ${companyVerification.insights?.accountsOverdue ? 'YES' : 'NO'}
Number of Officers: ${companyVerification.insights?.numberOfOfficers || 0}
Has Charges: ${companyVerification.insights?.hasCharges ? 'YES' : 'NO'}
Insolvency History: ${companyVerification.insights?.hasInsolvencyHistory ? 'YES' : 'NO'}
Industry Classification (SIC): ${companyVerification.insights?.industryClassification?.map((sic: any) => sic.description).join(', ') || 'N/A'}
` : 'Company not verified with Companies House - UK registration required'}

CRITICAL REQUIREMENTS:
- DO NOT recalculate scores - use the provided scores as-is
- Every action item MUST include: specific steps, cost estimate, timeline, resources, and expected impact
- Reference SPECIFIC UK regulations, not generic compliance advice
- Provide INDUSTRY-SPECIFIC insights based on the benchmark data above
- Compare business performance against industry benchmarks
- Include concrete examples and case studies where relevant
- Prioritize based on LEGAL REQUIREMENTS first, then strategic importance
- Consider the stated market entry timeline and budget constraints
- Use the real regulatory requirements data to provide accurate compliance guidance
- Reference Companies House verification data in your assessment

Provide your analysis in this JSON structure (using the pre-calculated scores):
{
  "overallScore": ${scoringResult.overallScore},
  "scoreBreakdown": {
    "productMarketFit": ${scoringResult.scoreBreakdown.productMarketFit},
    "regulatoryCompatibility": ${scoringResult.scoreBreakdown.regulatoryCompatibility},
    "digitalReadiness": ${scoringResult.scoreBreakdown.digitalReadiness},
    "logisticsPotential": ${scoringResult.scoreBreakdown.logisticsPotential},
    "scalabilityAutomation": ${scoringResult.scoreBreakdown.scalabilityAutomation},
    "founderTeamStrength": ${scoringResult.scoreBreakdown.founderTeamStrength},
    "investmentReadiness": ${scoringResult.scoreBreakdown.investmentReadiness}
  },
  "summary": "<2-3 sentence executive summary>",
  "detailedInsights": [
    {
      "category": "Product-Market Fit",
      "score": <0-100>,
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "actionItems": [
        {
          "action": "specific action to take",
          "priority": "high|medium|low",
          "timeframe": "immediate|1-3 months|3-6 months"
        }
      ]
    },
    {
      "category": "Regulatory Compatibility",
      "score": <0-100>,
      "strengths": [...],
      "weaknesses": [...],
      "actionItems": [...]
    },
    {
      "category": "Digital Readiness",
      "score": <0-100>,
      "strengths": [...],
      "weaknesses": [...],
      "actionItems": [...]
    },
    {
      "category": "Logistics Potential",
      "score": <0-100>,
      "strengths": [...],
      "weaknesses": [...],
      "actionItems": [...]
    },
    {
      "category": "Scalability & Automation",
      "score": <0-100>,
      "strengths": [...],
      "weaknesses": [...],
      "actionItems": [...]
    },
    {
      "category": "Founder & Team Strength",
      "score": <0-100>,
      "strengths": [...],
      "weaknesses": [...],
      "actionItems": [...]
    },
    {
      "category": "Investment Readiness",
      "score": <0-100>,
      "strengths": [...],
      "weaknesses": [...],
      "actionItems": [...]
    }
  ],
  "recommendations": {
    "immediate": ["action 1", "action 2", "action 3"],
    "shortTerm": ["action 1", "action 2", "action 3"],
    "longTerm": ["action 1", "action 2", "action 3"]
  },
  "complianceAssessment": {
    "criticalRequirements": ["requirement 1", "requirement 2"],
    "riskAreas": ["risk 1", "risk 2"],
    "complianceScore": <0-100>
  }
}

Provide detailed, actionable insights based on the UK market context. Be specific and practical.`;
      
      console.log('Prompt built successfully, length:', prompt.length);
    } catch (promptError) {
      console.error('Error building prompt:', promptError);
      throw new Error(`Failed to build analysis prompt: ${promptError.message}`);
    }

    // Call OpenAI API with timeout
    console.log('Initiating OpenAI API call...');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    let openAIResponse;
    try {
      openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-mini-2025-08-07',
          messages: [
            { 
              role: 'system', 
              content: 'You are a senior UK market entry analyst specializing in evidence-based business assessments. You provide rigorous, data-driven analysis with specific scoring methodologies. Always respond with valid JSON only, citing specific evidence for each score and recommendation.' 
            },
            { role: 'user', content: prompt }
          ],
          max_completion_tokens: 8000,
          response_format: { type: "json_object" }
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      console.log('OpenAI API responded with status:', openAIResponse.status);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.error('OpenAI API fetch error:', fetchError);
      throw new Error(`Failed to connect to OpenAI API: ${fetchError.message}`);
    }

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', openAIResponse.status, errorText);
      
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
            analysisVersion: 'v2.1-evidence-based',
            modelUsed: 'proprietary-scoring-engine',
            analysisDate: new Date().toISOString(),
            confidenceLevel: scoringResult.confidenceLevel,
            scoringMethod: 'evidence-based-algorithms',
            aiAnalysisError: `OpenAI API error: ${openAIResponse.status}`,
            industryBenchmark,
            regulatoryRequirements
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response received, structure check...');
    
    if (!openAIData.choices || !openAIData.choices[0] || !openAIData.choices[0].message) {
      console.error('Invalid OpenAI response structure:', JSON.stringify(openAIData, null, 2));
      throw new Error('Invalid OpenAI response structure');
    }
    
    const analysisText = openAIData.choices[0].message.content;
    console.log('Analysis text length:', analysisText?.length || 0);
    
    if (!analysisText || analysisText.trim() === '') {
      console.error('Empty AI response received. Full response:', JSON.stringify(openAIData, null, 2));
      throw new Error('Empty AI response');
    }
    
    console.log('AI Analysis received, parsing...');
    
    // Parse AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
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
        analysisVersion: 'v2.1-evidence-based',
        modelUsed: 'gpt-5-mini + proprietary-scoring-engine',
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
          'GPT-5 Strategic Analysis'
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
