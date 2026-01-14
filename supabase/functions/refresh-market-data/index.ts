import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Master function to orchestrate all market data refreshes
 * Can be called manually or scheduled via cron
 */
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sources } = await req.json().catch(() => ({ sources: 'all' }));
    console.log(`Starting market data refresh for: ${sources}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const results: Record<string, { success: boolean; message: string }> = {};

    // Determine which sources to refresh
    const shouldRefresh = (sourceName: string) => {
      if (sources === 'all') return true;
      if (Array.isArray(sources)) return sources.includes(sourceName);
      return sources === sourceName;
    };

    // Refresh Kolay İhracat (Turkish government trade data)
    if (shouldRefresh('kolay-ihracat')) {
      console.log('Invoking fetch-kolay-ihracat...');
      try {
        const { data, error } = await supabase.functions.invoke('fetch-kolay-ihracat');
        results['kolay-ihracat'] = {
          success: !error && data?.success,
          message: error?.message || data?.message || 'Completed',
        };
      } catch (err) {
        results['kolay-ihracat'] = {
          success: false,
          message: err instanceof Error ? err.message : 'Failed',
        };
      }
    }

    // Refresh GOV.UK regulations
    if (shouldRefresh('govuk-regulations')) {
      console.log('Invoking fetch-govuk-regulations...');
      try {
        const { data, error } = await supabase.functions.invoke('fetch-govuk-regulations');
        results['govuk-regulations'] = {
          success: !error && data?.success,
          message: error?.message || data?.message || 'Completed',
        };
      } catch (err) {
        results['govuk-regulations'] = {
          success: false,
          message: err instanceof Error ? err.message : 'Failed',
        };
      }
    }

    // Update any stale cache entries
    console.log('Cleaning up stale cache entries...');
    const { data: staleCount } = await supabase
      .from('market_intelligence_cache')
      .select('id', { count: 'exact' })
      .lt('valid_until', new Date().toISOString());

    // Log summary
    const successCount = Object.values(results).filter(r => r.success).length;
    const totalCount = Object.keys(results).length;

    console.log(`Market data refresh completed: ${successCount}/${totalCount} sources updated`);
    if (staleCount) {
      console.log(`Found ${staleCount.length} stale cache entries`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Refreshed ${successCount}/${totalCount} sources`,
        results,
        staleEntries: staleCount?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in refresh-market-data:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
