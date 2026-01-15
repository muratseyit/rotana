/**
 * Dynamic Market Intelligence Layer
 * Fetches live data from cache tables with fallbacks to static data
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import static fallback data
import {
  UK_MARKET_SIZE_DATA,
  TURKEY_UK_TRADE_DATA,
  HS_CODE_DATABASE,
  COMPETITION_DENSITY_INDEX,
  MarketSizeData,
  TurkeyUKTradeData,
  HSCodeInfo,
  CompetitionIndex,
} from './market-intelligence.ts';

// ================== Supabase Client Helper ==================
function getSupabaseClient(): SupabaseClient {
  const url = Deno.env.get('SUPABASE_URL')!;
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  return createClient(url, key);
}

// ================== Dynamic Data Interfaces ==================

export interface DynamicMarketData extends MarketSizeData {
  source?: string;
  lastUpdated?: string;
  confidence?: number;
}

export interface DynamicTradeData extends TurkeyUKTradeData {
  source?: string;
  lastUpdated?: string;
  confidence?: number;
}

export interface DataSourceInfo {
  name: string;
  type: string;
  lastFetched?: string;
  status?: string;
  reliability: number;
}

// ================== Dynamic Data Fetchers ==================

/**
 * Get market size data - tries cache first, falls back to static
 */
export async function getDynamicMarketSizeData(industry: string): Promise<DynamicMarketData> {
  const supabase = getSupabaseClient();
  const normalizedIndustry = industry.toLowerCase();

  try {
    // Query cache for fresh market size data
    const { data: cacheData, error } = await supabase
      .from('market_intelligence_cache')
      .select(`
        metric_name,
        metric_value,
        unit,
        confidence_score,
        valid_until,
        created_at,
        market_data_sources (source_name)
      `)
      .ilike('industry', `%${normalizedIndustry}%`)
      .eq('data_category', 'market_size')
      .gte('valid_until', new Date().toISOString())
      .order('confidence_score', { ascending: false })
      .limit(1);

    if (!error && cacheData && cacheData.length > 0) {
      const cached = cacheData[0];
      const staticData = getStaticMarketData(normalizedIndustry);

      return {
        ...staticData,
        marketSizeGBP: cached.metric_value || staticData.marketSizeGBP,
        source: (cached.market_data_sources as any)?.source_name || 'Cache',
        lastUpdated: cached.created_at,
        confidence: cached.confidence_score,
      };
    }
  } catch (err) {
    console.error('Error fetching dynamic market data:', err);
  }

  // Fallback to static data
  return {
    ...getStaticMarketData(normalizedIndustry),
    source: 'Static Benchmark',
    confidence: 70,
  };
}

/**
 * Get trade statistics - tries cache first, falls back to static
 */
export async function getDynamicTradeData(sector: string): Promise<DynamicTradeData> {
  const supabase = getSupabaseClient();
  const normalizedSector = sector.toLowerCase();

  try {
    // Query trade statistics for this sector
    const { data: tradeData, error } = await supabase
      .from('trade_statistics')
      .select(`
        sector,
        export_value,
        import_value,
        growth_rate_yoy,
        top_products,
        year,
        created_at,
        market_data_sources (source_name)
      `)
      .or(`sector.ilike.%${normalizedSector}%,sector.eq.All Sectors`)
      .order('year', { ascending: false })
      .limit(1);

    if (!error && tradeData && tradeData.length > 0) {
      const trade = tradeData[0];
      const staticData = getStaticTradeData(normalizedSector);

      // Convert from USD to GBP (approximate)
      const usdToGbp = 0.79;
      const annualVolumeGBP = (trade.export_value || 0) * usdToGbp / 1000000;

      return {
        ...staticData,
        annualVolumeGBP: annualVolumeGBP || staticData.annualVolumeGBP,
        yearOverYearChange: trade.growth_rate_yoy || staticData.yearOverYearChange,
        topProducts: trade.top_products || staticData.topProducts,
        source: (trade.market_data_sources as any)?.source_name || 'Trade Statistics',
        lastUpdated: trade.created_at,
        confidence: 90,
      };
    }
  } catch (err) {
    console.error('Error fetching dynamic trade data:', err);
  }

  return {
    ...getStaticTradeData(normalizedSector),
    source: 'Static Benchmark',
    confidence: 70,
  };
}

