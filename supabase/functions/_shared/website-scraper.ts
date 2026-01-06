import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

export interface WebsiteAnalysis {
  title: string;
  description: string;
  content: string;
  structure: {
    hasNavigation: boolean;
    hasContactForm: boolean;
    hasSocialLinks: boolean;
    languages: string[];
  };
  ecommerce: {
    hasShoppingCart: boolean;
    hasPricing: boolean;
    acceptsPayments: boolean;
  };
  trustSignals: {
    hasSSL: boolean;
    hasPrivacyPolicy: boolean;
    hasTermsOfService: boolean;
  };
  ukAlignment: {
    hasPoundsGBP: boolean;
    hasUKAddress: boolean;
    hasUKPhone: boolean;
  };
  scrapingStatus: 'success' | 'failed' | 'timeout' | 'blocked';
}

const isSafeUrl = (url: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    // Block localhost, private IPs, and internal addresses
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1', '10.', '192.168.', '172.16.'];
    if (blockedHosts.some(blocked => hostname.includes(blocked))) {
      return false;
    }
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
};

// Realistic browser User-Agent to avoid being blocked
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

async function fetchWithRetry(url: string, retries = 2, timeoutMs = 15000): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Cache-Control': 'max-age=0'
        }
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      console.log(`Fetch attempt ${attempt + 1} failed with status: ${response.status}`);
      
      // If blocked (403/401/429), don't retry
      if ([401, 403, 429].includes(response.status)) {
        console.log('Request blocked by server, not retrying');
        return null;
      }

    } catch (error) {
      const errorName = error instanceof Error ? error.name : 'Unknown';
      console.log(`Fetch attempt ${attempt + 1} error: ${errorName}`);
      
      if (errorName === 'AbortError') {
        console.log('Request timed out');
      }
      
      // Wait before retry with exponential backoff
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  return null;
}

