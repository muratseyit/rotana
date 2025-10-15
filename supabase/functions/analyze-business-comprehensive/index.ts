import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

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

    // Create detailed prompt for comprehensive analysis with evidence-based scoring
    const prompt = `You are a senior UK market entry analyst with expertise in business assessment, regulatory compliance, and market strategy. 

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

SCORING METHODOLOGY:
For each category, apply these evidence-based criteria:

1. Product-Market Fit (0-100):
   - Market demand evidence: +20-30 points
   - Competitive positioning: +15-25 points
   - Value proposition clarity: +15-20 points
   - Customer validation: +15-25 points
   
2. Regulatory Compatibility (0-100):
   - UK registration status: +25 points if complete
   - Industry compliance progress: +25 points
   - IP protection status: +20 points
   - Legal structure suitability: +15-30 points

3. Digital Readiness (0-100):
   - E-commerce capability: +25 points
   - Website functionality: +20-25 points
   - Social media presence: +15-20 points
   - Digital marketing strategy: +15-30 points

4. Logistics Potential (0-100):
   - Supply chain clarity: +25-30 points
   - Distribution strategy: +20-25 points
   - Inventory management: +15-25 points
   - Fulfilment readiness: +15-25 points

5. Scalability & Automation (0-100):
   - Process documentation: +20-25 points
   - Technology infrastructure: +25-30 points
   - Automation level: +20-25 points
   - Growth capacity: +15-25 points

6. Founder & Team Strength (0-100):
   - Market expertise: +25-30 points
   - Team completeness: +20-25 points
   - Advisory support: +15-20 points
   - Execution track record: +20-30 points

7. Investment Readiness (0-100):
   - Financial planning: +25-30 points
   - Funding strategy: +20-25 points
   - ROI projection quality: +20-25 points
   - Resource allocation: +15-25 points

CRITICAL REQUIREMENTS:
- Base scores on ACTUAL data provided, not assumptions
- Cite specific evidence from the business data for each score
- Flag missing information that impacts scoring accuracy
- Provide concrete, actionable next steps tied to score gaps
- Include UK-specific regulatory and market context

Provide comprehensive analysis in this JSON structure:
{
  "overallScore": <0-100>,
  "scoreBreakdown": {
    "productMarketFit": <0-100>,
    "regulatoryCompatibility": <0-100>,
    "digitalReadiness": <0-100>,
    "logisticsPotential": <0-100>,
    "scalabilityAutomation": <0-100>,
    "founderTeamStrength": <0-100>,
    "investmentReadiness": <0-100>
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
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', analysisText);
      throw new Error('Invalid AI response format');
    }

    // Calculate data completeness score for transparency
    const dataCompleteness = calculateDataCompleteness(businessData);

    // Fetch verified partners from database
    console.log('Fetching verified partners...');
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('*')
      .eq('verification_status', 'verified');

    if (partnersError) {
      console.error('Error fetching partners:', partnersError);
    }

    // Advanced partner matching algorithm
    const partnerRecommendations = generateSmartPartnerMatches(
      partners || [],
      businessData,
      analysis
    );

    // Add transparency metadata
    const comprehensiveResult = {
      ...analysis,
      partnerRecommendations,
      metadata: {
        dataCompleteness,
        analysisVersion: '2.0',
        modelUsed: 'gpt-5-2025-08-07',
        analysisDate: new Date().toISOString(),
        confidenceLevel: calculateConfidenceLevel(dataCompleteness, analysis),
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