/**
 * Get regulatory requirements for an industry
 */
export async function getDynamicRegulatoryData(industry: string): Promise<{
  requirements: Array<{
    authority: string;
    title: string;
    description: string;
    severity: string;
    sourceUrl?: string;
  }>;
  source: string;
  lastUpdated?: string;
}> {
  const supabase = getSupabaseClient();
  const normalizedIndustry = industry.toLowerCase();

  try {
    const { data: regData, error } = await supabase
      .from('regulatory_updates')
      .select('*')
      .eq('is_active', true)
      .order('severity', { ascending: false })
      .limit(10);

    if (!error && regData && regData.length > 0) {
      // Filter for relevant industry sectors
      const relevantRegs = regData.filter(r => {
        const sectors = r.industry_sectors || [];
        return sectors.includes('all') || 
               sectors.some((s: string) => s.toLowerCase().includes(normalizedIndustry) || 
                                           normalizedIndustry.includes(s.toLowerCase()));
      });

      return {
        requirements: relevantRegs.map(r => ({
          authority: r.authority,
          title: r.title,
          description: r.description || '',
          severity: r.severity,
          sourceUrl: r.source_url,
        })),
        source: 'GOV.UK',
        lastUpdated: relevantRegs[0]?.last_verified_at,
      };
    }
  } catch (err) {
    console.error('Error fetching regulatory data:', err);
  }

  // Return empty if no cached data
  return {
    requirements: [],
    source: 'Static',
  };
}

/**
 * Get all data sources with their status
 */
export async function getDataSourcesStatus(): Promise<DataSourceInfo[]> {
  const supabase = getSupabaseClient();

  try {
    const { data, error } = await supabase
      .from('market_data_sources')
      .select('source_name, source_type, last_fetched_at, last_fetch_status, reliability_score')
      .eq('is_active', true)
      .order('reliability_score', { ascending: false });

    if (!error && data) {
      return data.map(s => ({
        name: s.source_name,
        type: s.source_type,
        lastFetched: s.last_fetched_at,
        status: s.last_fetch_status,
        reliability: s.reliability_score,
      }));
    }
  } catch (err) {
    console.error('Error fetching data sources:', err);
  }

  return [];
}

/**
 * Calculate data freshness score (0-100)
 */
export function calculateDataFreshness(lastUpdated?: string): number {
  if (!lastUpdated) return 50;

  const age = Date.now() - new Date(lastUpdated).getTime();
  const hoursOld = age / (1000 * 60 * 60);

  if (hoursOld < 24) return 100;
  if (hoursOld < 24 * 7) return 90;
  if (hoursOld < 24 * 30) return 75;
  if (hoursOld < 24 * 90) return 50;
  return 30;
}

// ================== Static Data Helpers ==================

function getStaticMarketData(industry: string): MarketSizeData {
  for (const [key, data] of Object.entries(UK_MARKET_SIZE_DATA)) {
    if (industry.includes(key) || key.includes(industry)) {
      return data;
    }
  }
  return UK_MARKET_SIZE_DATA['default'];
}

function getStaticTradeData(sector: string): TurkeyUKTradeData {
  for (const [key, data] of Object.entries(TURKEY_UK_TRADE_DATA)) {
    if (sector.includes(key) || key.includes(sector)) {
      return data;
    }
  }
  return TURKEY_UK_TRADE_DATA['default'];
}

// Re-export static data and functions for compatibility
export {
  UK_MARKET_SIZE_DATA,
  TURKEY_UK_TRADE_DATA,
  HS_CODE_DATABASE,
  COMPETITION_DENSITY_INDEX,
  MarketSizeData,
  TurkeyUKTradeData,
  HSCodeInfo,
  CompetitionIndex,
};

export {
  getMarketSizeData,
  getTurkeyUKTradeData,
  suggestHSCode,
  getCompetitionIndex,
  calculateMarketOpportunityScore,
  estimateMarketEntryTimeline,
} from './market-intelligence.ts';
