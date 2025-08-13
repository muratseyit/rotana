// Core types for the marketability scoring system
export interface MarketabilityMetrics {
  productMarketFit: number;
  regulatoryCompatibility: number;
  logisticsViability: number;
  digitalReadiness: number;
  scalabilityPotential: number;
  founderAdvantage: number;
}

export interface MarketabilityResult {
  overallScore: number;
  metrics: MarketabilityMetrics;
  riskFactors: string[];
  opportunities: string[];
  recommendations: string[];
  confidenceLevel: 'High' | 'Medium' | 'Low';
}

// Market trend keywords (TF-IDF inspired)
const MARKET_TREND_KEYWORDS = {
  sustainability: ['sustainable', 'eco-friendly', 'green', 'renewable', 'carbon', 'environmental', 'organic', 'ethical'],
  technology: ['AI', 'digital', 'software', 'tech', 'automation', 'IoT', 'blockchain', 'fintech'],
  convenience: ['delivery', 'instant', 'mobile', 'app', 'online', 'quick', 'easy', 'convenient'],
  health: ['health', 'wellness', 'fitness', 'medical', 'healthcare', 'nutrition', 'therapy'],
  luxury: ['premium', 'luxury', 'high-end', 'exclusive', 'artisan', 'handmade', 'bespoke']
};

const HIGH_DEMAND_INDUSTRIES = ['technology', 'healthcare', 'food-beverage', 'retail', 'services'];
const REGULATED_INDUSTRIES = ['healthcare', 'food-beverage', 'automotive', 'construction'];

// TF-IDF inspired keyword scoring
function calculateKeywordRelevance(text: string, keywords: string[]): number {
  const normalizedText = text.toLowerCase();
  const matches = keywords.filter(keyword => normalizedText.includes(keyword));
  return Math.min(matches.length / keywords.length, 1);
}

// Product-Market Fit Potential (0-100)
function calculateProductMarketFit(businessData: any): number {
  let score = 0;

  // Industry demand scoring (30%)
  if (HIGH_DEMAND_INDUSTRIES.includes(businessData.industry)) {
    score += 30;
  } else {
    score += 15;
  }

  // Product description analysis (25%)
  const productDescription = `${businessData.description} ${businessData.products || ''}`;
  let trendScore = 0;
  Object.values(MARKET_TREND_KEYWORDS).forEach(keywords => {
    trendScore += calculateKeywordRelevance(productDescription, keywords) * 5;
  });
  score += Math.min(trendScore, 25);

  // Market presence (20%)
  const currentMarkets = businessData.currentMarkets || [];
  if (currentMarkets.length > 0) {
    score += Math.min(currentMarkets.length * 5, 20);
  }

  // Revenue indicator (25%)
  const revenueRanges = {
    '0-50k': 5,
    '50k-250k': 10,
    '250k-1m': 15,
    '1m-5m': 20,
    '5m+': 25
  };
  score += revenueRanges[businessData.annualRevenue as keyof typeof revenueRanges] || 5;

  return Math.min(score, 100);
}

// Regulatory Compatibility (0-100)
function calculateRegulatoryCompatibility(businessData: any): number {
  let score = 50; // Base score

  // Regulated industry penalty
  if (REGULATED_INDUSTRIES.includes(businessData.industry)) {
    score -= 20;
  }

  // Compliance experience bonus
  const compliance = businessData.regulatoryCompliance || [];
  if (compliance.length > 0) {
    score += Math.min(compliance.length * 10, 30);
  }

  // Quality certifications bonus
  const certifications = businessData.qualityCertifications || [];
  if (certifications.length > 0) {
    score += Math.min(certifications.length * 10, 20);
  }

  return Math.max(0, Math.min(score, 100));
}

// Logistics Viability (0-100)
function calculateLogisticsViability(businessData: any): number {
  let score = 40; // Base score

  // Company size factor
  const sizeScores = {
    '1-10': 10,
    '11-50': 20,
    '51-200': 30,
    '200+': 35
  };
  score += sizeScores[businessData.companySize as keyof typeof sizeScores] || 10;

  // Digital presence
  const digitalPresence = businessData.digitalPresence || [];
  score += Math.min(digitalPresence.length * 8, 25);

  // Online store capability
  if (businessData.hasOnlineStore) score += 15;
  if (businessData.hasEcommercePlatform) score += 15;

  // International experience
  const currentMarkets = businessData.currentMarkets || [];
  if (currentMarkets.length > 1) {
    score += 15;
  }

  return Math.min(score, 100);
}

// Digital Readiness (0-100)
function calculateDigitalReadiness(businessData: any): number {
  let score = 20; // Base score

  // Website presence
  if (businessData.website) score += 25;
  if (businessData.hasEnglishWebsite) score += 20;

  // Digital platforms
  const digitalPresence = businessData.digitalPresence || [];
  score += Math.min(digitalPresence.length * 8, 30);

  // E-commerce readiness
  if (businessData.hasOnlineStore) score += 15;
  if (businessData.hasEcommercePlatform) score += 10;

  return Math.min(score, 100);
}

