/**
 * Comprehensive Business Scoring Engine
 * Research-based algorithms for UK market entry assessment
 */

export interface ScoringWeights {
  productMarketFit: number;
  regulatoryCompatibility: number;
  digitalReadiness: number;
  logisticsPotential: number;
  scalabilityAutomation: number;
  founderTeamStrength: number;
  investmentReadiness: number;
}

export interface ScoreBreakdown {
  productMarketFit: number;
  regulatoryCompatibility: number;
  digitalReadiness: number;
  logisticsPotential: number;
  scalabilityAutomation: number;
  founderTeamStrength: number;
  investmentReadiness: number;
}

export interface ScoreEvidence {
  category: string;
  score: number;
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    points: number;
    evidence: string;
  }>;
}

export interface ScoringResult {
  overallScore: number;
  scoreBreakdown: ScoreBreakdown;
  scoreEvidence: ScoreEvidence[];
  confidenceLevel: 'high' | 'medium' | 'low';
  dataCompleteness: number;
}

// Industry-specific weights based on market research
const INDUSTRY_WEIGHTS: Record<string, Partial<ScoringWeights>> = {
  'technology': {
    digitalReadiness: 1.2,
    scalabilityAutomation: 1.15,
    investmentReadiness: 1.1
  },
  'e-commerce': {
    digitalReadiness: 1.25,
    logisticsPotential: 1.15,
    scalabilityAutomation: 1.1
  },
  'manufacturing': {
    regulatoryCompatibility: 1.15,
    logisticsPotential: 1.2,
    investmentReadiness: 1.1
  },
  'healthcare': {
    regulatoryCompatibility: 1.25,
    investmentReadiness: 1.15
  },
  'financial': {
    regulatoryCompatibility: 1.3,
    digitalReadiness: 1.1
  }
};

const DEFAULT_WEIGHTS: ScoringWeights = {
  productMarketFit: 1.0,
  regulatoryCompatibility: 1.0,
  digitalReadiness: 1.0,
  logisticsPotential: 1.0,
  scalabilityAutomation: 1.0,
  founderTeamStrength: 1.0,
  investmentReadiness: 1.0
};

export function calculateComprehensiveScore(businessData: any, companyVerification?: any, websiteAnalysis?: any): ScoringResult {
  const weights = getIndustryWeights(businessData.industry);
  
  // Calculate individual category scores with evidence
  const productMarketFitResult = calculateProductMarketFit(businessData);
  const regulatoryResult = calculateRegulatoryCompatibility(businessData, companyVerification);
  const digitalResult = calculateDigitalReadiness(businessData, websiteAnalysis);
  const logisticsResult = calculateLogisticsPotential(businessData);
  const scalabilityResult = calculateScalabilityAutomation(businessData);
  const founderResult = calculateFounderTeamStrength(businessData);
  const investmentResult = calculateInvestmentReadiness(businessData);

  // Apply industry-specific weights
  const scoreBreakdown: ScoreBreakdown = {
    productMarketFit: Math.min(100, Math.round(productMarketFitResult.score * weights.productMarketFit)),
    regulatoryCompatibility: Math.min(100, Math.round(regulatoryResult.score * weights.regulatoryCompatibility)),
    digitalReadiness: Math.min(100, Math.round(digitalResult.score * weights.digitalReadiness)),
    logisticsPotential: Math.min(100, Math.round(logisticsResult.score * weights.logisticsPotential)),
    scalabilityAutomation: Math.min(100, Math.round(scalabilityResult.score * weights.scalabilityAutomation)),
    founderTeamStrength: Math.min(100, Math.round(founderResult.score * weights.founderTeamStrength)),
    investmentReadiness: Math.min(100, Math.round(investmentResult.score * weights.investmentReadiness))
  };

  // Calculate weighted overall score
  const overallScore = Math.round(
    (scoreBreakdown.productMarketFit * 0.20 +
     scoreBreakdown.regulatoryCompatibility * 0.18 +
     scoreBreakdown.digitalReadiness * 0.15 +
     scoreBreakdown.logisticsPotential * 0.12 +
     scoreBreakdown.scalabilityAutomation * 0.12 +
     scoreBreakdown.founderTeamStrength * 0.13 +
     scoreBreakdown.investmentReadiness * 0.10)
  );

  const dataCompleteness = calculateDataCompletenessScore(businessData);
  
  return {
    overallScore,
    scoreBreakdown,
    scoreEvidence: [
      productMarketFitResult,
      regulatoryResult,
      digitalResult,
      logisticsResult,
      scalabilityResult,
      founderResult,
      investmentResult
    ],
    confidenceLevel: determineConfidenceLevel(dataCompleteness, overallScore),
    dataCompleteness
  };
}

