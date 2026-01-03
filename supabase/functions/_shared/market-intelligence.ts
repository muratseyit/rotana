/**
 * Market Intelligence Data Layer
 * Embedded UK market data, HS codes, trade flows, and benchmarks
 * All data is used internally for analysis - not exposed to users
 */

// ================== UK Market Size Data ==================
export interface MarketSizeData {
  industry: string;
  marketSizeGBP: number; // in billions
  growthRate: number; // percentage
  forecast2027: number; // in billions
  competitionDensity: 'low' | 'medium' | 'high';
  entryDifficulty: number; // 1-10 scale
  turkishExporterCount: number; // approximate active Turkish exporters
}

export const UK_MARKET_SIZE_DATA: Record<string, MarketSizeData> = {
  'technology': {
    industry: 'Technology & Software',
    marketSizeGBP: 200,
    growthRate: 12.5,
    forecast2027: 285,
    competitionDensity: 'high',
    entryDifficulty: 6,
    turkishExporterCount: 340
  },
  'retail': {
    industry: 'Retail & E-commerce',
    marketSizeGBP: 450,
    growthRate: 8.3,
    forecast2027: 580,
    competitionDensity: 'high',
    entryDifficulty: 5,
    turkishExporterCount: 1250
  },
  'manufacturing': {
    industry: 'Manufacturing',
    marketSizeGBP: 350,
    growthRate: 5.2,
    forecast2027: 420,
    competitionDensity: 'medium',
    entryDifficulty: 7,
    turkishExporterCount: 890
  },
  'food': {
    industry: 'Food & Beverage',
    marketSizeGBP: 240,
    growthRate: 6.8,
    forecast2027: 305,
    competitionDensity: 'high',
    entryDifficulty: 8,
    turkishExporterCount: 520
  },
  'textile': {
    industry: 'Textile & Apparel',
    marketSizeGBP: 65,
    growthRate: 4.2,
    forecast2027: 78,
    competitionDensity: 'high',
    entryDifficulty: 5,
    turkishExporterCount: 2100
  },
  'healthcare': {
    industry: 'Healthcare & Medical',
    marketSizeGBP: 220,
    growthRate: 9.2,
    forecast2027: 310,
    competitionDensity: 'medium',
    entryDifficulty: 9,
    turkishExporterCount: 180
  },
  'automotive': {
    industry: 'Automotive & Parts',
    marketSizeGBP: 85,
    growthRate: 3.5,
    forecast2027: 98,
    competitionDensity: 'medium',
    entryDifficulty: 8,
    turkishExporterCount: 420
  },
  'cosmetics': {
    industry: 'Cosmetics & Personal Care',
    marketSizeGBP: 12,
    growthRate: 7.5,
    forecast2027: 16,
    competitionDensity: 'high',
    entryDifficulty: 7,
    turkishExporterCount: 95
  },
  'electronics': {
    industry: 'Electronics & Electrical',
    marketSizeGBP: 45,
    growthRate: 6.0,
    forecast2027: 58,
    competitionDensity: 'high',
    entryDifficulty: 6,
    turkishExporterCount: 310
  },
  'professional services': {
    industry: 'Professional Services',
    marketSizeGBP: 280,
    growthRate: 7.8,
    forecast2027: 365,
    competitionDensity: 'high',
    entryDifficulty: 4,
    turkishExporterCount: 75
  },
  'default': {
    industry: 'General Business',
    marketSizeGBP: 100,
    growthRate: 6.0,
    forecast2027: 125,
    competitionDensity: 'medium',
    entryDifficulty: 5,
    turkishExporterCount: 200
  }
};

// ================== Turkey-UK Trade Data ==================
export interface TurkeyUKTradeData {
  sector: string;
  annualVolumeGBP: number; // in millions
  growthTrend: 'growing' | 'stable' | 'declining';
  yearOverYearChange: number; // percentage
  ftaBenefit: boolean; // UK-Turkey FTA applicable
  topProducts: string[];
}

