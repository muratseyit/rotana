import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RegulatoryUpdate {
  authority: string;
  requirementType: string;
  title: string;
  description: string;
  industrySectors: string[];
  sourceUrl: string;
  severity: 'info' | 'warning' | 'critical';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting GOV.UK regulations fetch...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!firecrawlKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Key GOV.UK pages to scrape for regulatory updates
    const govUkPages = [
      {
        url: 'https://www.gov.uk/guidance/importing-goods-into-the-uk',
        authority: 'HMRC',
        category: 'import',
      },
      {
        url: 'https://www.gov.uk/guidance/placing-manufactured-goods-on-the-uk-market',
        authority: 'BEIS',
        category: 'ukca',
      },
      {
        url: 'https://www.gov.uk/guidance/uk-reach',
        authority: 'HSE',
        category: 'chemicals',
      },
    ];

    const allUpdates: RegulatoryUpdate[] = [];

    for (const page of govUkPages) {
      console.log(`Scraping: ${page.url}`);

      try {
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: page.url,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        if (!scrapeResponse.ok) {
          console.error(`Failed to scrape ${page.url}`);
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        const content = scrapeData.data?.markdown || '';
        
        // Parse the content for regulatory requirements
        const updates = parseGovUkContent(content, page.authority, page.category, page.url);
        allUpdates.push(...updates);
      } catch (err) {
        console.error(`Error scraping ${page.url}:`, err);
      }
    }

    console.log(`Extracted ${allUpdates.length} regulatory updates`);

    // Get source ID
    const { data: sourceData } = await supabase
      .from('market_data_sources')
      .select('id')
      .eq('source_name', 'GOV.UK Regulations')
      .single();

    const sourceId = sourceData?.id;

    // Store the updates
    for (const update of allUpdates) {
      const { error } = await supabase
        .from('regulatory_updates')
        .upsert({
          source_id: sourceId,
          authority: update.authority,
          requirement_type: update.requirementType,
          title: update.title,
          description: update.description,
          industry_sectors: update.industrySectors,
          source_url: update.sourceUrl,
          severity: update.severity,
          last_verified_at: new Date().toISOString(),
        }, {
          onConflict: 'authority,title',
          ignoreDuplicates: false,
        });

      if (error) {
        console.error('Error upserting regulatory update:', error);
      }
    }

    // Update source status
    await supabase
      .from('market_data_sources')
      .update({
        last_fetched_at: new Date().toISOString(),
        last_fetch_status: allUpdates.length > 0 ? 'success' : 'partial',
      })
      .eq('source_name', 'GOV.UK Regulations');

    console.log('GOV.UK regulations fetch completed');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Regulatory updates fetched successfully',
        recordsUpdated: allUpdates.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-govuk-regulations:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseGovUkContent(
  content: string,
  authority: string,
  category: string,
  sourceUrl: string
): RegulatoryUpdate[] {
  const updates: RegulatoryUpdate[] = [];

  // Common regulatory patterns
  const patterns = {
    ukca: {
      keywords: ['UKCA', 'conformity assessment', 'declaration of conformity', 'CE marking'],
      sectors: ['manufacturing', 'electronics', 'medical', 'machinery'],
      type: 'Product Certification',
    },
    import: {
      keywords: ['customs declaration', 'import duty', 'tariff', 'EORI', 'CDS'],
      sectors: ['all'],
      type: 'Import Compliance',
    },
    chemicals: {
      keywords: ['UK REACH', 'chemical registration', 'substance notification'],
      sectors: ['cosmetics', 'manufacturing', 'chemicals'],
      type: 'Chemical Regulation',
    },
    food: {
      keywords: ['FSA', 'food safety', 'health certificate', 'phytosanitary'],
      sectors: ['food'],
      type: 'Food Safety',
    },
  };

  // Extract key requirements based on category
  const categoryPatterns = patterns[category as keyof typeof patterns];
  if (!categoryPatterns) return updates;

  for (const keyword of categoryPatterns.keywords) {
    const keywordRegex = new RegExp(`[^.]*${keyword}[^.]*\\.`, 'gi');
    const matches = content.match(keywordRegex);

    if (matches && matches.length > 0) {
      // Take the first meaningful match
      const relevantMatch = matches[0].trim();
      if (relevantMatch.length > 30 && relevantMatch.length < 500) {
        updates.push({
          authority,
          requirementType: categoryPatterns.type,
          title: `${keyword} Requirement`,
          description: relevantMatch,
          industrySectors: categoryPatterns.sectors,
          sourceUrl,
          severity: keyword.includes('mandatory') || keyword.includes('required') ? 'warning' : 'info',
        });
      }
    }
  }

  // Add static key requirements if not already captured
  if (category === 'ukca' && !updates.some(u => u.title.includes('UKCA'))) {
    updates.push({
      authority: 'BEIS',
      requirementType: 'Product Certification',
      title: 'UKCA Marking Requirement',
      description: 'Products placed on the UK market must bear the UKCA mark to show conformity with UK regulations. This applies to most manufactured goods previously requiring CE marking.',
      industrySectors: ['manufacturing', 'electronics', 'machinery', 'medical devices'],
      sourceUrl,
      severity: 'warning',
    });
  }

  if (category === 'import' && !updates.some(u => u.title.includes('EORI'))) {
    updates.push({
      authority: 'HMRC',
      requirementType: 'Import Compliance',
      title: 'EORI Number Requirement',
      description: 'An Economic Operator Registration and Identification (EORI) number is required to import goods into the UK. Non-UK businesses can apply for an EORI starting with GB.',
      industrySectors: ['all'],
      sourceUrl,
      severity: 'critical',
    });
  }

  if (category === 'chemicals' && !updates.some(u => u.title.includes('UK REACH'))) {
    updates.push({
      authority: 'HSE',
      requirementType: 'Chemical Regulation',
      title: 'UK REACH Registration',
      description: 'Chemicals imported into the UK must be registered under UK REACH. Importers need a UK-based Only Representative for non-UK manufacturers.',
      industrySectors: ['cosmetics', 'manufacturing', 'chemicals'],
      sourceUrl,
      severity: 'warning',
    });
  }

  return updates;
}
