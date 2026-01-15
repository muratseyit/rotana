/**
 * Market Intelligence Frontend Utilities
 * Formatting helpers for market data display
 */

// Format market size in billions/millions
export function formatMarketSize(valueInBillions: number): string {
  if (valueInBillions >= 1) {
    return `£${valueInBillions.toFixed(valueInBillions >= 10 ? 0 : 1)}B`;
  }
  return `£${(valueInBillions * 1000).toFixed(0)}M`;
}

// Format trade volume
export function formatTradeVolume(valueInMillions: number): string {
  if (valueInMillions >= 1000) {
    return `£${(valueInMillions / 1000).toFixed(1)}B`;
  }
  return `£${valueInMillions.toFixed(0)}M`;
}

// Get competition label from saturation level
export function getCompetitionLabel(saturationLevel: number): 'Low' | 'Medium' | 'High' {
  if (saturationLevel >= 70) return 'High';
  if (saturationLevel >= 45) return 'Medium';
  return 'Low';
}

// Get competition color class using semantic tokens
export function getCompetitionColorClass(level: 'Low' | 'Medium' | 'High'): string {
  switch (level) {
    case 'Low': return 'text-green-600 dark:text-green-400';
    case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
    case 'High': return 'text-orange-600 dark:text-orange-400';
  }
}

// Format HS code for display
export function formatHSCode(code: string): string {
  // Remove any existing formatting
  const cleaned = code.replace(/[.\-\s]/g, '');
  
  // Format as XX.XX.XX or XX.XX
  if (cleaned.length >= 6) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}.${cleaned.slice(4, 6)}`;
  } else if (cleaned.length >= 4) {
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}`;
  }
  return code;
}

// Calculate timeline range string
export function formatTimelineRange(minMonths: number, maxMonths: number): string {
  if (minMonths === maxMonths) {
    return `${minMonths} month${minMonths !== 1 ? 's' : ''}`;
  }
  return `${minMonths}-${maxMonths} months`;
}

// Get entry opportunity badge variant
export function getEntryOpportunityVariant(
  opportunity: 'excellent' | 'good' | 'moderate' | 'challenging'
): 'default' | 'secondary' | 'outline' | 'destructive' {
  switch (opportunity) {
    case 'excellent': return 'default';
    case 'good': return 'secondary';
    case 'moderate': return 'outline';
    case 'challenging': return 'destructive';
  }
}

// Format percentage change with sign
export function formatPercentageChange(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

// Get growth trend icon name
export function getGrowthTrendIcon(trend: 'growing' | 'stable' | 'declining'): string {
  switch (trend) {
    case 'growing': return 'TrendingUp';
    case 'stable': return 'Minus';
    case 'declining': return 'TrendingDown';
  }
}

// Format tariff rate
export function formatTariffRate(mfnRate: number, ftaRate: number): string {
  if (ftaRate === 0) {
    return `0% (FTA) / ${mfnRate}% MFN`;
  }
  return `${ftaRate}% FTA / ${mfnRate}% MFN`;
}

// Get data freshness label and color
export function getDataFreshnessInfo(lastUpdated?: string | null): {
  label: string;
  colorClass: string;
  freshnessScore: number;
} {
  if (!lastUpdated) {
    return { label: 'Unknown', colorClass: 'text-muted-foreground', freshnessScore: 50 };
  }

  const age = Date.now() - new Date(lastUpdated).getTime();
  const hoursOld = age / (1000 * 60 * 60);
  const daysOld = Math.floor(hoursOld / 24);

  if (hoursOld < 24) {
    return { label: 'Just updated', colorClass: 'text-green-600', freshnessScore: 100 };
  } else if (daysOld < 7) {
    return { label: `${daysOld} days ago`, colorClass: 'text-green-600', freshnessScore: 90 };
  } else if (daysOld < 30) {
    return { label: `${daysOld} days ago`, colorClass: 'text-yellow-600', freshnessScore: 75 };
  } else if (daysOld < 90) {
    return { label: `${Math.floor(daysOld / 30)} months ago`, colorClass: 'text-orange-600', freshnessScore: 50 };
  }
  return { label: 'Outdated', colorClass: 'text-red-600', freshnessScore: 30 };
}

// Interface for market opportunity display
export interface MarketOpportunityDisplay {
  marketSize: string;
  growthRate: string;
  competitionLevel: 'Low' | 'Medium' | 'High';
  entryOpportunity: string;
  tradeVolume: string;
  ftaBenefit: boolean;
  estimatedTimeline: string;
  turkishExporterCount: number;
  dataSource?: string;
  lastUpdated?: string;
  confidence?: number;
}

// Transform analysis metadata to display format
export function transformMarketIntelligence(metadata: any): MarketOpportunityDisplay | null {
  if (!metadata?.marketIntelligence) return null;
  
  const mi = metadata.marketIntelligence;
  
  return {
    marketSize: formatMarketSize(mi.marketSizeGBP || 100),
    growthRate: `${mi.growthRate || 6}%`,
    competitionLevel: getCompetitionLabel(mi.saturationLevel || 60),
    entryOpportunity: mi.entryOpportunity || 'moderate',
    tradeVolume: formatTradeVolume(mi.tradeVolumeGBP || 500),
    ftaBenefit: mi.ftaBenefit !== false,
    estimatedTimeline: formatTimelineRange(mi.timelineMin || 3, mi.timelineMax || 6),
    turkishExporterCount: mi.turkishExporterCount || 200,
    dataSource: mi.source || 'Converta Intelligence',
    lastUpdated: mi.lastUpdated,
    confidence: mi.confidence,
  };
}

// Get confidence badge variant
export function getConfidenceBadgeVariant(confidence?: number): 'default' | 'secondary' | 'outline' {
  if (!confidence) return 'outline';
  if (confidence >= 85) return 'default';
  if (confidence >= 70) return 'secondary';
  return 'outline';
}

// Format confidence as label
export function formatConfidenceLabel(confidence?: number): string {
  if (!confidence) return 'Unknown';
  if (confidence >= 85) return 'High';
  if (confidence >= 70) return 'Medium';
  return 'Low';
}