export const TURKEY_UK_TRADE_DATA: Record<string, TurkeyUKTradeData> = {
  'textile': {
    sector: 'Textile & Apparel',
    annualVolumeGBP: 2800,
    growthTrend: 'growing',
    yearOverYearChange: 8.5,
    ftaBenefit: true,
    topProducts: ['Woven fabrics', 'Knitwear', 'Home textiles', 'Denim']
  },
  'automotive': {
    sector: 'Automotive & Parts',
    annualVolumeGBP: 1950,
    growthTrend: 'stable',
    yearOverYearChange: 2.3,
    ftaBenefit: true,
    topProducts: ['Vehicle parts', 'Tyres', 'Electrical components', 'Glass']
  },
  'manufacturing': {
    sector: 'Manufacturing',
    annualVolumeGBP: 1650,
    growthTrend: 'growing',
    yearOverYearChange: 5.8,
    ftaBenefit: true,
    topProducts: ['Machinery', 'Steel products', 'Aluminum', 'Plastics']
  },
  'food': {
    sector: 'Food & Beverage',
    annualVolumeGBP: 850,
    growthTrend: 'growing',
    yearOverYearChange: 12.4,
    ftaBenefit: true,
    topProducts: ['Dried fruits', 'Nuts', 'Olive oil', 'Confectionery']
  },
  'electronics': {
    sector: 'Electronics',
    annualVolumeGBP: 720,
    growthTrend: 'growing',
    yearOverYearChange: 9.2,
    ftaBenefit: true,
    topProducts: ['White goods', 'TVs', 'Cables', 'Transformers']
  },
  'cosmetics': {
    sector: 'Cosmetics & Personal Care',
    annualVolumeGBP: 180,
    growthTrend: 'growing',
    yearOverYearChange: 15.8,
    ftaBenefit: true,
    topProducts: ['Skincare', 'Haircare', 'Natural cosmetics', 'Soaps']
  },
  'default': {
    sector: 'General',
    annualVolumeGBP: 500,
    growthTrend: 'stable',
    yearOverYearChange: 4.0,
    ftaBenefit: true,
    topProducts: ['Various goods']
  }
};

// ================== HS Code Database ==================
export interface HSCodeInfo {
  chapter: string;
  description: string;
  commonProducts: string[];
  tariffRate: number; // percentage under MFN
  ftaTariffRate: number; // percentage under UK-Turkey FTA
  requiresLicense: boolean;
  additionalRequirements: string[];
}

export const HS_CODE_DATABASE: Record<string, HSCodeInfo> = {
  // Textiles
  '50-63': {
    chapter: '50-63',
    description: 'Textiles and Textile Articles',
    commonProducts: ['Fabrics', 'Clothing', 'Home textiles', 'Carpets'],
    tariffRate: 12,
    ftaTariffRate: 0,
    requiresLicense: false,
    additionalRequirements: ['Fiber content labeling', 'Care instructions', 'Origin marking']
  },
  // Food
  '01-24': {
    chapter: '01-24',
    description: 'Food and Live Animals',
    commonProducts: ['Fruits', 'Vegetables', 'Nuts', 'Processed foods'],
    tariffRate: 15,
    ftaTariffRate: 0,
    requiresLicense: false,
    additionalRequirements: ['FSA registration', 'Health certificates', 'Phytosanitary certificates']
  },
  // Chemicals & Cosmetics
  '28-38': {
    chapter: '28-38',
    description: 'Chemicals and Related Products',
    commonProducts: ['Cosmetics', 'Soaps', 'Essential oils', 'Pharmaceuticals'],
    tariffRate: 5.5,
    ftaTariffRate: 0,
    requiresLicense: false,
    additionalRequirements: ['UK REACH registration', 'UK Responsible Person', 'Cosmetic Product Safety Report']
  },
  // Machinery
  '84-85': {
    chapter: '84-85',
    description: 'Machinery and Electrical Equipment',
    commonProducts: ['Appliances', 'Electronics', 'Industrial machinery'],
    tariffRate: 3.7,
    ftaTariffRate: 0,
    requiresLicense: false,
    additionalRequirements: ['UKCA marking', 'Declaration of Conformity', 'RoHS compliance']
  },
  // Automotive
  '87': {
    chapter: '87',
    description: 'Vehicles and Parts',
    commonProducts: ['Vehicle parts', 'Accessories', 'Tyres'],
    tariffRate: 4.5,
    ftaTariffRate: 0,
    requiresLicense: false,
    additionalRequirements: ['Type approval', 'UKCA marking for parts', 'Safety standards']
  },
  // Plastics
  '39-40': {
    chapter: '39-40',
    description: 'Plastics and Rubber',
    commonProducts: ['Plastic products', 'Packaging', 'Rubber goods'],
    tariffRate: 6.5,
    ftaTariffRate: 0,
    requiresLicense: false,
    additionalRequirements: ['UK REACH if applicable', 'Recycling markings']
  },
  // Furniture
  '94': {
    chapter: '94',
    description: 'Furniture and Lighting',
    commonProducts: ['Furniture', 'Mattresses', 'Lamps'],
    tariffRate: 5.6,
    ftaTariffRate: 0,
    requiresLicense: false,
    additionalRequirements: ['Fire safety (UK Furniture Regulations)', 'Labeling requirements']
  }
};

