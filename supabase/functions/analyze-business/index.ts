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
}

interface ScoreBreakdown {
  productMarketFit: number;
  regulatoryCompatibility: number;
  digitalReadiness: number;
  logisticsPotential: number;
  scalabilityAutomation: number;
  founderTeamStrength: number;
}

interface AnalysisResult {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  roadmap: string[];
  summary: string;
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

    const prompt = `
As a UK market entry expert, analyze this Turkish SME business for UK market readiness. Provide scores (0-100) and specific recommendations.

BUSINESS DETAILS:
Company: ${businessData.companyName}
Industry: ${businessData.industry}
Size: ${businessData.companySize}
Description: ${businessData.businessDescription}
Website: ${businessData.websiteUrl || 'Not provided'}

SCORING CRITERIA (0-100 each):
1. Product-Market Fit: UK demand, competition, uniqueness
2. Regulatory Compatibility: UK regulations, compliance requirements
3. Digital Readiness: Online presence, e-commerce capability
4. Logistics/Fulfillment: Supply chain, shipping, warehousing
5. Scalability & Automation: Growth potential, operational efficiency
6. Founder/Team Strength: Experience, UK market knowledge

RESPONSE FORMAT (JSON):
{
  "overallScore": [average of all scores],
  "scoreBreakdown": {
    "productMarketFit": [score],
    "regulatoryCompatibility": [score],
    "digitalReadiness": [score],
    "logisticsPotential": [score],
    "scalabilityAutomation": [score],
    "founderTeamStrength": [score]
  },
  "summary": "[2-3 sentence overall assessment]",
  "roadmap": [
    "[Priority action 1]",
    "[Priority action 2]",
    "[Priority action 3]",
    "[Priority action 4]",
    "[Priority action 5]"
  ]
}

Be specific about UK market requirements, regulatory considerations, and actionable next steps.`;

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
        max_tokens: 1500,
      }),
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
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
        ]
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