function getIndustryWeights(industry: string): ScoringWeights {
  const industryKey = industry?.toLowerCase() || '';
  const customWeights = INDUSTRY_WEIGHTS[industryKey] || {};
  return { ...DEFAULT_WEIGHTS, ...customWeights };
}

function calculateProductMarketFit(data: any): ScoreEvidence {
  let score = 0;
  const factors: ScoreEvidence['factors'] = [];

  // Market definition clarity (0-20 points)
  if (data.targetMarket && data.targetMarket !== 'Not specified') {
    const points = 20;
    score += points;
    factors.push({
      factor: 'Target Market Defined',
      impact: 'positive',
      points,
      evidence: `Specific target market identified: ${data.targetMarket}`
    });
  } else {
    factors.push({
      factor: 'Target Market Undefined',
      impact: 'negative',
      points: -15,
      evidence: 'No clear target market specified, reducing market fit confidence'
    });
  }

  // Target regions clarity (0-15 points) - NEW
  const targetRegions = data.targetRegions || [];
  if (targetRegions.includes('UK') || targetRegions.includes('Europe')) {
    const points = 15;
    score += points;
    factors.push({
      factor: 'UK Market Targeting',
      impact: 'positive',
      points,
      evidence: `UK specifically targeted among: ${targetRegions.join(', ')}`
    });
  } else if (targetRegions.length > 0) {
    const points = 8;
    score += points;
    factors.push({
      factor: 'International Targeting',
      impact: 'neutral',
      points,
      evidence: `Targeting ${targetRegions.join(', ')} - UK should be prioritized`
    });
  }

  // Current market presence (0-15 points) - NEW
  const currentMarkets = data.currentMarkets || [];
  if (currentMarkets.length >= 2) {
    const points = 15;
    score += points;
    factors.push({
      factor: 'Multi-Market Experience',
      impact: 'positive',
      points,
      evidence: `Operating in ${currentMarkets.length} markets: ${currentMarkets.slice(0, 3).join(', ')}`
    });
  } else if (currentMarkets.length > 0) {
    const points = 8;
    score += points;
    factors.push({
      factor: 'Single Market Presence',
      impact: 'neutral',
      points,
      evidence: `Currently operating in: ${currentMarkets[0]}`
    });
  }

  // Business description quality (0-15 points)
  const descriptionLength = (data.businessDescription || data.description || '').length;
  if (descriptionLength > 200) {
    const points = 15;
    score += points;
    factors.push({
      factor: 'Detailed Value Proposition',
      impact: 'positive',
      points,
      evidence: 'Comprehensive business description provided'
    });
  } else if (descriptionLength > 50) {
    const points = 10;
    score += points;
    factors.push({
      factor: 'Basic Value Proposition',
      impact: 'neutral',
      points,
      evidence: 'Basic business description provided'
    });
  }

  // Business goals clarity (0-15 points) - NEW
  const businessGoals = data.businessGoals || '';
  if (businessGoals.length > 100) {
    const points = 15;
    score += points;
    factors.push({
      factor: 'Clear Strategic Goals',
      impact: 'positive',
      points,
      evidence: 'Detailed business goals and objectives defined'
    });
  } else if (businessGoals.length > 0) {
    const points = 8;
    score += points;
    factors.push({
      factor: 'Basic Goals Outlined',
      impact: 'neutral',
      points,
      evidence: 'Initial business goals documented'
    });
  }

  // Industry alignment (0-15 points)
  if (data.industry && data.industry !== 'Not specified') {
    const highGrowthIndustries = ['technology', 'e-commerce', 'healthcare', 'fintech'];
    const isHighGrowth = highGrowthIndustries.some(ind => 
      data.industry.toLowerCase().includes(ind)
    );
    
    const points = isHighGrowth ? 15 : 12;
    score += points;
    factors.push({
      factor: 'Industry Selection',
      impact: 'positive',
      points,
      evidence: isHighGrowth 
        ? `${data.industry} is a high-growth sector in the UK market`
        : `${data.industry} has established UK market presence`
    });
  }

  // Market entry timeline (0-10 points)
  const timeline = data.timeline || data.marketEntryTimeline || '';
  if (timeline) {
    const timelineLower = timeline.toLowerCase();
    let points = 0;
    if (timelineLower.includes('3-6') || timelineLower.includes('immediate')) {
      points = 10;
      factors.push({
        factor: 'Realistic Timeline',
        impact: 'positive',
        points,
        evidence: `${timeline} timeline demonstrates readiness`
      });
    } else if (timelineLower.includes('6-12')) {
      points = 8;
      factors.push({
        factor: 'Measured Timeline',
        impact: 'positive',
        points,
        evidence: `${timeline} approach shows strategic planning`
      });
    }
    score += points;
  }

  // Competitive positioning (0-15 points)
  if (data.competitiveAdvantage || data.uniqueSellingPoints) {
    const points = 15;
    score += points;
    factors.push({
      factor: 'Competitive Differentiation',
      impact: 'positive',
      points,
      evidence: 'Clear competitive advantages identified'
    });
  }

  return {
    category: 'Product-Market Fit',
    score: Math.min(100, score),
    factors
  };
}

