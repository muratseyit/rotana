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
      },
      insights: {
        isActive: companyData.company_status === 'active',
        ageInYears: companyData.date_of_creation 
          ? Math.floor((Date.now() - new Date(companyData.date_of_creation).getTime()) / (1000 * 60 * 60 * 24 * 365))
          : null,
        hasUKAddress: companyData.registered_office_address?.country === 'United Kingdom' || 
                      companyData.address?.country === 'United Kingdom',
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