// ================== Competition Density Index ==================
export interface CompetitionIndex {
  industry: string;
  saturationLevel: number; // 0-100
  averageCompetitorCount: number;
  entryOpportunity: 'excellent' | 'good' | 'moderate' | 'challenging';
  nichePotential: string[];
  marketGaps: string[];
}

export const COMPETITION_DENSITY_INDEX: Record<string, CompetitionIndex> = {
  'textile': {
    industry: 'Textile & Apparel',
    saturationLevel: 75,
    averageCompetitorCount: 12500,
    entryOpportunity: 'moderate',
    nichePotential: ['Sustainable textiles', 'Technical fabrics', 'Luxury home textiles'],
    marketGaps: ['Eco-certified products', 'Made-to-order services']
  },
  'food': {
    industry: 'Food & Beverage',
    saturationLevel: 70,
    averageCompetitorCount: 8500,
    entryOpportunity: 'good',
    nichePotential: ['Organic products', 'Ethnic foods', 'Plant-based alternatives'],
    marketGaps: ['Mediterranean specialty foods', 'Health-focused snacks']
  },
  'cosmetics': {
    industry: 'Cosmetics & Personal Care',
    saturationLevel: 65,
    averageCompetitorCount: 3200,
    entryOpportunity: 'good',
    nichePotential: ['Natural cosmetics', 'Halal beauty', 'Men\'s grooming'],
    marketGaps: ['Clean beauty certified', 'Sustainable packaging']
  },
  'technology': {
    industry: 'Technology & Software',
    saturationLevel: 60,
    averageCompetitorCount: 28000,
    entryOpportunity: 'good',
    nichePotential: ['B2B SaaS', 'Fintech solutions', 'AI applications'],
    marketGaps: ['Localized solutions', 'SME-focused tools']
  },
  'healthcare': {
    industry: 'Healthcare & Medical',
    saturationLevel: 45,
    averageCompetitorCount: 4500,
    entryOpportunity: 'excellent',
    nichePotential: ['Digital health', 'Medical devices', 'Wellness products'],
    marketGaps: ['NHS-compatible solutions', 'Remote monitoring']
  },
  'manufacturing': {
    industry: 'Manufacturing',
    saturationLevel: 55,
    averageCompetitorCount: 15000,
    entryOpportunity: 'good',
    nichePotential: ['Precision engineering', 'Green manufacturing', 'Custom fabrication'],
    marketGaps: ['Just-in-time suppliers', 'Low-volume specialists']
  },
  'default': {
    industry: 'General Business',
    saturationLevel: 60,
    averageCompetitorCount: 10000,
    entryOpportunity: 'moderate',
    nichePotential: ['Specialized services'],
    marketGaps: ['Underserved segments']
  }
};

