import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';
import { calculateComprehensiveScore } from './scoring-engine.ts';

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
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Processing comprehensive analysis for:', businessData.companyName);

    // Calculate evidence-based scores using research-backed algorithms
    console.log('Calculating comprehensive scores...');

    // Verify UK company registration if company number provided
    let companyVerification = null;
    if (businessData.companyNumber || businessData.ukRegistered === 'yes') {
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
          companyVerification = await verifyResponse.json();
          console.log('Company verification result:', companyVerification.verified);
        }
      } catch (verifyError) {
        console.log('Company verification failed, continuing without it:', verifyError);
      }
    }

    // Calculate comprehensive scores using evidence-based algorithms
    const scoringResult = calculateComprehensiveScore(businessData, companyVerification);
    console.log('Calculated scores:', {
      overall: scoringResult.overallScore,
      confidence: scoringResult.confidenceLevel,
      dataCompleteness: scoringResult.dataCompleteness
    });

    // Create detailed prompt for AI to generate insights based on calculated scores
    const prompt = `You are a senior UK market entry analyst with expertise in business assessment, regulatory compliance, and market strategy.

A comprehensive scoring analysis has been completed for this business. Your task is to provide detailed insights, actionable recommendations, and strategic guidance based on the calculated scores and evidence.

Conduct a rigorous, evidence-based analysis of the following business for UK market entry readiness.

BUSINESS PROFILE:
Company: ${businessData.companyName}
Description: ${businessData.businessDescription}
Industry: ${businessData.industry}
Company Size: ${businessData.companySize}
Website: ${businessData.websiteUrl || 'Not provided'}
Target Market: ${businessData.targetMarket || 'Not specified'}
Market Entry Timeline: ${businessData.marketEntryTimeline || 'Not specified'}

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

YOUR TASK:

Based on the calculated scores and evidence above, provide:
1. Strategic insights explaining WHY each score is at its current level
2. Specific strengths to leverage in each category
3. Critical weaknesses that need immediate attention
4. Prioritized action items with timelines and expected impact
5. UK market-specific recommendations and regulatory guidance

IMPORTANT:
- DO NOT recalculate scores - use the provided scores as-is
- Focus on actionable insights and strategic recommendations
- Explain the business implications of each score
- Provide specific next steps tied to improving low scores
- Reference UK market conditions and requirements

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

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: 'You are a senior UK market entry analyst specializing in evidence-based business assessments. You provide rigorous, data-driven analysis with specific scoring methodologies. Always respond with valid JSON only, citing specific evidence for each score and recommendation.' 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const analysisText = openAIData.choices[0].message.content;
    
    console.log('AI Analysis received, parsing...');
    
    // Parse AI response
    let aiAnalysis;
    try {
      aiAnalysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Invalid AI response format');
    }

    console.log('Merging AI insights with calculated scores...');

    // Fetch verified partners from database
    console.log('Fetching verified partners...');
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('*')
      .eq('verification_status', 'verified');

    if (partnersError) {
      console.error('Error fetching partners:', partnersError);
    }

    // Advanced partner matching algorithm using calculated scores
    const partnerRecommendations = generateSmartPartnerMatches(
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
        modelUsed: 'gpt-5 + proprietary-scoring-engine',
        analysisDate: new Date().toISOString(),
        confidenceLevel: scoringResult.confidenceLevel,
        scoringMethod: 'evidence-based-algorithms',
        companyVerification: companyVerification ? {
          verified: companyVerification.verified,
          data: companyVerification.data,
          insights: companyVerification.insights
        } : { verified: false },
        dataSourcesUsed: [
          'Evidence-Based Scoring Algorithms',
          'Business Form Data',
          companyVerification?.verified ? 'Companies House API (Verified)' : null,
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

// Calculate overall confidence level
function calculateConfidenceLevel(
  dataCompleteness: { score: number },
  analysis: any
): 'high' | 'medium' | 'low' {
  const dataScore = dataCompleteness.score;
  const overallScore = analysis.overallScore || 0;

  if (dataScore >= 80 && overallScore > 0) return 'high';
  if (dataScore >= 60) return 'medium';
  return 'low';
}

// Advanced partner matching with scoring
function generateSmartPartnerMatches(
  partners: any[],
  businessData: any,
  analysis: any
): any[] {
  const categories = ['legal', 'accounting', 'marketing', 'logistics'];
  const partnerRecommendations = [];

  for (const category of categories) {
    const categoryPartners = partners.filter(p => p.category === category);
    
    if (categoryPartners.length === 0) continue;

    // Score each partner based on business needs
    const scoredPartners = categoryPartners.map(partner => {
      const score = calculatePartnerMatchScore(partner, businessData, analysis, category);
      return { ...partner, matchScore: score };
    });

    // Sort by match score and take top 3
    const topPartners = scoredPartners
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    const recommendation = generateCategoryRecommendation(
      category,
      businessData,
      analysis,
      topPartners
    );

    if (recommendation) {
      partnerRecommendations.push({
        category,
        partners: topPartners,
        ...recommendation
      });
    }
  }

  return partnerRecommendations;
}

// Calculate partner match score
function calculatePartnerMatchScore(
  partner: any,
  businessData: any,
  analysis: any,
  category: string
): number {
  let score = 50; // Base score

  // Industry expertise match
  if (partner.specialties && Array.isArray(partner.specialties)) {
    const industryMatch = partner.specialties.some((specialty: string) =>
      specialty.toLowerCase().includes(businessData.industry?.toLowerCase() || '')
    );
    if (industryMatch) score += 20;
  }

  // Category-specific scoring
  switch (category) {
    case 'legal':
      if (businessData.ukRegistered === 'no') score += 25;
      if (!businessData.complianceCompleted || businessData.complianceCompleted.length === 0) score += 15;
      break;
      
    case 'accounting':
      if (businessData.ukRegistered === 'no') score += 20;
      if (analysis.scoreBreakdown?.investmentReadiness < 60) score += 15;
      break;
      
    case 'marketing':
      if (businessData.onlineSalesPlatform === 'no') score += 25;
      if (analysis.scoreBreakdown?.digitalReadiness < 60) score += 20;
      break;
      
    case 'logistics':
      const isProductBusiness = ['retail', 'manufacturing', 'ecommerce', 'wholesale'].some(
        term => businessData.industry?.toLowerCase().includes(term)
      );
      if (isProductBusiness) score += 30;
      break;
  }

  // Location relevance (if partner location matches target market)
  if (partner.location && businessData.targetMarket) {
    if (partner.location.toLowerCase().includes(businessData.targetMarket.toLowerCase())) {
      score += 10;
    }
  }

  return Math.min(score, 100);
}

// Generate category-specific recommendation
function generateCategoryRecommendation(
  category: string,
  businessData: any,
  analysis: any,
  partners: any[]
): { reason: string; urgency: 'high' | 'medium' | 'low'; insights: string[] } | null {
  if (partners.length === 0) return null;

  const recommendations: Record<string, any> = {
    legal: {
      reason: businessData.ukRegistered === 'no' 
        ? 'Immediate legal support required for UK company registration and compliance setup'
        : 'Legal guidance needed for ongoing compliance and regulatory requirements',
      urgency: businessData.ukRegistered === 'no' ? 'high' : 'medium',
      insights: [
        `${partners.length} verified legal partners available`,
        businessData.ukRegistered === 'no' ? 'Priority: Company registration' : 'Focus: Compliance maintenance',
        `Average match score: ${Math.round(partners.reduce((sum, p) => sum + p.matchScore, 0) / partners.length)}%`
      ]
    },
    accounting: {
      reason: 'Financial compliance and tax registration essential for UK market operations',
      urgency: businessData.ukRegistered === 'no' ? 'high' : 'medium',
      insights: [
        `${partners.length} qualified accounting partners identified`,
        'Services: VAT registration, tax compliance, financial reporting',
        `Match confidence: ${Math.round(partners.reduce((sum, p) => sum + p.matchScore, 0) / partners.length)}%`
      ]
    },
    marketing: {
      reason: analysis.scoreBreakdown?.digitalReadiness < 60
        ? 'Digital marketing expertise critical to improve online presence and reach UK customers'
        : 'Marketing support to optimize UK market penetration and brand positioning',
      urgency: analysis.scoreBreakdown?.digitalReadiness < 60 ? 'high' : 'medium',
      insights: [
        `${partners.length} specialized marketing partners available`,
        businessData.onlineSalesPlatform === 'no' ? 'Priority: E-commerce setup' : 'Focus: Growth optimization',
        `Relevance score: ${Math.round(partners.reduce((sum, p) => sum + p.matchScore, 0) / partners.length)}%`
      ]
    },
    logistics: {
      reason: ['retail', 'manufacturing', 'ecommerce'].some(term => 
        businessData.industry?.toLowerCase().includes(term)
      ) 
        ? 'Supply chain and distribution infrastructure critical for product-based business'
        : 'Logistics optimization to ensure efficient UK market operations',
      urgency: ['retail', 'manufacturing', 'ecommerce'].some(term => 
        businessData.industry?.toLowerCase().includes(term)
      ) ? 'high' : 'medium',
      insights: [
        `${partners.length} logistics partners with UK expertise`,
        'Capabilities: Warehousing, distribution, customs support',
        `Industry alignment: ${Math.round(partners.reduce((sum, p) => sum + p.matchScore, 0) / partners.length)}%`
      ]
    }
  };

  return recommendations[category] || null;
}
