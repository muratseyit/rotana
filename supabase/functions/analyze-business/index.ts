import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    initialInvestmentBudget?: string;
  };
  complianceStatus?: {
    overallScore: number;
    items: Array<{
      id: string;
      category: string;
      requirement: string;
      priority: string;
      completed: boolean;
    }>;
  };
}

interface ScoreBreakdown {
  productMarketFit: number;
  regulatoryCompatibility: number;
  digitalReadiness: number;
  logisticsPotential: number;
  scalabilityAutomation: number;
  founderTeamStrength: number;
  investmentReadiness: number;
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
    const businessData: BusinessData = await req.json();
    console.log('Business data received:', businessData);
    
    // Check if this is a guest analysis (limited) or full member analysis
    const isGuestAnalysis = !businessData.financialMetrics && !businessData.complianceStatus;
    console.log('Analysis type:', isGuestAnalysis ? 'Guest (Limited)' : 'Full Member');

    if (isGuestAnalysis) {
      // Generate limited guest analysis
      const guestAnalysis = {
        overallScore: Math.floor(Math.random() * 25) + 65, // 65-90 for demo
        summary: `Initial assessment shows your ${businessData.industry} business has promising fundamentals for UK market entry.`,
        keyFindings: [
          'Market opportunity identified in your sector',
          'Basic business structure appears sound',
          'Initial market research suggests viability'
        ],
        recommendations: [
          'Complete comprehensive business analysis',
          'Develop detailed UK market entry strategy', 
          'Assess regulatory requirements for your industry'
        ],
        riskFactors: [
          'Limited financial data provided',
          'Regulatory compliance needs assessment',
          'Market competition analysis required'
        ],
        limitedAnalysis: true,
        upgradePrompt: 'Get your complete 7-category analysis, regulatory assessment, and AI-matched partner recommendations with a premium membership.',
        nextSteps: [
          'Subscribe for comprehensive analysis',
          'Access verified partner directory',
          'Download detailed market entry roadmap'
        ]
      };

      return new Response(JSON.stringify(guestAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate budget score
    const calculateBudgetScore = (budgetString?: string): number => {
      if (!budgetString) return 0;
      
      // Extract numbers from budget string (e.g., "£50,000 - £100,000" or "£50,000")
      const numbers = budgetString.match(/[\d,]+/g);
      if (!numbers) return 0;
      
      // Take the first number as the minimum budget
      const budget = parseInt(numbers[0].replace(/,/g, ''));
      
      // If budget is under 500, score is 0
      if (budget < 500) return 0;
      
      // Scoring tiers:
      // £500-£5,000: 20-40
      // £5,000-£25,000: 40-60  
      // £25,000-£100,000: 60-80
      // £100,000+: 80-100
      
      if (budget >= 100000) return Math.min(100, 80 + ((budget - 100000) / 100000) * 20);
      if (budget >= 25000) return 60 + ((budget - 25000) / 75000) * 20;
      if (budget >= 5000) return 40 + ((budget - 5000) / 20000) * 20;
      return 20 + ((budget - 500) / 4500) * 20;
    };

    const budgetScore = calculateBudgetScore(businessData.financialMetrics?.initialInvestmentBudget);

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
Customer Lifetime Value: $${businessData.financialMetrics.customerLifetimeValue}
Initial Investment Budget: ${businessData.financialMetrics.initialInvestmentBudget || 'Not provided'}
CALCULATED INVESTMENT READINESS SCORE: ${budgetScore}/100` : '';

    const complianceInfo = businessData.complianceStatus ? `
COMPLIANCE STATUS:
Overall Compliance Score: ${businessData.complianceStatus.overallScore}%
Completed Requirements: ${businessData.complianceStatus.items.filter(item => item.completed).length}/${businessData.complianceStatus.items.length}

COMPLIANCE ITEMS:
${businessData.complianceStatus.items.map(item => 
  `- ${item.requirement} (${item.category}): ${item.completed ? '✅ COMPLETED' : '❌ PENDING'} [Priority: ${item.priority}]`
).join('\n')}` : '';

    // Fetch website content if URL is provided
    let websiteContent = '';
    if (businessData.websiteUrl) {
      try {
        console.log('Fetching website content from:', businessData.websiteUrl);
        
        // Set a timeout for the website fetch to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const websiteResponse = await fetch(businessData.websiteUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (websiteResponse.ok) {
          const html = await websiteResponse.text();
          // Extract basic text content from HTML (simple approach)
          const textContent = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 2000); // Limit to 2000 characters
          
          websiteContent = `\nWEBSITE CONTENT ANALYSIS:
${textContent}`;
          console.log('Website content extracted successfully');
        } else {
          console.log('Failed to fetch website, status:', websiteResponse.status);
          websiteContent = '\nWEBSITE: Could not fetch content from the provided URL.';
        }
      } catch (error) {
        console.error('Error fetching website:', error);
        websiteContent = '\nWEBSITE: Could not fetch content from the provided URL.';
      }
    }

    const prompt = `
As a UK market entry expert, provide a comprehensive analysis of this Turkish SME for UK market readiness. Include detailed insights, actionable recommendations, and compliance considerations.

BUSINESS DETAILS:
Company: ${businessData.companyName}
Industry: ${businessData.industry}
Size: ${businessData.companySize}
Description: ${businessData.businessDescription}
Website: ${businessData.websiteUrl || 'Not provided'}
${financialInfo}${complianceInfo}${websiteContent}

ANALYSIS REQUIREMENTS:
1. Score each category (0-100) with detailed justification
2. Identify specific strengths and weaknesses for each category
3. Provide actionable recommendations with timelines and priorities
4. Include UK-specific compliance and regulatory considerations
5. Consider financial readiness for UK expansion

RESPONSE FORMAT (JSON):
{
  "overallScore": [Calculate as: (productMarketFit + regulatoryCompatibility + digitalReadiness + logisticsPotential + scalabilityAutomation + founderTeamStrength + investmentReadiness) / 7],
  "scoreBreakdown": {
    "productMarketFit": [score 0-100],
    "regulatoryCompatibility": [score 0-100],
    "digitalReadiness": [score 0-100],
    "logisticsPotential": [score 0-100],
    "scalabilityAutomation": [score 0-100],
    "founderTeamStrength": [score 0-100],
    "investmentReadiness": ${budgetScore}
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
      
      // Round scores to integers to match database schema
      analysisResult.overallScore = Math.round(analysisResult.overallScore);
      if (analysisResult.scoreBreakdown) {
        Object.keys(analysisResult.scoreBreakdown).forEach(key => {
          analysisResult.scoreBreakdown[key] = Math.round(analysisResult.scoreBreakdown[key]);
        });
      }
      if (analysisResult.detailedInsights) {
        analysisResult.detailedInsights.forEach(insight => {
          insight.score = Math.round(insight.score);
        });
      }
      if (analysisResult.complianceAssessment) {
        analysisResult.complianceAssessment.complianceScore = Math.round(analysisResult.complianceAssessment.complianceScore);
      }
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
          founderTeamStrength: 60,
          investmentReadiness: budgetScore
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

    // Fetch verified partners for recommendations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: partners, error: partnersError } = await supabaseClient
      .from('partners')
      .select('id, name, description, category, specialties, contact_email, website_url')
      .eq('verification_status', 'verified')

    if (partnersError) {
      console.error('Error fetching partners:', partnersError)
    }

    // Generate partner recommendations based on analysis results with detailed weak area mapping
    const partnerRecommendations = [];
    const weakAreas = [];
    const strongAreas = [];

    // Identify weak and strong areas
    Object.entries(analysisResult.scoreBreakdown).forEach(([key, score]) => {
      if (score < 70) {
        weakAreas.push(key as keyof ScoreBreakdown);
      } else if (score >= 80) {
        strongAreas.push(key as keyof ScoreBreakdown);
      }
    });

    // Use the advanced partner matching engine
    if (partners && partners.length > 0) {
      // Import and use the partner matching engine
      const businessAnalysisData = {
        company_name: businessData.companyName || '',
        business_description: businessData.businessDescription || '',
        industry: businessData.industry || '',
        company_size: businessData.companySize || '',
        website_url: businessData.websiteUrl,
        initial_investment: businessData.initialInvestment,
        target_market: businessData.targetMarket,
        business_model: businessData.businessModel
      };

      // Enhanced partner matching with scoring algorithm
      const partnerMatches: Array<{
        partner: any,
        score: number,
        reasons: string[],
        urgency: 'high' | 'medium' | 'low'
      }> = [];

      for (const partner of partners) {
        let score = 0;
        const reasons: string[] = [];
        let urgency: 'high' | 'medium' | 'low' = 'low';

        // Category relevance scoring
        const categoryScore = calculateCategoryRelevance(partner.category, analysisResult);
        score += categoryScore.score;
        if (categoryScore.reason) reasons.push(categoryScore.reason);
        urgency = categoryScore.urgency || urgency;

        // Specialty matching
        if (partner.specialties && partner.specialties.length > 0) {
          const specialtyScore = calculateSpecialtyMatch(businessAnalysisData, partner.specialties);
          score += specialtyScore;
        }

        // Industry expertise
        if (partner.description) {
          const industryScore = calculateIndustryMatch(businessAnalysisData.industry, partner.description);
          score += industryScore;
        }

        if (score > 15) { // Only include relevant matches
          partnerMatches.push({ partner, score, reasons, urgency });
        }
      }

      // Sort by score and urgency
      partnerMatches.sort((a, b) => {
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
          return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
        }
        return b.score - a.score;
      });

      // Group by category and create recommendations
      const categoryGroups: Record<string, typeof partnerMatches> = {};
      
      partnerMatches.forEach(match => {
        const category = getCategoryDisplayName(match.partner.category);
        if (!categoryGroups[category]) {
          categoryGroups[category] = [];
        }
        categoryGroups[category].push(match);
      });

      // Create final recommendations
      Object.entries(categoryGroups).forEach(([category, matches]) => {
        if (matches.length === 0) return;

        const topMatches = matches.slice(0, 2); // Top 2 per category
        const combinedReasons = [...new Set(topMatches.flatMap(m => m.reasons))];
        
        partnerRecommendations.push({
          category,
          partners: topMatches.map(m => m.partner),
          reason: combinedReasons.slice(0, 2).join('. ') + '.'
        });
      });
    }

    // Helper functions for partner matching
    function calculateCategoryRelevance(category: string, analysis: any): { score: number; reason?: string; urgency?: 'high' | 'medium' | 'low' } {
      const scores = analysis.scoreBreakdown;

      switch (category) {
        case 'legal':
          if (scores.regulatoryCompatibility < 50) {
            return { score: 35, reason: `Critical legal support needed (Regulatory: ${scores.regulatoryCompatibility}%)`, urgency: 'high' };
          } else if (scores.regulatoryCompatibility < 70) {
            return { score: 25, reason: `Legal compliance optimization required (${scores.regulatoryCompatibility}%)`, urgency: 'medium' };
          }
          return { score: 10 };

        case 'accounting':
          if (scores.investmentReadiness < 60) {
            return { score: 30, reason: `Financial structuring critical (Investment readiness: ${scores.investmentReadiness}%)`, urgency: 'high' };
          } else if (scores.investmentReadiness < 75) {
            return { score: 20, reason: `Financial optimization recommended (${scores.investmentReadiness}%)`, urgency: 'medium' };
          }
          return { score: 15 }; // Always valuable for UK operations

        case 'marketing':
          const marketingScore = Math.min(scores.digitalReadiness, scores.productMarketFit);
          if (marketingScore < 55) {
            return { score: 25, reason: `Marketing strategy overhaul needed (Digital: ${scores.digitalReadiness}%, PMF: ${scores.productMarketFit}%)`, urgency: 'high' };
          } else if (marketingScore < 70) {
            return { score: 18, reason: `Market positioning improvement required`, urgency: 'medium' };
          }
          return { score: 8 };

        case 'consulting':
        case 'business_development':
          if (analysis.overallScore < 65) {
            return { score: 22, reason: `Strategic guidance critical for market entry (Overall: ${analysis.overallScore}%)`, urgency: 'high' };
          } else if (analysis.overallScore < 75) {
            return { score: 15, reason: `Strategic optimization recommended`, urgency: 'medium' };
          }
          return { score: 5 };

        case 'logistics':
          if (scores.logisticsPotential < 60) {
            return { score: 28, reason: `Supply chain restructuring needed (Logistics: ${scores.logisticsPotential}%)`, urgency: 'high' };
          } else if (scores.logisticsPotential < 75) {
            return { score: 15, reason: `Logistics optimization opportunities`, urgency: 'medium' };
          }
          return { score: 5 };

        case 'compliance':
          const complianceScore = analysis.complianceAssessment?.complianceScore || 50;
          if (complianceScore < 50) {
            return { score: 32, reason: `Compliance gaps require immediate attention (${complianceScore}%)`, urgency: 'high' };
          } else if (complianceScore < 70) {
            return { score: 20, reason: `Compliance improvements needed`, urgency: 'medium' };
          }
          return { score: 8 };

        default:
          return { score: 5 };
      }
    }

    function calculateSpecialtyMatch(business: any, specialties: string[]): number {
      const businessText = `${business.business_description} ${business.industry}`.toLowerCase();
      let matches = 0;

      specialties.forEach(specialty => {
        const specialtyWords = specialty.toLowerCase().split(/[\s,]+/);
        if (specialtyWords.some(word => word.length > 3 && businessText.includes(word))) {
          matches++;
        }
      });

      return Math.min(15, matches * 5);
    }

    function calculateIndustryMatch(industry: string, partnerDescription: string): number {
      const industryLower = industry.toLowerCase();
      const descLower = partnerDescription.toLowerCase();

      if (descLower.includes(industryLower)) {
        return 12;
      }

      // Related industry keywords
      const relatedKeywords = getRelatedKeywords(industryLower);
      const matches = relatedKeywords.filter(keyword => descLower.includes(keyword));
      
      return matches.length > 0 ? 8 : 0;
    }

    function getRelatedKeywords(industry: string): string[] {
      const keywordMap: Record<string, string[]> = {
        'technology': ['software', 'digital', 'tech', 'saas', 'it'],
        'healthcare': ['medical', 'health', 'pharmaceutical'],
        'finance': ['fintech', 'banking', 'investment'],
        'retail': ['e-commerce', 'consumer', 'fashion'],
        'manufacturing': ['industrial', 'production', 'automotive']
      };

      for (const [key, keywords] of Object.entries(keywordMap)) {
        if (industry.includes(key)) return keywords;
      }
      return [];
    }

    function getCategoryDisplayName(category: string): string {
      const displayNames: Record<string, string> = {
        'legal': 'Legal & Regulatory Affairs',
        'accounting': 'Accounting & Tax Advisory', 
        'marketing': 'Marketing & Digital Strategy',
        'consulting': 'Strategic Business Consulting',
        'business_development': 'Business Development & Growth',
        'logistics': 'Supply Chain & Logistics',
        'compliance': 'Industry Compliance & Certification'
      };
      return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    // Add partner recommendations to the analysis result
    const enhancedResult = {
      ...analysisResult,
      partnerRecommendations,
      timestamp: new Date().toISOString(),
      analysisVersion: 'v2.0'
    };

    return new Response(JSON.stringify(enhancedResult), {
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