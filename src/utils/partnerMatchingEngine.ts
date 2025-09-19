interface BusinessData {
  company_name: string;
  business_description: string;
  industry: string;
  company_size: string;
  website_url?: string;
  initial_investment?: number;
  target_market?: string;
  business_model?: string;
}

interface AnalysisResult {
  overallScore: number;
  scoreBreakdown: {
    productMarketFit: number;
    regulatoryCompatibility: number;
    investmentReadiness: number;
    logisticsPotential: number;
    digitalReadiness: number;
    founderTeamStrength: number;
    scalabilityAutomation: number;
  };
  complianceAssessment: {
    complianceScore: number;
  };
}

interface Partner {
  id: string;
  name: string;
  description: string;
  category: string;
  specialties: string[];
  website_url?: string;
  contact_email?: string;
  phone?: string;
  location?: string;
  logo_url?: string;
  verification_status: string;
}

interface PartnerMatch {
  partner: Partner;
  score: number;
  reasons: string[];
  urgency: 'high' | 'medium' | 'low';
}

interface PartnerRecommendation {
  category: string;
  partners: Partner[];
  reason: string;
  urgency: 'high' | 'medium' | 'low';
  matchScore: number;
}

export class PartnerMatchingEngine {
  private industryKeywords = {
    legal: ['legal', 'law', 'compliance', 'regulation', 'gdpr', 'contract', 'intellectual property', 'patent', 'trademark'],
    accounting: ['tax', 'vat', 'accounting', 'bookkeeping', 'financial', 'audit', 'payroll', 'hmrc'],
    marketing: ['marketing', 'digital', 'social media', 'seo', 'advertising', 'branding', 'pr', 'content'],
    consulting: ['strategy', 'business development', 'management', 'operations', 'growth', 'scaling'],
    logistics: ['shipping', 'warehouse', 'distribution', 'supply chain', 'customs', 'import', 'export', 'delivery'],
    compliance: ['healthcare', 'medical', 'pharma', 'food safety', 'mhra', 'fca', 'ico', 'cyber security']
  };

  private urgencyThresholds = {
    legal: { high: 50, medium: 70 },
    accounting: { high: 60, medium: 75 },
    marketing: { high: 55, medium: 70 },
    consulting: { high: 65, medium: 80 },
    logistics: { high: 60, medium: 75 },
    compliance: { high: 40, medium: 65 }
  };

  /**
   * Calculate match score between business needs and partner capabilities
   */
  private calculatePartnerMatchScore(
    businessData: BusinessData,
    analysisResult: AnalysisResult,
    partner: Partner
  ): PartnerMatch {
    let score = 0;
    const reasons: string[] = [];
    let urgency: 'high' | 'medium' | 'low' = 'low';

    // Base score from category relevance
    const categoryScore = this.calculateCategoryRelevance(businessData, analysisResult, partner.category);
    score += categoryScore.score;
    if (categoryScore.reason) reasons.push(categoryScore.reason);

    // Specialty matching score
    const specialtyScore = this.calculateSpecialtyMatch(businessData, partner.specialties);
    score += specialtyScore.score;
    if (specialtyScore.reason) reasons.push(specialtyScore.reason);

    // Industry expertise score
    const industryScore = this.calculateIndustryExpertise(businessData.industry, partner);
    score += industryScore.score;
    if (industryScore.reason) reasons.push(industryScore.reason);

    // Company size compatibility
    const sizeScore = this.calculateSizeCompatibility(businessData.company_size, partner);
    score += sizeScore.score;
    if (sizeScore.reason) reasons.push(sizeScore.reason);

    // Geographic relevance (UK focus)
    const locationScore = this.calculateLocationRelevance(partner.location);
    score += locationScore.score;
    if (locationScore.reason) reasons.push(locationScore.reason);

    // Determine urgency based on category and scores
    urgency = this.determineUrgency(partner.category, analysisResult);

    return {
      partner,
      score: Math.min(100, Math.max(0, score)),
      reasons,
      urgency
    };
  }