function calculateRegulatoryCompatibility(data: any, verification?: any): ScoreEvidence {
  let score = 0;
  const factors: ScoreEvidence['factors'] = [];

  // UK company registration (0-30 points)
  if (verification?.verified) {
    const companyAge = verification.insights?.ageInYears || 0;
    let points = 30;
    
    if (companyAge >= 2) {
      points = 30;
      factors.push({
        factor: 'Established UK Company',
        impact: 'positive',
        points,
        evidence: `Verified UK company operating for ${companyAge} years (Companies House verified)`
      });
    } else if (companyAge >= 1) {
      points = 25;
      factors.push({
        factor: 'Recent UK Registration',
        impact: 'positive',
        points,
        evidence: `UK company registered ${companyAge} year(s) ago (verified)`
      });
    } else {
      points = 20;
      factors.push({
        factor: 'New UK Registration',
        impact: 'positive',
        points,
        evidence: 'Recently registered UK company (verified)'
      });
    }
    score += points;
  } else if (data.ukRegistered === 'yes') {
    const points = 15;
    score += points;
    factors.push({
      factor: 'UK Registered (Unverified)',
      impact: 'neutral',
      points,
      evidence: 'Self-reported UK registration - verification recommended'
    });
  } else {
    factors.push({
      factor: 'No UK Registration',
      impact: 'negative',
      points: -20,
      evidence: 'UK company registration required for optimal market access'
    });
  }

  // Business structure (0-20 points)
  if (data.businessType) {
    const appropriateTypes = ['limited company', 'ltd', 'plc', 'partnership'];
    const hasAppropriateType = appropriateTypes.some(type => 
      data.businessType.toLowerCase().includes(type)
    );
    
    const points = hasAppropriateType ? 20 : 12;
    score += points;
    factors.push({
      factor: 'Business Structure',
      impact: hasAppropriateType ? 'positive' : 'neutral',
      points,
      evidence: hasAppropriateType 
        ? `${data.businessType} is suitable for UK operations`
        : `${data.businessType} may need restructuring for UK market`
    });
  }

  // Regulatory compliance experience (0-25 points) - ENHANCED
  const regulatoryCompliance = data.regulatoryCompliance || [];
  const complianceCompleted = data.complianceCompleted || [];
  const allCompliance = [...new Set([...regulatoryCompliance, ...complianceCompleted])];
  
  if (allCompliance.length >= 3) {
    const points = 25;
    score += points;
    factors.push({
      factor: 'Strong Compliance Track Record',
      impact: 'positive',
      points,
      evidence: `${allCompliance.length} compliance areas completed: ${allCompliance.slice(0, 3).join(', ')}`
    });
  } else if (allCompliance.length > 0) {
    const points = Math.min(20, allCompliance.length * 8);
    score += points;
    factors.push({
      factor: 'Compliance Progress',
      impact: 'positive',
      points,
      evidence: `${allCompliance.length} compliance item(s) completed: ${allCompliance.join(', ')}`
    });
  } else {
    factors.push({
      factor: 'No Compliance Progress',
      impact: 'negative',
      points: -15,
      evidence: 'No documented compliance progress - critical gap for UK market entry'
    });
  }

  // Quality certifications (0-20 points) - NEW
  const qualityCertifications = data.qualityCertifications || [];
  if (qualityCertifications.length >= 2) {
    const points = 20;
    score += points;
    factors.push({
      factor: 'Quality Certifications',
      impact: 'positive',
      points,
      evidence: `${qualityCertifications.length} certifications: ${qualityCertifications.join(', ')}`
    });
  } else if (qualityCertifications.length > 0) {
    const points = 12;
    score += points;
    factors.push({
      factor: 'Basic Certification',
      impact: 'neutral',
      points,
      evidence: `${qualityCertifications[0]} certification obtained`
    });
  }

  // IP protection (0-15 points)
  const ipProtection = data.ipProtection || [];
  if (ipProtection.length > 0) {
    const points = Math.min(15, ipProtection.length * 8);
    score += points;
    factors.push({
      factor: 'Intellectual Property Protection',
      impact: 'positive',
      points,
      evidence: `IP protection in place: ${ipProtection.join(', ')}`
    });
  }

  return {
    category: 'Regulatory Compatibility',
    score: Math.max(0, Math.min(100, score)),
    factors
  };
}

