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

export async function scrapeWebsite(url: string): Promise<WebsiteAnalysis | null> {
  if (!url || !isSafeUrl(url)) {
    console.log('Invalid or unsafe URL provided for scraping:', url);
    return null;
  }

  console.log('Starting website scraping for:', url);

  try {
    // Fetch with 10 second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Converta Business Analyzer Bot/1.0'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log(`Failed to fetch website: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    console.log(`Fetched HTML content: ${html.length} characters`);

    // Parse HTML with deno-dom
    const doc = new DOMParser().parseFromString(html, 'text/html');
    if (!doc) {
      console.log('Failed to parse HTML');
      return null;
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
      doc.querySelector('.navigation')
    );

    // Check for contact form
    const hasContactForm = !!(
      doc.querySelector('form[name*="contact" i]') ||
      doc.querySelector('form[id*="contact" i]') ||
      doc.querySelector('form input[type="email"]')
    );

    // Check for social media links
    const socialDomains = ['facebook.com', 'twitter.com', 'linkedin.com', 'instagram.com', 'youtube.com'];
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
      bodyText.toLowerCase().includes('add to cart') ||
      bodyText.toLowerCase().includes('shopping cart')
    );

    const hasPricing = !!(
      doc.querySelector('[class*="price" i]') ||
      doc.querySelector('[id*="price" i]') ||
      /£\d+|\$\d+|€\d+/.test(bodyText)
    );

    const acceptsPayments = !!(
      bodyText.toLowerCase().includes('checkout') ||
      bodyText.toLowerCase().includes('payment') ||
      doc.querySelector('form[action*="checkout" i]') ||
      doc.querySelector('[class*="checkout" i]')
    );

    // Trust signals
    const hasSSL = url.startsWith('https://');

    const hasPrivacyPolicy = links.some(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent?.toLowerCase() || '';
      return text.includes('privacy') || href.includes('privacy');
    });

    const hasTermsOfService = links.some(link => {
      const href = link.getAttribute('href') || '';
      const text = link.textContent?.toLowerCase() || '';
      return text.includes('terms') || href.includes('terms');
    });

    // UK alignment indicators
    const hasPoundsGBP = /£\s?\d+/.test(bodyText) || bodyText.toLowerCase().includes('gbp');

    const ukPostcodePattern = /[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}/i;
    const hasUKAddress = ukPostcodePattern.test(bodyText) || 
                         bodyText.toLowerCase().includes('united kingdom') ||
                         bodyText.toLowerCase().includes('uk address');

    const ukPhonePattern = /(\+44|0)\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}/;
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
      }
    };

    console.log('Website scraping successful:', {
      title,
      contentLength: bodyText.length,
      hasNavigation,
      hasContactForm,
      hasSocialLinks,
      hasShoppingCart,
      hasSSL,
      hasPoundsGBP
    });

    return analysis;

  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Website scraping timed out after 10 seconds');
    } else {
      console.error('Error scraping website:', error);
    }
    return null;
  }
}