export async function scrapeWebsite(url: string): Promise<WebsiteAnalysis | null> {
  if (!url || !isSafeUrl(url)) {
    console.log('Invalid or unsafe URL provided for scraping:', url);
    return null;
  }

  console.log('Starting website scraping for:', url);

  const response = await fetchWithRetry(url);
  
  if (!response) {
    console.log('All fetch attempts failed for:', url);
    // Return a minimal result indicating scraping failed but URL exists
    return {
      title: '',
      description: '',
      content: '',
      structure: {
        hasNavigation: false,
        hasContactForm: false,
        hasSocialLinks: false,
        languages: []
      },
      ecommerce: {
        hasShoppingCart: false,
        hasPricing: false,
        acceptsPayments: false
      },
      trustSignals: {
        hasSSL: url.startsWith('https://'),
        hasPrivacyPolicy: false,
        hasTermsOfService: false
      },
      ukAlignment: {
        hasPoundsGBP: false,
        hasUKAddress: false,
        hasUKPhone: false
      },
      scrapingStatus: 'failed'
    };
  }

  try {
    const html = await response.text();
    console.log(`Fetched HTML content: ${html.length} characters`);

    // Parse HTML with deno-dom
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) {
      console.log('Failed to parse HTML');
      return {
        title: '',
        description: '',
        content: '',
        structure: { hasNavigation: false, hasContactForm: false, hasSocialLinks: false, languages: [] },
        ecommerce: { hasShoppingCart: false, hasPricing: false, acceptsPayments: false },
        trustSignals: { hasSSL: url.startsWith('https://'), hasPrivacyPolicy: false, hasTermsOfService: false },
        ukAlignment: { hasPoundsGBP: false, hasUKAddress: false, hasUKPhone: false },
        scrapingStatus: 'failed'
      };
    }

    // Extract page title
    const title = doc.querySelector('title')?.textContent?.trim() || '';

    // Extract meta description
    const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim() || '';

    // Extract body text (limit to 3000 chars to avoid token limits)
    const bodyElement = doc.querySelector('body');
    let bodyText = bodyElement?.textContent || '';
    // Clean up whitespace
    bodyText = bodyText.replace(/\s+/g, ' ').trim().substring(0, 3000);

    // Check for navigation
    const hasNavigation = !!(
      doc.querySelector('nav') ||
      doc.querySelector('[role="navigation"]') ||
      doc.querySelector('.nav') ||
      doc.querySelector('.navigation') ||
      doc.querySelector('header')
    );

    // Check for contact form
    const hasContactForm = !!(
      doc.querySelector('form[name*="contact" i]') ||
      doc.querySelector('form[id*="contact" i]') ||
      doc.querySelector('form[class*="contact" i]') ||
      doc.querySelector('form input[type="email"]') ||
      doc.querySelector('form textarea')
    );

    // Check for social media links
    const socialDomains = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'x.com'];
    const links = Array.from(doc.querySelectorAll('a[href]'));
    const hasSocialLinks = links.some(link => {
      const href = link.getAttribute('href') || '';
      return socialDomains.some(domain => href.includes(domain));
    });

    // Detect languages (look for lang attributes)
    const languages: string[] = [];
    const htmlLang = doc.querySelector('html')?.getAttribute('lang');
    if (htmlLang) languages.push(htmlLang);
    
    const langSwitchers = doc.querySelectorAll('[hreflang]');
    langSwitchers.forEach(el => {
      const lang = el.getAttribute('hreflang');
      if (lang && !languages.includes(lang)) languages.push(lang);
    });

    // E-commerce indicators
    const hasShoppingCart = !!(
      doc.querySelector('[class*="cart" i]') ||
      doc.querySelector('[id*="cart" i]') ||
      doc.querySelector('[class*="basket" i]') ||
      bodyText.toLowerCase().includes('add to cart') ||
      bodyText.toLowerCase().includes('add to basket') ||
      bodyText.toLowerCase().includes('shopping cart')
    );

    const hasPricing = !!(
      doc.querySelector('[class*="price" i]') ||
      doc.querySelector('[id*="price" i]') ||
      /£\d+|\$\d+|€\d+|TL\s?\d+|₺\d+/.test(bodyText)
    );

    const acceptsPayments = !!(
      bodyText.toLowerCase().includes('checkout') ||
      bodyText.toLowerCase().includes('payment') ||
      bodyText.toLowerCase().includes('pay now') ||
      doc.querySelector('form[action*="checkout" i]') ||
      doc.querySelector('[class*="checkout" i]') ||
      doc.querySelector('[class*="payment" i]')
    );

    // Trust signals
    const hasSSL = url.startsWith('https://');

    const hasPrivacyPolicy = links.some(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent?.toLowerCase() || '';
      return text.includes('privacy') || href.includes('privacy') || 
             text.includes('gizlilik') || href.includes('gizlilik');
    });

    const hasTermsOfService = links.some(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent?.toLowerCase() || '';
      return text.includes('terms') || href.includes('terms') ||
             text.includes('koşul') || href.includes('kosul');
    });

    // UK alignment indicators
    const hasPoundsGBP = /£\s?\d+/.test(bodyText) || 
                         bodyText.toLowerCase().includes('gbp') ||
                         bodyText.toLowerCase().includes('pound');

    const ukPostcodePattern = /[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}/i;
    const hasUKAddress = ukPostcodePattern.test(bodyText) || 
                         bodyText.toLowerCase().includes('united kingdom') ||
                         bodyText.toLowerCase().includes('uk address') ||
                         bodyText.toLowerCase().includes(', uk');

    const ukPhonePattern = /(\+44|0044)\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}/;
    const hasUKPhone = ukPhonePattern.test(bodyText);

    const analysis: WebsiteAnalysis = {
      title,
      description: metaDesc,
      content: bodyText,
      structure: {
        hasNavigation,
        hasContactForm,
        hasSocialLinks,
        languages: languages.length > 0 ? languages : ['en']
      },
      ecommerce: {
        hasShoppingCart,
        hasPricing,
        acceptsPayments
      },
      trustSignals: {
        hasSSL,
        hasPrivacyPolicy,
        hasTermsOfService
      },
      ukAlignment: {
        hasPoundsGBP,
        hasUKAddress,
        hasUKPhone
      },
      scrapingStatus: 'success'
    };

    console.log('Website scraping successful:', {
      title,
      contentLength: bodyText.length,
      hasNavigation,
      hasContactForm,
      hasSocialLinks,
      hasShoppingCart,
      hasSSL,
      hasPoundsGBP,
      scrapingStatus: 'success'
    });

    return analysis;

  } catch (error) {
    console.error('Error parsing website content:', error);
    return {
      title: '',
      description: '',
      content: '',
      structure: { hasNavigation: false, hasContactForm: false, hasSocialLinks: false, languages: [] },
      ecommerce: { hasShoppingCart: false, hasPricing: false, acceptsPayments: false },
      trustSignals: { hasSSL: url.startsWith('https://'), hasPrivacyPolicy: false, hasTermsOfService: false },
      ukAlignment: { hasPoundsGBP: false, hasUKAddress: false, hasUKPhone: false },
      scrapingStatus: 'failed'
    };
  }
}