function calculateDigitalReadiness(data: any, websiteAnalysis?: any): ScoreEvidence {
  let score = 0;
  const factors: ScoreEvidence['factors'] = [];

  // Website presence and quality (0-30 points) - enhanced with actual content analysis
  if (websiteAnalysis) {
    // Base score for having a website
    let websitePoints = 5;
    let websiteEvidence = 'Website exists';

    // Content quality (0-5 points)
    if (websiteAnalysis.content.length > 1500) {
      websitePoints += 5;
      websiteEvidence += ', comprehensive content (1500+ chars)';
    } else if (websiteAnalysis.content.length > 800) {
      websitePoints += 3;
      websiteEvidence += ', moderate content';
    }

    // Professional structure (0-3 points)
    if (websiteAnalysis.structure.hasNavigation) {
      websitePoints += 3;
      websiteEvidence += ', professional navigation';
    }

    // Lead generation (0-3 points)
    if (websiteAnalysis.structure.hasContactForm) {
      websitePoints += 3;
      websiteEvidence += ', contact form present';
    }

    // SSL security (0-2 points)
    if (websiteAnalysis.trustSignals.hasSSL) {
      websitePoints += 2;
      websiteEvidence += ', SSL secured';
    }

    // E-commerce capability (0-5 points)
    if (websiteAnalysis.ecommerce.hasShoppingCart) {
      websitePoints += 5;
      websiteEvidence += ', e-commerce enabled';
    }

    // UK market signals (0-5 points)
    if (websiteAnalysis.ukAlignment.hasPoundsGBP || websiteAnalysis.ukAlignment.hasUKAddress) {
      websitePoints += 5;
      websiteEvidence += ', UK market targeting';
    }

    // Multi-language support (0-2 points)
    if (websiteAnalysis.structure.languages.length > 1) {
      websitePoints += 2;
      websiteEvidence += `, ${websiteAnalysis.structure.languages.length} languages`;
    }

    score += websitePoints;
    factors.push({
      factor: 'Website Quality',
      impact: 'positive',
      points: websitePoints,
      evidence: websiteEvidence
    });
  } else if (data.websiteUrl && data.websiteUrl !== 'Not provided' && data.website && data.website !== 'Not provided') {
    // Basic score for URL only (website not analyzed)
    const points = 5;
    score += points;
    factors.push({
      factor: 'Website URL Provided',
      impact: 'neutral',
      points,
      evidence: 'Website URL present but content not analyzed'
    });
  } else {
    factors.push({
      factor: 'No Website',
      impact: 'negative',
      points: -20,
      evidence: 'Website essential for UK market credibility and sales'
    });
  }

  // English website availability (0-15 points) - NEW
  if (data.hasEnglishWebsite === true) {
    const points = 15;
    score += points;
    factors.push({
      factor: 'English Language Support',
      impact: 'positive',
      points,
      evidence: 'Website available in English - critical for UK market access'
    });
  } else if (data.hasEnglishWebsite === false) {
    factors.push({
      factor: 'No English Website',
      impact: 'negative',
      points: -10,
      evidence: 'English language website required for UK market'
    });
  }

  // E-commerce capability (0-25 points)
  if (data.onlineSalesPlatform === 'yes' || data.onlineSalesPlatform === true || 
      data.hasOnlineStore === true || data.hasEcommercePlatform === true) {
    const points = 25;
    score += points;
    factors.push({
      factor: 'E-commerce Enabled',
      impact: 'positive',
      points,
      evidence: 'Online sales platform ready for UK market'
    });
  } else {
    factors.push({
      factor: 'No E-commerce Platform',
      impact: 'negative',
      points: -15,
      evidence: 'E-commerce capability critical for UK B2C market'
    });
  }

  // Digital presence platforms (0-20 points) - ENHANCED
  const digitalPresence = data.digitalPresence || [];
  const socialMedia = data.socialMediaPlatforms || [];
  const allPlatforms = [...new Set([...digitalPresence, ...socialMedia])];
  
  if (allPlatforms.length >= 4) {
    const points = 20;
    score += points;
    factors.push({
      factor: 'Strong Multi-Channel Presence',
      impact: 'positive',
      points,
      evidence: `Active on ${allPlatforms.length} platforms: ${allPlatforms.slice(0, 4).join(', ')}`
    });
  } else if (allPlatforms.length >= 2) {
    const points = 15;
    score += points;
    factors.push({
      factor: 'Good Digital Presence',
      impact: 'positive',
      points,
      evidence: `Present on ${allPlatforms.length} platforms`
    });
  } else if (allPlatforms.length > 0) {
    const points = 8;
    score += points;
    factors.push({
      factor: 'Basic Digital Presence',
      impact: 'neutral',
      points,
      evidence: `Limited to ${allPlatforms.length} platform(s)`
    });
  }

  // Website features (0-15 points)
  const websiteFeatures = data.websiteFeatures || [];
  if (websiteFeatures.length >= 4) {
    const points = 15;
    score += points;
    factors.push({
      factor: 'Advanced Website Features',
      impact: 'positive',
      points,
      evidence: `${websiteFeatures.length} features implemented including ${websiteFeatures.slice(0, 3).join(', ')}`
    });
  } else if (websiteFeatures.length > 0) {
    const points = 8;
    score += points;
    factors.push({
      factor: 'Basic Website Features',
      impact: 'neutral',
      points,
      evidence: `${websiteFeatures.length} basic feature(s) present`
    });
  }

  // Digital marketing budget (0-10 points)
  if (data.digitalMarketingBudget && data.digitalMarketingBudget !== 'Not specified') {
    const points = 10;
    score += points;
    factors.push({
      factor: 'Marketing Budget Allocated',
      impact: 'positive',
      points,
      evidence: 'Digital marketing budget planned for UK market'
    });
  }

  return {
    category: 'Digital Readiness',
    score: Math.max(0, Math.min(100, score)),
    factors
  };
}

