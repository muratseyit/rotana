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

    // Create detailed prompt for comprehensive analysis
    const prompt = `You are an expert UK market entry consultant. Analyze the following business comprehensively across 7 critical categories.

Business Information:
- Company: ${businessData.companyName}
- Description: ${businessData.businessDescription}
- Industry: ${businessData.industry}
- Company Size: ${businessData.companySize}
- Website: ${businessData.websiteUrl || 'Not provided'}
- Target Market: ${businessData.targetMarket || 'Not specified'}
- Market Entry Timeline: ${businessData.marketEntryTimeline || 'Not specified'}

Digital Presence:
- Online Sales Platform: ${businessData.onlineSalesPlatform || 'No'}
- Social Media Platforms: ${businessData.socialMediaPlatforms?.join(', ') || 'None'}
- Website Features: ${businessData.websiteFeatures?.join(', ') || 'None'}
- Digital Marketing Budget: ${businessData.digitalMarketingBudget || 'Not specified'}

Compliance & Operations:
- Registered in UK: ${businessData.ukRegistered || 'No'}
- Business Type: ${businessData.businessType || 'Not specified'}
- Compliance Completed: ${businessData.complianceCompleted?.join(', ') || 'None'}
- IP Protection: ${businessData.ipProtection?.join(', ') || 'None'}

Goals & Objectives:
- Primary Objective: ${businessData.primaryObjective || 'Not specified'}
- Planned Investments: ${businessData.plannedInvestments?.join(', ') || 'None'}
- Required Support: ${businessData.requiredSupport?.join(', ') || 'None'}
- Key Success Metrics: ${businessData.keySuccessMetrics?.join(', ') || 'None'}

Please provide a comprehensive analysis in the following JSON structure:
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
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert UK market entry consultant providing comprehensive business analysis. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
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

    // Fetch verified partners from database
    console.log('Fetching verified partners...');
    const { data: partners, error: partnersError } = await supabase
      .from('partners')
      .select('*')
      .eq('verification_status', 'verified');

    if (partnersError) {
      console.error('Error fetching partners:', partnersError);
    }

    // Match partners to business needs
    const partnerRecommendations = [];
    const categories = ['legal', 'accounting', 'marketing', 'logistics'];
    
    for (const category of categories) {
      const categoryPartners = partners?.filter(p => p.category === category) || [];
      
      if (categoryPartners.length > 0) {
        let reason = '';
        let urgency: 'high' | 'medium' | 'low' = 'medium';
        let matchScore = 70;

        // Customize recommendations based on category and business data
        if (category === 'legal') {
          reason = 'Legal compliance and company registration support needed for UK market entry';
          urgency = businessData.ukRegistered === 'no' ? 'high' : 'medium';
          matchScore = businessData.ukRegistered === 'no' ? 95 : 75;
        } else if (category === 'accounting') {
          reason = 'Tax registration and financial compliance required for UK operations';
          urgency = 'high';
          matchScore = 90;
        } else if (category === 'marketing') {
          reason = 'Digital marketing expertise to establish UK market presence';
          urgency = businessData.onlineSalesPlatform === 'yes' ? 'medium' : 'high';
          matchScore = 85;
        } else if (category === 'logistics') {
          reason = 'Supply chain and distribution support for UK market';
          urgency = businessData.industry?.toLowerCase().includes('retail') || 
                   businessData.industry?.toLowerCase().includes('manufacturing') ? 'high' : 'medium';
          matchScore = 80;
        }

        partnerRecommendations.push({
          category,
          partners: categoryPartners.slice(0, 3), // Top 3 partners per category
          reason,
          urgency,
          matchScore
        });
      }
    }

    // Add partner recommendations to analysis
    const comprehensiveResult = {
      ...analysis,
      partnerRecommendations,
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