// ================== Helper Functions ==================

export function getMarketSizeData(industry: string): MarketSizeData {
  const normalizedIndustry = industry.toLowerCase();
  
  for (const [key, data] of Object.entries(UK_MARKET_SIZE_DATA)) {
    if (normalizedIndustry.includes(key) || key.includes(normalizedIndustry)) {
      return data;
    }
  }
  
  return UK_MARKET_SIZE_DATA['default'];
}

export function getTurkeyUKTradeData(sector: string): TurkeyUKTradeData {
  const normalizedSector = sector.toLowerCase();
  
  for (const [key, data] of Object.entries(TURKEY_UK_TRADE_DATA)) {
    if (normalizedSector.includes(key) || key.includes(normalizedSector)) {
      return data;
    }
  }
  
  return TURKEY_UK_TRADE_DATA['default'];
}

export function suggestHSCode(industry: string, productDescription: string): HSCodeInfo | null {
  const normalizedIndustry = industry.toLowerCase();
  const normalizedDesc = productDescription.toLowerCase();
  
  // Match based on industry and product keywords
  if (normalizedIndustry.includes('textile') || normalizedIndustry.includes('apparel') || 
      normalizedDesc.includes('fabric') || normalizedDesc.includes('clothing')) {
    return HS_CODE_DATABASE['50-63'];
  }
  
  if (normalizedIndustry.includes('food') || normalizedDesc.includes('food') || 
      normalizedDesc.includes('fruit') || normalizedDesc.includes('nut')) {
    return HS_CODE_DATABASE['01-24'];
  }
  
  if (normalizedIndustry.includes('cosmetic') || normalizedDesc.includes('cosmetic') || 
      normalizedDesc.includes('beauty') || normalizedDesc.includes('skincare')) {
    return HS_CODE_DATABASE['28-38'];
  }
  
  if (normalizedIndustry.includes('electronic') || normalizedIndustry.includes('appliance') || 
      normalizedDesc.includes('machine') || normalizedDesc.includes('electrical')) {
    return HS_CODE_DATABASE['84-85'];
  }
  
  if (normalizedIndustry.includes('automotive') || normalizedDesc.includes('vehicle') || 
      normalizedDesc.includes('car') || normalizedDesc.includes('auto')) {
    return HS_CODE_DATABASE['87'];
  }
  
  if (normalizedIndustry.includes('plastic') || normalizedDesc.includes('plastic') || 
      normalizedDesc.includes('rubber') || normalizedDesc.includes('packaging')) {
    return HS_CODE_DATABASE['39-40'];
  }
  
  if (normalizedIndustry.includes('furniture') || normalizedDesc.includes('furniture') || 
      normalizedDesc.includes('lighting') || normalizedDesc.includes('mattress')) {
    return HS_CODE_DATABASE['94'];
  }
  
  return null;
}

export function getCompetitionIndex(industry: string): CompetitionIndex {
  const normalizedIndustry = industry.toLowerCase();
  
  for (const [key, data] of Object.entries(COMPETITION_DENSITY_INDEX)) {
    if (normalizedIndustry.includes(key) || key.includes(normalizedIndustry)) {
      return data;
    }
  }
  
  return COMPETITION_DENSITY_INDEX['default'];
}