function calculateLogisticsPotential(data: any): ScoreEvidence {
  let score = 40; // Base score for having basic business operations
  const factors: ScoreEvidence['factors'] = [];

  factors.push({
    factor: 'Operational Foundation',
    impact: 'neutral',
    points: 40,
    evidence: 'Basic operational capacity established'
  });

  // Planned investments in logistics (0-25 points)
  const plannedInvestments = data.plannedInvestments || [];
  const logisticsInvestments = plannedInvestments.filter((inv: string) => 
    inv.toLowerCase().includes('logistics') || 
    inv.toLowerCase().includes('distribution') ||
    inv.toLowerCase().includes('warehouse') ||
    inv.toLowerCase().includes('fulfillment')
  );
  
  if (logisticsInvestments.length > 0) {
    const points = 25;
    score += points;
    factors.push({
      factor: 'Logistics Investment Planned',
      impact: 'positive',
      points,
      evidence: `Investment planned: ${logisticsInvestments.join(', ')}`
    });
  }

  // Company size impact (0-20 points)
  if (data.companySize) {
    let points = 0;
    if (data.companySize.includes('50+') || data.companySize.includes('200+')) {
      points = 20;
      factors.push({
        factor: 'Established Operations Scale',
        impact: 'positive',
        points,
        evidence: `Company size (${data.companySize}) indicates logistics capacity`
      });
    } else if (data.companySize.includes('11-50')) {
      points = 12;
      factors.push({
        factor: 'Growing Operations',
        impact: 'neutral',
        points,
        evidence: 'Mid-size company with developing logistics capability'
      });
    }
    score += points;
  }

  // Required support for logistics (0-15 points)
  const requiredSupport = data.requiredSupport || [];
  const needsLogisticsSupport = requiredSupport.some((sup: string) => 
    sup.toLowerCase().includes('logistics') || 
    sup.toLowerCase().includes('supply')
  );
  
  if (needsLogisticsSupport) {
    factors.push({
      factor: 'Logistics Support Identified',
      impact: 'neutral',
      points: 0,
      evidence: 'Recognized need for logistics partner support'
    });
  }

  return {
    category: 'Logistics Potential',
    score: Math.min(100, score),
    factors
  };
}

