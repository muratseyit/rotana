import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { companyName, companyNumber } = await req.json();
    
    const companiesHouseApiKey = Deno.env.get('COMPANIES_HOUSE_API_KEY');
    
    if (!companiesHouseApiKey) {
      console.log('Companies House API key not configured, skipping verification');
      return new Response(
        JSON.stringify({ 
          verified: false,
          reason: 'API key not configured',
          data: null 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    let searchResults = null;
    
    // Search by company number if provided
    if (companyNumber) {
      const companyResponse = await fetch(
        `https://api.company-information.service.gov.uk/company/${companyNumber}`,
        {
          headers: {
            'Authorization': `Basic ${btoa(companiesHouseApiKey + ':')}`,
          },
        }
      );

      if (companyResponse.ok) {
        searchResults = await companyResponse.json();
      }
    } 
    // Otherwise search by company name
    else if (companyName) {
      const searchResponse = await fetch(
        `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(companyName)}&items_per_page=5`,
        {
          headers: {
            'Authorization': `Basic ${btoa(companiesHouseApiKey + ':')}`,
          },
        }
      );

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        searchResults = searchData.items || [];
      }
    }

    if (!searchResults) {
      return new Response(
        JSON.stringify({ 
          verified: false,
          reason: 'Company not found',
          data: null 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Extract relevant information
    const companyData = Array.isArray(searchResults) ? searchResults[0] : searchResults;
    
    // Fetch additional company data (officers, filing history, etc.)
    let officers = null;
    let filingHistory = null;
    
    if (companyData.company_number) {
      try {
        // Get company officers
        const officersResponse = await fetch(
          `https://api.company-information.service.gov.uk/company/${companyData.company_number}/officers`,
          {
            headers: {
              'Authorization': `Basic ${btoa(companiesHouseApiKey + ':')}`,
            },
          }
        );
        if (officersResponse.ok) {
          officers = await officersResponse.json();
        }

        // Get filing history
        const filingResponse = await fetch(
          `https://api.company-information.service.gov.uk/company/${companyData.company_number}/filing-history?items_per_page=10`,
          {
            headers: {
              'Authorization': `Basic ${btoa(companiesHouseApiKey + ':')}`,
            },
          }
        );
        if (filingResponse.ok) {
          filingHistory = await filingResponse.json();
        }
      } catch (err) {
        console.log('Error fetching additional company data:', err);
      }
    }
    
    const verificationResult = {
      verified: true,
      data: {
        companyNumber: companyData.company_number,
        companyName: companyData.company_name || companyData.title,
        companyStatus: companyData.company_status,
        companyType: companyData.company_type || companyData.type,
        dateOfCreation: companyData.date_of_creation,
        address: companyData.registered_office_address || companyData.address,
        sicCodes: companyData.sic_codes,
        registeredOfficeIsMail: companyData.registered_office_is_in_dispute,
        jurisdiction: companyData.jurisdiction,
        accounts: companyData.accounts,
        confirmationStatement: companyData.confirmation_statement,
        hasBeenLiquidated: companyData.has_been_liquidated,
        hasCharges: companyData.has_charges,
        hasInsolvencyHistory: companyData.has_insolvency_history,
        officers: officers?.items || [],
        recentFilings: filingHistory?.items || [],
      },
      insights: {
        isActive: companyData.company_status === 'active',
        ageInYears: companyData.date_of_creation 
          ? Math.floor((Date.now() - new Date(companyData.date_of_creation).getTime()) / (1000 * 60 * 60 * 24 * 365))
          : null,
        hasUKAddress: companyData.registered_office_address?.country === 'United Kingdom' || 
                      companyData.address?.country === 'United Kingdom',
        filingCompliance: companyData.accounts?.overdue === false && 
                         companyData.confirmation_statement?.overdue === false,
        accountsOverdue: companyData.accounts?.overdue || false,
        confirmationStatementOverdue: companyData.confirmation_statement?.overdue || false,
        numberOfOfficers: officers?.active_count || 0,
        hasCharges: companyData.has_charges || false,
        hasInsolvencyHistory: companyData.has_insolvency_history || false,
        lastAccountsDate: companyData.accounts?.last_accounts?.made_up_to,
        nextAccountsDue: companyData.accounts?.next_due,
        industryClassification: companyData.sic_codes?.map((code: string) => getSICDescription(code)) || [],
      }
    };

    return new Response(
      JSON.stringify(verificationResult),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in verify-uk-company:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        verified: false,
        data: null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

// Helper function to get SIC code descriptions
function getSICDescription(code: string): { code: string; description: string } {
  const sicCodes: Record<string, string> = {
    '01110': 'Growing of cereals',
    '46510': 'Wholesale of computers, computer peripheral equipment and software',
    '62011': 'Ready-made interactive leisure and entertainment software development',
    '62012': 'Business and domestic software development',
    '62020': 'Information technology consultancy activities',
    '62090': 'Other information technology service activities',
    '63110': 'Data processing, hosting and related activities',
    '70221': 'Financial management',
    '74909': 'Other professional, scientific and technical activities',
    '82990': 'Other business support service activities',
    '47910': 'Retail sale via mail order houses or via Internet',
    '96090': 'Other service activities',
    '73110': 'Advertising agencies',
    '73120': 'Media representation',
  };
  
  return {
    code,
    description: sicCodes[code] || `SIC Code ${code}`
  };
}