// Fallback scraper using Firecrawl API
export async function scrapeWithFirecrawlFallback(url: string): Promise<WebsiteAnalysis | null> {
  // First try native scraper
  console.log('Attempting native scraping for:', url);
  const nativeResult = await scrapeWebsite(url);
  
  if (nativeResult && nativeResult.scrapingStatus === 'success') {
    console.log('Native scraping succeeded');
    return nativeResult;
  }
  
  // Try Firecrawl as fallback
  console.log('Native scraping failed, attempting Firecrawl fallback...');
  
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlApiKey) {
    console.log('Firecrawl API key not configured, skipping fallback');
    return nativeResult; // Return failed native result
  }
  
  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ['markdown', 'html', 'links'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });
    
    if (!response.ok) {
      console.log('Firecrawl request failed with status:', response.status);
      return nativeResult;
    }
    
    const data = await response.json();
    const firecrawlData = data.data || data;
    
    if (!firecrawlData.markdown && !firecrawlData.html) {
      console.log('Firecrawl returned no content');
      return nativeResult;
    }
    
    console.log('Firecrawl scraping succeeded');
    
    const content = firecrawlData.markdown || firecrawlData.html || '';
    const contentText = content.substring(0, 3000);
    const links = firecrawlData.links || [];
    
    // Analyze the Firecrawl content
    const socialDomains = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com', 'x.com'];
    const hasSocialLinks = links.some((link: string) => socialDomains.some(domain => link.includes(domain)));
    
    const hasPrivacyPolicy = links.some((link: string) => link.toLowerCase().includes('privacy'));
    const hasTermsOfService = links.some((link: string) => link.toLowerCase().includes('terms'));
    
    return {
      title: firecrawlData.metadata?.title || '',
      description: firecrawlData.metadata?.description || '',
      content: contentText,
      structure: {
        hasNavigation: true, // Assume true since page loaded
        hasContactForm: contentText.toLowerCase().includes('contact') || contentText.toLowerCase().includes('email'),
        hasSocialLinks,
        languages: [firecrawlData.metadata?.language || 'en']
      },
      ecommerce: {
        hasShoppingCart: /cart|basket|shop/i.test(contentText),
        hasPricing: /£\d+|\$\d+|€\d+|TL\s?\d+|₺\d+/.test(contentText),
        acceptsPayments: /checkout|payment|pay now/i.test(contentText)
      },
      trustSignals: {
        hasSSL: url.startsWith('https://'),
        hasPrivacyPolicy,
        hasTermsOfService
      },
      ukAlignment: {
        hasPoundsGBP: /£\s?\d+|gbp|pound/i.test(contentText),
        hasUKAddress: /[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}|united kingdom|, uk/i.test(contentText),
        hasUKPhone: /(\+44|0044)\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}/.test(contentText)
      },
      scrapingStatus: 'success'
    };
    
  } catch (error) {
    console.error('Firecrawl fallback error:', error);
    return nativeResult;
  }
}