function calculateScalabilityAutomation(data: any): ScoreEvidence {
  let score = 35; // Base score
  const factors: ScoreEvidence['factors'] = [];

  factors.push({
    factor: 'Business Foundation',
    impact: 'neutral',
    points: 35,
    evidence: 'Core business operations in place'
  });

  // Technology/software indicators (0-25 points)
  if (data.industry?.toLowerCase().includes('technology') || 
      data.industry?.toLowerCase().includes('software') ||
      data.industry?.toLowerCase().includes('saas')) {
    const points = 25;
    score += points;
    factors.push({
      factor: 'Tech-Native Business Model',
      impact: 'positive',
      points,
      evidence: `${data.industry} naturally suited for automation and scaling`
    });
  }

  // Digital infrastructure (0-20 points)
  const websiteFeatures = data.websiteFeatures || [];
  const automationFeatures = ['payment processing', 'crm', 'analytics', 'automated marketing'];
  const hasAutomation = websiteFeatures.some((feat: string) => 
    automationFeatures.some(auto => feat.toLowerCase().includes(auto))
  );
  
  if (hasAutomation) {
    const points = 20;
    score += points;
    factors.push({
      factor: 'Automation Infrastructure',
      impact: 'positive',
      points,
      evidence: 'Digital automation tools already in use'
    });
  }

  // Planned automation investments (0-20 points)
  const plannedInvestments = data.plannedInvestments || [];
  const automationInvestments = plannedInvestments.filter((inv: string) => 
    inv.toLowerCase().includes('technology') || 
    inv.toLowerCase().includes('automation') ||
    inv.toLowerCase().includes('software') ||
    inv.toLowerCase().includes('digital')
  );
  
  if (automationInvestments.length > 0) {
    const points = 20;
    score += points;
    factors.push({
      factor: 'Technology Investment Pipeline',
      impact: 'positive',
      points,
      evidence: `Planned investments: ${automationInvestments.join(', ')}`
    });
  }

  return {
    category: 'Scalability & Automation',
    score: Math.min(100, score),
    factors
  };
}

