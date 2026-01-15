/**
 * Market Intelligence API Client
 * Frontend API for fetching dynamic market data
 */

import { supabase } from '@/integrations/supabase/client';

export interface MarketDataSource {
  id: string;
  source_name: string;
  source_type: string;
  source_url: string | null;
  description: string | null;
  data_categories: string[];
  fetch_frequency: string;
  last_fetched_at: string | null;
  last_fetch_status: string | null;
  reliability_score: number;
  is_active: boolean;
}

export interface TradeStatistic {
  id: string;
  sector: string;
  year: number;
  period: string;
  export_value: number;
  import_value: number | null;
  currency: string;
  growth_rate_yoy: number | null;
  top_products: string[];
  source_name?: string;
}

export interface MarketIntelligenceData {
  id: string;
  industry: string;
  data_category: string;
  metric_name: string;
  metric_value: number | null;
  metric_text: string | null;
  unit: string | null;
  period: string | null;
  confidence_score: number;
  valid_until: string;
  source_name?: string;
}

export interface RegulatoryUpdate {
  id: string;
  authority: string;
  requirement_type: string;
  title: string;
  description: string | null;
  industry_sectors: string[];
  effective_date: string | null;
  compliance_deadline: string | null;
  severity: string;
  source_url: string | null;
  last_verified_at: string | null;
}
/**
 * Fetch all active market data sources
 */
export async function getMarketDataSources(): Promise<MarketDataSource[]> {
  const { data, error } = await supabase
    .from('market_data_sources')
    .select('*')
    .eq('is_active', true)
    .order('reliability_score', { ascending: false });

  if (error) {
    console.error('Error fetching market data sources:', error);
    return [];
  }

  return data || [];
}

/**
 * Fetch trade statistics for a specific sector or all sectors
 */
export async function getTradeStatistics(sector?: string): Promise<TradeStatistic[]> {
  let query = supabase
    .from('trade_statistics')
    .select(`
      *,
      market_data_sources (source_name)
    `)
    .order('year', { ascending: false });

  if (sector) {
    query = query.or(`sector.ilike.%${sector}%,sector.eq.All Sectors`);
  }

  const { data, error } = await query.limit(20);

  if (error) {
    console.error('Error fetching trade statistics:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    source_name: (item.market_data_sources as any)?.source_name,
  }));
}

/**
 * Fetch market intelligence data for a specific industry
 */
export async function getMarketIntelligence(
  industry?: string,
  category?: string
): Promise<MarketIntelligenceData[]> {
  let query = supabase
    .from('market_intelligence_cache')
    .select(`
      *,
      market_data_sources (source_name)
    `)
    .gte('valid_until', new Date().toISOString())
    .order('confidence_score', { ascending: false });

  if (industry) {
    query = query.ilike('industry', `%${industry}%`);
  }

  if (category) {
    query = query.eq('data_category', category);
  }

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('Error fetching market intelligence:', error);
    return [];
  }

  return (data || []).map(item => ({
    ...item,
    source_name: (item.market_data_sources as any)?.source_name,
  }));
}

/**
 * Fetch regulatory updates for specific industries
 */
export async function getRegulatoryUpdates(
  industries?: string[]
): Promise<RegulatoryUpdate[]> {
  let query = supabase
    .from('regulatory_updates')
    .select('*')
    .eq('is_active', true)
    .order('severity', { ascending: false });

  // Note: Filtering by array overlap would need RPC or different approach
  // For now, fetch all and filter client-side if needed

  const { data, error } = await query.limit(50);

  if (error) {
    console.error('Error fetching regulatory updates:', error);
    return [];
  }

  if (industries && industries.length > 0) {
    return (data || []).filter(update => 
      update.industry_sectors.some(sector => 
        industries.some(ind => 
          sector.toLowerCase().includes(ind.toLowerCase()) || 
          ind.toLowerCase().includes(sector.toLowerCase()) ||
          sector === 'all'
        )
      )
    );
  }

  return data || [];
}

/**
 * Trigger a manual refresh of market data
 */
export async function refreshMarketData(sources?: string | string[]): Promise<{
  success: boolean;
  results?: Record<string, { success: boolean; message: string }>;
  error?: string;
}> {
  try {
    // Map display names to function source names
    const sourceMapping: Record<string, string> = {
      'Kolay İhracat': 'kolay-ihracat',
      'GOV.UK': 'govuk-regulations',
      'GOV.UK Regulations': 'govuk-regulations',
    };

    let mappedSources: string | string[] | undefined;
    if (sources) {
      if (Array.isArray(sources)) {
        mappedSources = sources.map(s => sourceMapping[s] || s);
      } else {
        mappedSources = sourceMapping[sources] || sources;
      }
    }

    const { data, error } = await supabase.functions.invoke('refresh-market-data', {
      body: { sources: mappedSources || 'all' },
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error refreshing market data:', error);
  }
}
/**
 * Get comprehensive market summary for an industry
 */
export async function getIndustryMarketSummary(industry: string): Promise<{
  marketSize?: MarketIntelligenceData;
  tradeVolume?: TradeStatistic;
  growthRate?: MarketIntelligenceData;
  regulations: RegulatoryUpdate[];
  sources: MarketDataSource[];
  dataFreshness: 'fresh' | 'recent' | 'stale';
}> {
  const [marketData, tradeData, regulations, sources] = await Promise.all([
    getMarketIntelligence(industry),
    getTradeStatistics(industry),
    getRegulatoryUpdates([industry]),
    getMarketDataSources(),
  ]);

  const marketSize = marketData.find(d => d.data_category === 'market_size');
  const growthRate = marketData.find(d => d.data_category === 'growth_rate');
  const tradeVolume = tradeData[0];

  // Calculate data freshness
  let dataFreshness: 'fresh' | 'recent' | 'stale' = 'stale';
  const latestUpdate = sources
    .filter(s => s.last_fetched_at)
    .sort((a, b) => new Date(b.last_fetched_at!).getTime() - new Date(a.last_fetched_at!).getTime())[0];

  if (latestUpdate?.last_fetched_at) {
    const hoursOld = (Date.now() - new Date(latestUpdate.last_fetched_at).getTime()) / (1000 * 60 * 60);
    if (hoursOld < 24) dataFreshness = 'fresh';
    else if (hoursOld < 24 * 7) dataFreshness = 'recent';
  }

  return {
    marketSize,
    tradeVolume,
    growthRate,
    regulations,
    sources,
    dataFreshness,
  };
}

/**
 * Format trade value for display
 */
export function formatTradeValue(value: number, currency: string = 'USD'): string {
  if (value >= 1000000000) {
    return `${currency === 'USD' ? '$' : '£'}${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `${currency === 'USD' ? '$' : '£'}${(value / 1000000).toFixed(0)}M`;
  }
  return `${currency === 'USD' ? '$' : '£'}${value.toLocaleString()}`;
}

/**
 * Get data age description
 */
export function getDataAge(lastUpdated?: string | null): string {
  if (!lastUpdated) return 'Unknown';

  const hoursOld = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);

  if (hoursOld < 1) return 'Just now';
  if (hoursOld < 24) return `${Math.round(hoursOld)} hours ago`;
  if (hoursOld < 24 * 7) return `${Math.round(hoursOld / 24)} days ago`;
  if (hoursOld < 24 * 30) return `${Math.round(hoursOld / (24 * 7))} weeks ago`;
  return `${Math.round(hoursOld / (24 * 30))} months ago`;
}