  /**
   * Calculate how relevant a partner category is based on analysis scores
   */
  private calculateCategoryRelevance(
    businessData: BusinessData,
    analysisResult: AnalysisResult,
    category: string
  ): { score: number; reason?: string } {
    const scores = analysisResult.scoreBreakdown;

    switch (category) {
      case 'legal':
        if (scores.regulatoryCompatibility < 70) {
          return {
            score: 30,
            reason: `Critical legal support needed (Regulatory compatibility: ${scores.regulatoryCompatibility}%)`
          };
        }
        return { score: 10 };

      case 'accounting':
        if (scores.investmentReadiness < 70) {
          return {
            score: 25,
            reason: `Financial structuring required (Investment readiness: ${scores.investmentReadiness}%)`
          };
        }
        return { score: 15 }; // Always valuable for UK tax compliance

      case 'marketing':
        if (scores.digitalReadiness < 70 || scores.productMarketFit < 70) {
          return {
            score: 20,
            reason: `Market positioning support needed (Digital: ${scores.digitalReadiness}%, Product-Market Fit: ${scores.productMarketFit}%)`
          };
        }
        return { score: 8 };

      case 'consulting':
        if (scores.founderTeamStrength < 70 || analysisResult.overallScore < 75) {
          return {
            score: 18,
            reason: `Strategic guidance recommended (Overall score: ${analysisResult.overallScore}%)`
          };
        }
        return { score: 5 };

      case 'logistics':
        const isProductBusiness = this.isProductBasedBusiness(businessData.business_description);
        if (isProductBusiness && scores.logisticsPotential < 70) {
          return {
            score: 25,
            reason: `Supply chain optimization needed for product business (Logistics: ${scores.logisticsPotential}%)`
          };
        }
        return isProductBusiness ? { score: 10 } : { score: 2 };

      case 'compliance':
        if (analysisResult.complianceAssessment.complianceScore < 70 || this.isHighComplianceIndustry(businessData.industry)) {
          return {
            score: 28,
            reason: `Industry compliance expertise required (Compliance score: ${analysisResult.complianceAssessment.complianceScore}%)`
          };
        }
        return { score: 5 };

      default:
        return { score: 5 };
    }
  }

  /**
   * Calculate specialty matching score
   */
  private calculateSpecialtyMatch(businessData: BusinessData, specialties: string[]): { score: number; reason?: string } {
    if (!specialties || specialties.length === 0) return { score: 0 };

    const businessText = `${businessData.business_description} ${businessData.industry}`.toLowerCase();
    let matchCount = 0;
    const matchedSpecialties: string[] = [];

    specialties.forEach(specialty => {
      const specialtyWords = specialty.toLowerCase().split(/[\s,]+/);
      if (specialtyWords.some(word => businessText.includes(word))) {
        matchCount++;
        matchedSpecialties.push(specialty);
      }
    });

    if (matchCount > 0) {
      const score = Math.min(15, matchCount * 5);
      return {
        score,
        reason: `Specialized expertise in: ${matchedSpecialties.slice(0, 3).join(', ')}`
      };
    }

    return { score: 0 };
  }

  /**
   * Calculate industry expertise score
   */
  private calculateIndustryExpertise(industry: string, partner: Partner): { score: number; reason?: string } {
    const partnerText = `${partner.description} ${partner.specialties?.join(' ')}`.toLowerCase();
    const industryLower = industry.toLowerCase();

    // Direct industry match
    if (partnerText.includes(industryLower)) {
      return {
        score: 12,
        reason: `Direct ${industry} industry expertise`
      };
    }

    // Related industry keywords
    const relatedKeywords = this.getRelatedIndustryKeywords(industryLower);
    const matches = relatedKeywords.filter(keyword => partnerText.includes(keyword));

    if (matches.length > 0) {
      return {
        score: 8,
        reason: `Relevant experience in ${matches[0]}`
      };
    }

    return { score: 0 };
  }

  /**
   * Calculate company size compatibility
   */
  private calculateSizeCompatibility(companySize: string, partner: Partner): { score: number; reason?: string } {
    const partnerText = partner.description.toLowerCase();
    const sizeLower = companySize.toLowerCase();

    if (partnerText.includes('sme') || partnerText.includes('small business') || partnerText.includes('startup')) {
      if (sizeLower.includes('small') || sizeLower.includes('startup') || sizeLower === '1-10') {
        return {
          score: 8,
          reason: 'Specializes in small businesses and startups'
        };
      }
    }

    if (partnerText.includes('enterprise') || partnerText.includes('large')) {
      if (sizeLower.includes('large') || sizeLower === '200+') {
        return {
          score: 8,
          reason: 'Enterprise-focused services'
        };
      }
    }

    return { score: 3 }; // Neutral score
  }

  /**
   * Calculate location relevance
   */
  private calculateLocationRelevance(location?: string): { score: number; reason?: string } {
    if (!location) return { score: 0 };

    const locationLower = location.toLowerCase();
    
    if (locationLower.includes('london')) {
      return {
        score: 8,
        reason: 'Based in London financial district'
      };
    }

    if (locationLower.includes('uk') || locationLower.includes('england') || 
        locationLower.includes('scotland') || locationLower.includes('wales')) {
      return {
        score: 5,
        reason: 'UK-based with local market knowledge'
      };
    }

    return { score: 2 };
  }