function calculateFounderTeamStrength(data: any): ScoreEvidence {
  let score = 30; // Base score for having a functioning business
  const factors: ScoreEvidence['factors'] = [];

  factors.push({
    factor: 'Active Business Operations',
    impact: 'neutral',
    points: 30,
    evidence: 'Business currently operational'
  });

  // Company maturity (0-30 points)
  if (data.yearEstablished) {
    const currentYear = new Date().getFullYear();
    const yearsInBusiness = currentYear - parseInt(data.yearEstablished);
    
    let points = 0;
    if (yearsInBusiness >= 5) {
      points = 30;
      factors.push({
        factor: 'Experienced Leadership',
        impact: 'positive',
        points,
        evidence: `${yearsInBusiness} years of operational experience demonstrates proven execution`
      });
    } else if (yearsInBusiness >= 2) {
      points = 20;
      factors.push({
        factor: 'Established Track Record',
        impact: 'positive',
        points,
        evidence: `${yearsInBusiness} years in business shows market validation`
      });
    } else if (yearsInBusiness >= 1) {
      points = 12;
      factors.push({
        factor: 'Early Stage Leadership',
        impact: 'neutral',
        points,
        evidence: `${yearsInBusiness} year(s) operational - building track record`
      });
    }
    score += points;
  }

  // Team size (0-25 points)
  if (data.companySize) {
    let points = 0;
    if (data.companySize.includes('50+') || data.companySize.includes('200+')) {
      points = 25;
      factors.push({
        factor: 'Complete Team Structure',
        impact: 'positive',
        points,
        evidence: `Team size (${data.companySize}) indicates comprehensive organizational capability`
      });
    } else if (data.companySize.includes('11-50')) {
      points = 18;
      factors.push({
        factor: 'Growing Team',
        impact: 'positive',
        points,
        evidence: 'Mid-size team with specialized roles developing'
      });
    } else if (data.companySize.includes('1-10')) {
      points = 10;
      factors.push({
        factor: 'Compact Team',
        impact: 'neutral',
        points,
        evidence: 'Small team - may need expansion for UK market operations'
      });
    }
    score += points;
  }

  // Strategic clarity (0-15 points)
  if (data.primaryObjective && data.primaryObjective !== 'Not specified') {
    const points = 15;
    score += points;
    factors.push({
      factor: 'Clear Strategic Vision',
      impact: 'positive',
      points,
      evidence: `Defined objective: ${data.primaryObjective}`
    });
  }

  return {
    category: 'Founder & Team Strength',
    score: Math.min(100, score),
    factors
  };
}