// Scalability Potential (0-100)
function calculateScalabilityPotential(businessData: any): number {
  let score = 30; // Base score

  // Industry scalability
  const scalableIndustries = ['technology', 'services', 'retail'];
  if (scalableIndustries.includes(businessData.industry)) {
    score += 25;
  } else {
    score += 10;
  }

  // Revenue growth indicator
  const revenueScores = {
    '0-50k': 5,
    '50k-250k': 15,
    '250k-1m': 25,
    '1m-5m': 30,
    '5m+': 35
  };
  score += revenueScores[businessData.annualRevenue as keyof typeof revenueScores] || 5;

  // Timeline ambition
  const timelineScores = {
    '3-6 months': 30,
    '6-12 months': 25,
    '1-2 years': 15,
    '2+ years': 10
  };
  score += timelineScores[businessData.timeline as keyof typeof timelineScores] || 10;

  return Math.min(score, 100);
}

// Founder Advantage (0-100)
function calculateFounderAdvantage(businessData: any): number {
  let score = 40; // Base score

  // Business maturity
  const currentYear = new Date().getFullYear();
  const yearEstablished = parseInt(businessData.yearEstablished) || currentYear;
  const yearsInBusiness = currentYear - yearEstablished;
  
  if (yearsInBusiness >= 5) score += 30;
  else if (yearsInBusiness >= 2) score += 20;
  else if (yearsInBusiness >= 1) score += 10;

  // Market presence
  const currentMarkets = businessData.currentMarkets || [];
  if (currentMarkets.length > 0) {
    score += Math.min(currentMarkets.length * 5, 20);
  }

  // Investment readiness
  const budgetScores = {
    '0-10k': 5,
    '10k-50k': 10,
    '50k-100k': 15,
    '100k+': 20
  };
  score += budgetScores[businessData.budget as keyof typeof budgetScores] || 5;

  return Math.min(score, 100);
}

// Main scoring function
export function calculateMarketabilityScore(businessData: any): MarketabilityResult {
  const metrics: MarketabilityMetrics = {
    productMarketFit: calculateProductMarketFit(businessData),
    regulatoryCompatibility: calculateRegulatoryCompatibility(businessData),
    logisticsViability: calculateLogisticsViability(businessData),
    digitalReadiness: calculateDigitalReadiness(businessData),
    scalabilityPotential: calculateScalabilityPotential(businessData),
    founderAdvantage: calculateFounderAdvantage(businessData)
  };

  // Calculate weighted overall score
  const weights = {
    productMarketFit: 0.25,
    regulatoryCompatibility: 0.15,
    logisticsViability: 0.20,
    digitalReadiness: 0.15,
    scalabilityPotential: 0.15,
    founderAdvantage: 0.10
  };

  const overallScore = Math.round(
    Object.entries(metrics).reduce((total, [key, value]) => {
      return total + (value * weights[key as keyof typeof weights]);
    }, 0)
  );

  // Generate insights
  const riskFactors: string[] = [];
  const opportunities: string[] = [];
  const recommendations: string[] = [];

  // Risk analysis
  if (metrics.regulatoryCompatibility < 50) {
    riskFactors.push("Regulatory compliance requirements may pose challenges");
  }
  if (metrics.digitalReadiness < 40) {
    riskFactors.push("Limited digital presence may hinder market entry");
  }
  if (metrics.logisticsViability < 50) {
    riskFactors.push("Logistics and supply chain complexities need attention");
  }

  // Opportunity identification
  if (metrics.productMarketFit > 70) {
    opportunities.push("Strong product-market fit indicates high demand potential");
  }
  if (metrics.scalabilityPotential > 60) {
    opportunities.push("Business model shows excellent scalability prospects");
  }
  if (metrics.digitalReadiness > 70) {
    opportunities.push("Strong digital foundation enables rapid market penetration");
  }

  // Recommendations
  if (metrics.digitalReadiness < 60) {
    recommendations.push("Invest in digital marketing and online presence enhancement");
  }
  if (metrics.regulatoryCompatibility < 60) {
    recommendations.push("Consult with regulatory experts to ensure compliance readiness");
  }
  if (metrics.logisticsViability < 60) {
    recommendations.push("Develop strategic partnerships for logistics and distribution");
  }

  // Confidence level
  let confidenceLevel: 'High' | 'Medium' | 'Low' = 'Medium';
  if (overallScore >= 75) confidenceLevel = 'High';
  else if (overallScore < 50) confidenceLevel = 'Low';

  return {
    overallScore,
    metrics,
    riskFactors,
    opportunities,
    recommendations,
    confidenceLevel
  };
}