  /**
   * Determine urgency based on category and analysis scores
   */
  private determineUrgency(category: string, analysisResult: AnalysisResult): 'high' | 'medium' | 'low' {
    const thresholds = this.urgencyThresholds[category as keyof typeof this.urgencyThresholds];
    if (!thresholds) return 'low';

    let relevantScore = 100;

    switch (category) {
      case 'legal':
        relevantScore = analysisResult.scoreBreakdown.regulatoryCompatibility;
        break;
      case 'accounting':
        relevantScore = analysisResult.scoreBreakdown.investmentReadiness;
        break;
      case 'marketing':
        relevantScore = Math.min(analysisResult.scoreBreakdown.digitalReadiness, analysisResult.scoreBreakdown.productMarketFit);
        break;
      case 'consulting':
        relevantScore = analysisResult.overallScore;
        break;
      case 'logistics':
        relevantScore = analysisResult.scoreBreakdown.logisticsPotential;
        break;
      case 'compliance':
        relevantScore = analysisResult.complianceAssessment.complianceScore;
        break;
    }

    if (relevantScore < thresholds.high) return 'high';
    if (relevantScore < thresholds.medium) return 'medium';
    return 'low';
  }

  /**
   * Check if business is product-based
   */
  private isProductBasedBusiness(description: string): boolean {
    const productKeywords = ['product', 'goods', 'manufacturing', 'retail', 'e-commerce', 'inventory', 'wholesale'];
    const descLower = description.toLowerCase();
    return productKeywords.some(keyword => descLower.includes(keyword));
  }

  /**
   * Check if industry requires high compliance
   */
  private isHighComplianceIndustry(industry: string): boolean {
    const highComplianceIndustries = ['healthcare', 'medical', 'pharmaceutical', 'finance', 'banking', 'food', 'automotive'];
    const industryLower = industry.toLowerCase();
    return highComplianceIndustries.some(keyword => industryLower.includes(keyword));
  }

  /**
   * Get related industry keywords
   */
  private getRelatedIndustryKeywords(industry: string): string[] {
    const industryMap: Record<string, string[]> = {
      'technology': ['software', 'digital', 'tech', 'saas', 'it'],
      'healthcare': ['medical', 'health', 'pharmaceutical', 'biotech'],
      'finance': ['fintech', 'banking', 'investment', 'insurance'],
      'retail': ['e-commerce', 'consumer', 'fashion', 'fmcg'],
      'manufacturing': ['industrial', 'production', 'automotive', 'engineering'],
      'food': ['restaurant', 'hospitality', 'catering', 'beverage']
    };

    for (const [key, keywords] of Object.entries(industryMap)) {
      if (industry.includes(key)) {
        return keywords;
      }
    }

    return [];
  }

  /**
   * Main method to generate partner recommendations
   */
  public generatePartnerRecommendations(
    businessData: BusinessData,
    analysisResult: AnalysisResult,
    availablePartners: Partner[]
  ): PartnerRecommendation[] {
    // Calculate match scores for all partners
    const partnerMatches = availablePartners
      .map(partner => this.calculatePartnerMatchScore(businessData, analysisResult, partner))
      .filter(match => match.score > 10) // Only include relevant matches
      .sort((a, b) => b.score - a.score); // Sort by score descending

    // Group by category and create recommendations
    const categoryGroups: Record<string, PartnerMatch[]> = {};
    
    partnerMatches.forEach(match => {
      const category = match.partner.category;
      if (!categoryGroups[category]) {
        categoryGroups[category] = [];
      }
      categoryGroups[category].push(match);
    });

    // Create recommendations for each category
    const recommendations: PartnerRecommendation[] = [];

    Object.entries(categoryGroups).forEach(([category, matches]) => {
      if (matches.length === 0) return;

      // Take top 2-3 partners per category
      const topMatches = matches.slice(0, category === 'legal' || category === 'accounting' ? 3 : 2);
      const avgScore = topMatches.reduce((sum, match) => sum + match.score, 0) / topMatches.length;
      const highestUrgency = topMatches.some(m => m.urgency === 'high') ? 'high' : 
                           topMatches.some(m => m.urgency === 'medium') ? 'medium' : 'low';

      // Combine reasons from top matches
      const allReasons = topMatches.flatMap(match => match.reasons);
      const uniqueReasons = [...new Set(allReasons)];
      
      recommendations.push({
        category: this.getCategoryDisplayName(category),
        partners: topMatches.map(match => match.partner),
        reason: uniqueReasons.slice(0, 2).join('. ') + '.',
        urgency: highestUrgency,
        matchScore: avgScore
      });
    });

    // Sort recommendations by urgency and match score
    return recommendations.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      }
      return b.matchScore - a.matchScore;
    });
  }

  /**
   * Get display name for category
   */
  private getCategoryDisplayName(category: string): string {
    const displayNames: Record<string, string> = {
      'legal': 'Legal & Regulatory Affairs',
      'accounting': 'Accounting & Tax Advisory',
      'marketing': 'Marketing & Digital Presence',
      'consulting': 'Strategic Business Consulting',
      'logistics': 'Supply Chain & Logistics',
      'compliance': 'Industry Compliance & Certification'
    };
    
    return displayNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
  }
}

export const partnerMatchingEngine = new PartnerMatchingEngine();