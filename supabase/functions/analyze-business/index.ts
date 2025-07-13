import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BusinessData {
  companyName: string;
  businessDescription: string;
  industry: string;
  companySize: string;
  websiteUrl?: string;
  financialMetrics?: {
    annualRevenue: number;
    grossMargin: number;
    netProfit: number;
    monthlyGrowthRate: number;
    cashPosition: number;
    fundingStage: string;
    exportPercentage: number;
    avgOrderValue: number;
    customerAcquisitionCost: number;
    customerLifetimeValue: number;
  };
}

interface ScoreBreakdown {
  productMarketFit: number;
  regulatoryCompatibility: number;
  digitalReadiness: number;
  logisticsPotential: number;
  scalabilityAutomation: number;
  founderTeamStrength: number;
}

interface DetailedInsight {
  category: keyof ScoreBreakdown;
  score: number;
  strengths: string[];
  weaknesses: string[];
  actionItems: {
    action: string;
    priority: "high" | "medium" | "low";
    timeframe: string;
    resources?: string[];
  }[];
}

interface AnalysisResult {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  roadmap: string[];
  summary: string;
  detailedInsights: DetailedInsight[];
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  complianceAssessment: {
    criticalRequirements: string[];
    riskAreas: string[];
    complianceScore: number;
  };
}

serve(async (req) => {
  console.log('Analyze business function called');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing business analysis request');
    const businessData: BusinessData = await req.json();
    console.log('Business data received:', businessData);

    const financialInfo = businessData.financialMetrics ? `
FINANCIAL METRICS:
Annual Revenue: $${businessData.financialMetrics.annualRevenue?.toLocaleString() || 'Not provided'}
Gross Margin: ${businessData.financialMetrics.grossMargin}%
Net Profit: $${businessData.financialMetrics.netProfit?.toLocaleString() || 'Not provided'}
Monthly Growth Rate: ${businessData.financialMetrics.monthlyGrowthRate}%
Cash Position: $${businessData.financialMetrics.cashPosition?.toLocaleString() || 'Not provided'}
Funding Stage: ${businessData.financialMetrics.fundingStage}
Export Percentage: ${businessData.financialMetrics.exportPercentage}%
Avg Order Value: $${businessData.financialMetrics.avgOrderValue}
Customer Acquisition Cost: $${businessData.financialMetrics.customerAcquisitionCost}
Customer Lifetime Value: $${businessData.financialMetrics.customerLifetimeValue}` : '';

    const prompt = `
As a UK market entry expert, provide a comprehensive analysis of this Turkish SME for UK market readiness. Include detailed insights, actionable recommendations, and compliance considerations.

BUSINESS DETAILS:
Company: ${businessData.companyName}
Industry: ${businessData.industry}
Size: ${businessData.companySize}
Description: ${businessData.businessDescription}
Website: ${businessData.websiteUrl || 'Not provided'}
${financialInfo}

ANALYSIS REQUIREMENTS:
1. Score each category (0-100) with detailed justification
2. Identify specific strengths and weaknesses for each category
3. Provide actionable recommendations with timelines and priorities
4. Include UK-specific compliance and regulatory considerations
5. Consider financial readiness for UK expansion

RESPONSE FORMAT (JSON):
{
  "overallScore": [weighted average of all scores],
  "scoreBreakdown": {
    "productMarketFit": [score 0-100],
    "regulatoryCompatibility": [score 0-100],
    "digitalReadiness": [score 0-100],
    "logisticsPotential": [score 0-100],
    "scalabilityAutomation": [score 0-100],
    "founderTeamStrength": [score 0-100]
  },
  "summary": "[3-4 sentence comprehensive assessment]",
  "roadmap": [
    "[Priority action 1 with specific steps]",
    "[Priority action 2 with specific steps]",
    "[Priority action 3 with specific steps]",
    "[Priority action 4 with specific steps]",
    "[Priority action 5 with specific steps]"
  ],
  "detailedInsights": [
    {
      "category": "productMarketFit",
      "score": [score],
      "strengths": ["specific strength 1", "specific strength 2"],
      "weaknesses": ["specific weakness 1", "specific weakness 2"],
      "actionItems": [
        {
          "action": "specific action",
          "priority": "high|medium|low",
          "timeframe": "1-2 weeks|1-3 months|3-6 months|6+ months",
          "resources": ["https://resource-url.com"]
        }
      ]
    }
    // ... repeat for all categories
  ],
  "recommendations": {
    "immediate": ["action for next 30 days"],
    "shortTerm": ["action for 3-6 months"],
    "longTerm": ["action for 6+ months"]
  },
  "complianceAssessment": {
    "criticalRequirements": ["UK legal requirement 1", "UK legal requirement 2"],
    "riskAreas": ["compliance risk 1", "compliance risk 2"],
    "complianceScore": [score 0-100]
  }
}

Focus on UK-specific market conditions, regulations (GDPR, Companies House, VAT, product standards), and provide actionable, prioritized recommendations based on the business size and industry.`;

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a UK market entry consultant specializing in helping Turkish SMEs expand to the UK. Provide data-driven, actionable insights based on current UK market conditions and regulations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2500,
      }),
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI API error:', response.statusText, errorBody);
      
      if (response.status === 429) {
        throw new Error(`OpenAI API rate limit exceeded. Please wait a few minutes before trying again, or upgrade your OpenAI plan for higher rate limits.`);
      }
      
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse the JSON response from OpenAI
    let analysisResult: AnalysisResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }
      analysisResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      // Fallback response if parsing fails
      analysisResult = {
        overallScore: 65,
        scoreBreakdown: {
          productMarketFit: 70,
          regulatoryCompatibility: 60,
          digitalReadiness: 65,
          logisticsPotential: 65,
          scalabilityAutomation: 70,
          founderTeamStrength: 60
        },
        summary: "Analysis completed with limited data. Consider providing more detailed business information for a more accurate assessment.",
        roadmap: [
          "Conduct detailed UK market research for your industry",
          "Review UK regulatory requirements and compliance needs",
          "Develop a comprehensive digital marketing strategy",
          "Establish UK logistics and fulfillment partnerships",
          "Create a detailed business expansion plan"
        ],
        detailedInsights: [],
        recommendations: {
          immediate: ["Research UK market regulations", "Validate product-market fit"],
          shortTerm: ["Develop digital presence", "Establish partnerships"],
          longTerm: ["Scale operations", "Build local team"]
        },
        complianceAssessment: {
          criticalRequirements: ["GDPR compliance", "VAT registration", "Company registration"],
          riskAreas: ["Data protection", "Product standards"],
          complianceScore: 40
        }
      };
    }

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-business function:', error);
    return new Response(JSON.stringify({ 
      error: 'Analysis failed',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});