export function calculateMarketOpportunityScore(
  industry: string, 
  businessSize: string,
  exportExperience: string
): {
  score: number;
  factors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; points: number; evidence: string }>;
} {
  const marketData = getMarketSizeData(industry);
  const tradeData = getTurkeyUKTradeData(industry);
  const competition = getCompetitionIndex(industry);
  
  let score = 0;
  const factors: Array<{ factor: string; impact: 'positive' | 'negative' | 'neutral'; points: number; evidence: string }> = [];
  
  // Market size factor (0-25 points)
  const marketSizePoints = Math.min(25, Math.round(marketData.marketSizeGBP / 20));
  score += marketSizePoints;
  factors.push({
    factor: 'UK Market Size',
    impact: marketSizePoints >= 15 ? 'positive' : 'neutral',
    points: marketSizePoints,
    evidence: `£${marketData.marketSizeGBP}B addressable market in ${marketData.industry}`
  });
  
  // Growth trend factor (0-25 points)
  const growthPoints = Math.min(25, Math.round(marketData.growthRate * 2));
  score += growthPoints;
  factors.push({
    factor: 'Market Growth Rate',
    impact: growthPoints >= 15 ? 'positive' : 'neutral',
    points: growthPoints,
    evidence: `${marketData.growthRate}% annual growth, forecast £${marketData.forecast2027}B by 2027`
  });
  
  // Competition viability factor (0-25 points)
  const competitionPoints = Math.max(5, 25 - Math.round(competition.saturationLevel / 5));
  score += competitionPoints;
  factors.push({
    factor: 'Competition Viability',
    impact: competition.entryOpportunity === 'excellent' || competition.entryOpportunity === 'good' ? 'positive' : 'neutral',
    points: competitionPoints,
    evidence: `${competition.entryOpportunity} entry opportunity with ${competition.saturationLevel}% market saturation`
  });
  
  // Trade flow favorability (0-25 points)
  let tradePoints = 10; // Base
  if (tradeData.growthTrend === 'growing') tradePoints += 10;
  if (tradeData.ftaBenefit) tradePoints += 5;
  score += tradePoints;
  factors.push({
    factor: 'Turkey-UK Trade Flow',
    impact: tradeData.growthTrend === 'growing' ? 'positive' : 'neutral',
    points: tradePoints,
    evidence: `£${tradeData.annualVolumeGBP}M annual trade volume, ${tradeData.yearOverYearChange > 0 ? '+' : ''}${tradeData.yearOverYearChange}% YoY`
  });
  
  return { score: Math.min(100, score), factors };
}

export function estimateMarketEntryTimeline(
  industry: string,
  hasUKRegistration: boolean,
  hasCompliance: string[],
  currentReadinessScore: number
): {
  estimatedMonths: { min: number; max: number };
  phases: Array<{ phase: string; duration: string; critical: boolean }>;
} {
  const marketData = getMarketSizeData(industry);
  const baseTimeline = marketData.entryDifficulty; // 1-10 months base
  
  let minMonths = Math.max(2, baseTimeline - 2);
  let maxMonths = baseTimeline + 4;
  
  // Adjust based on readiness
  if (currentReadinessScore >= 80) {
    minMonths = Math.max(1, minMonths - 2);
    maxMonths -= 2;
  } else if (currentReadinessScore < 50) {
    minMonths += 2;
    maxMonths += 3;
  }
  
  // Adjust for UK registration
  if (hasUKRegistration) {
    minMonths = Math.max(1, minMonths - 1);
    maxMonths -= 1;
  } else {
    maxMonths += 2;
  }
  
  const phases: Array<{ phase: string; duration: string; critical: boolean }> = [];
  
  if (!hasUKRegistration) {
    phases.push({ phase: 'UK Company Registration', duration: '2-4 weeks', critical: true });
  }
  
  if (!hasCompliance.includes('EORI')) {
    phases.push({ phase: 'EORI Number Application', duration: '1-5 days', critical: true });
  }
  
  phases.push({ phase: 'Compliance & Certification', duration: `${Math.ceil(baseTimeline / 2)}-${baseTimeline} weeks`, critical: true });
  phases.push({ phase: 'Partner & Channel Setup', duration: '2-4 weeks', critical: false });
  phases.push({ phase: 'Initial Market Entry', duration: '2-6 weeks', critical: false });
  
  return {
    estimatedMonths: { min: Math.max(1, minMonths), max: maxMonths },
    phases
  };
}