function calculateInvestmentReadiness(data: any): ScoreEvidence {
  let score = 25; // Base score
  const factors: ScoreEvidence['factors'] = [];

  factors.push({
    factor: 'Market Entry Interest',
    impact: 'neutral',
    points: 25,
    evidence: 'Actively pursuing UK market entry'
  });

  // Budget allocation (0-25 points) - NEW
  const budget = data.budget || '';
  if (budget) {
    let points = 0;
    if (budget.includes('100k+') || budget.includes('50k-100k')) {
      points = 25;
      factors.push({
        factor: 'Substantial Investment Budget',
        impact: 'positive',
        points,
        evidence: `Budget range: ${budget} - demonstrates serious commitment`
      });
    } else if (budget.includes('10k-50k')) {
      points = 18;
      factors.push({
        factor: 'Moderate Investment Budget',
        impact: 'positive',
        points,
        evidence: `Budget range: ${budget} - adequate for initial entry`
      });
    } else if (budget.includes('0-10k')) {
      points = 10;
      factors.push({
        factor: 'Limited Investment Budget',
        impact: 'neutral',
        points,
        evidence: `Budget range: ${budget} - will require careful prioritization`
      });
    }
    score += points;
  }

  // Annual revenue indicator (0-20 points) - NEW
  const annualRevenue = data.annualRevenue || '';
  if (annualRevenue) {
    let points = 0;
    if (annualRevenue.includes('5m+') || annualRevenue.includes('1m-5m')) {
      points = 20;
      factors.push({
        factor: 'Strong Revenue Base',
        impact: 'positive',
        points,
        evidence: `Revenue: ${annualRevenue} - solid financial foundation for expansion`
      });
    } else if (annualRevenue.includes('250k-1m')) {
      points = 15;
      factors.push({
        factor: 'Growing Revenue',
        impact: 'positive',
        points,
        evidence: `Revenue: ${annualRevenue} - good growth trajectory`
      });
    } else if (annualRevenue.includes('50k-250k')) {
      points = 10;
      factors.push({
        factor: 'Early Revenue',
        impact: 'neutral',
        points,
        evidence: `Revenue: ${annualRevenue} - early stage business`
      });
    }
    score += points;
  }

  // Planned investments (0-20 points)
  const plannedInvestments = data.plannedInvestments || [];
  if (plannedInvestments.length >= 3) {
    const points = 20;
    score += points;
    factors.push({
      factor: 'Comprehensive Investment Plan',
      impact: 'positive',
      points,
      evidence: `${plannedInvestments.length} investment areas identified: ${plannedInvestments.slice(0, 3).join(', ')}`
    });
  } else if (plannedInvestments.length > 0) {
    const points = 12;
    score += points;
    factors.push({
      factor: 'Initial Investment Planning',
      impact: 'neutral',
      points,
      evidence: `${plannedInvestments.length} investment area(s) planned`
    });
  }

  // Success metrics defined (0-15 points)
  const successMetrics = data.keySuccessMetrics || [];
  if (successMetrics.length >= 3) {
    const points = 15;
    score += points;
    factors.push({
      factor: 'KPIs Established',
      impact: 'positive',
      points,
      evidence: `${successMetrics.length} success metrics tracked: ${successMetrics.slice(0, 3).join(', ')}`
    });
  } else if (successMetrics.length > 0) {
    const points = 10;
    score += points;
    factors.push({
      factor: 'Basic Metrics Tracked',
      impact: 'neutral',
      points,
      evidence: `${successMetrics.length} metric(s) defined`
    });
  }

  // Financial planning (0-15 points)
  if (data.financialProjections || data.revenueModel) {
    const points = 15;
    score += points;
    factors.push({
      factor: 'Financial Planning Complete',
      impact: 'positive',
      points,
      evidence: 'Revenue model and financial projections developed'
    });
  } else if ((plannedInvestments && plannedInvestments.length > 0) || budget) {
    const points = 8;
    score += points;
    factors.push({
      factor: 'Basic Financial Planning',
      impact: 'neutral',
      points,
      evidence: 'Investment areas and budget identified, detailed projections recommended'
    });
  }

  return {
    category: 'Investment Readiness',
    score: Math.min(100, score),
    factors
  };
}

function calculateDataCompletenessScore(data: any): number {
  const criticalFields = [
    'companyName', 'businessDescription', 'industry', 'companySize',
    'targetMarket', 'primaryObjective', 'ukRegistered', 'businessType'
  ];

  const optionalFields = [
    'websiteUrl', 'onlineSalesPlatform', 'socialMediaPlatforms',
    'complianceCompleted', 'plannedInvestments', 'marketEntryTimeline'
  ];

  let criticalComplete = 0;
  let optionalComplete = 0;

  criticalFields.forEach(field => {
    const value = data[field];
    if (value && value !== 'Not specified' && value !== 'Not provided' &&
        !(Array.isArray(value) && value.length === 0)) {
      criticalComplete++;
    }
  });

  optionalFields.forEach(field => {
    const value = data[field];
    if (value && value !== 'Not specified' && value !== 'Not provided' &&
        !(Array.isArray(value) && value.length === 0)) {
      optionalComplete++;
    }
  });

  // Critical fields weighted 70%, optional 30%
  const criticalScore = (criticalComplete / criticalFields.length) * 70;
  const optionalScore = (optionalComplete / optionalFields.length) * 30;

  return Math.round(criticalScore + optionalScore);
}

function determineConfidenceLevel(
  dataCompleteness: number,
  overallScore: number
): 'high' | 'medium' | 'low' {
  // High confidence: 80%+ data completeness AND valid score
  if (dataCompleteness >= 80 && overallScore >= 30) {
    return 'high';
  }
  
  // Medium confidence: 60%+ data completeness OR moderate score
  if (dataCompleteness >= 60 || overallScore >= 50) {
    return 'medium';
  }
  
  // Low confidence: <60% data completeness
  return 'low';
}
