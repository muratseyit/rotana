-- Fix: Drop and recreate tables since they were partially created
DROP TABLE IF EXISTS public.trade_statistics CASCADE;
DROP TABLE IF EXISTS public.market_intelligence_cache CASCADE;
DROP TABLE IF EXISTS public.regulatory_updates CASCADE;
DROP TABLE IF EXISTS public.market_data_sources CASCADE;
DROP FUNCTION IF EXISTS public.update_market_data_timestamp() CASCADE;

-- =============================================
-- Market Intelligence Data Infrastructure
-- =============================================

-- 1. Market Data Sources - tracks all integrated data sources
CREATE TABLE public.market_data_sources (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_name TEXT NOT NULL UNIQUE,
  source_type TEXT NOT NULL CHECK (source_type IN ('api', 'scrape', 'document', 'manual')),
  source_url TEXT,
  description TEXT,
  data_categories TEXT[] DEFAULT '{}',
  fetch_frequency TEXT DEFAULT 'weekly' CHECK (fetch_frequency IN ('hourly', 'daily', 'weekly', 'monthly', 'manual', 'realtime')),
  last_fetched_at TIMESTAMP WITH TIME ZONE,
  last_fetch_status TEXT CHECK (last_fetch_status IN ('success', 'partial', 'failed', 'pending')),
  is_active BOOLEAN DEFAULT true,
  requires_auth BOOLEAN DEFAULT false,
  auth_type TEXT,
  reliability_score INTEGER DEFAULT 80 CHECK (reliability_score >= 0 AND reliability_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Market Intelligence Cache - stores fetched market data
CREATE TABLE public.market_intelligence_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.market_data_sources(id) ON DELETE SET NULL,
  industry TEXT NOT NULL,
  data_category TEXT NOT NULL CHECK (data_category IN ('market_size', 'trade_volume', 'growth_rate', 'competition', 'regulatory', 'opportunity')),
  metric_name TEXT NOT NULL,
  metric_value NUMERIC,
  metric_text TEXT,
  unit TEXT,
  currency TEXT DEFAULT 'GBP',
  period TEXT,
  valid_from TIMESTAMP WITH TIME ZONE DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days'),
  confidence_score INTEGER DEFAULT 70 CHECK (confidence_score >= 0 AND confidence_score <= 100),
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_market_intelligence_industry ON public.market_intelligence_cache(industry);
CREATE INDEX idx_market_intelligence_category ON public.market_intelligence_cache(data_category);
CREATE INDEX idx_market_intelligence_valid ON public.market_intelligence_cache(valid_until);

-- 3. Trade Statistics - Turkey-UK bilateral trade data
CREATE TABLE public.trade_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.market_data_sources(id) ON DELETE SET NULL,
  origin_country TEXT NOT NULL DEFAULT 'Turkey',
  destination_country TEXT NOT NULL DEFAULT 'UK',
  hs_code_chapter TEXT,
  sector TEXT,
  year INTEGER NOT NULL,
  period TEXT DEFAULT 'annual' CHECK (period IN ('Q1', 'Q2', 'Q3', 'Q4', 'H1', 'H2', 'annual')),
  export_value NUMERIC,
  import_value NUMERIC,
  currency TEXT DEFAULT 'USD',
  growth_rate_yoy NUMERIC,
  top_products TEXT[],
  raw_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for trade lookups
CREATE INDEX idx_trade_stats_sector ON public.trade_statistics(sector);
CREATE INDEX idx_trade_stats_year ON public.trade_statistics(year);
CREATE INDEX idx_trade_stats_hs_code ON public.trade_statistics(hs_code_chapter);

-- 4. Regulatory Updates - UK regulatory changes by sector
CREATE TABLE public.regulatory_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_id UUID REFERENCES public.market_data_sources(id) ON DELETE SET NULL,
  authority TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  industry_sectors TEXT[] DEFAULT '{}',
  effective_date DATE,
  compliance_deadline DATE,
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  source_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for regulatory lookups
CREATE INDEX idx_regulatory_authority ON public.regulatory_updates(authority);
CREATE INDEX idx_regulatory_sectors ON public.regulatory_updates USING GIN(industry_sectors);

-- 5. Enable RLS on all tables (public read, admin write)
ALTER TABLE public.market_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_intelligence_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trade_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulatory_updates ENABLE ROW LEVEL SECURITY;

-- Public read policies (all authenticated and anon can read)
CREATE POLICY "Anyone can read market data sources" 
ON public.market_data_sources FOR SELECT USING (true);

CREATE POLICY "Anyone can read market intelligence" 
ON public.market_intelligence_cache FOR SELECT USING (true);

CREATE POLICY "Anyone can read trade statistics" 
ON public.trade_statistics FOR SELECT USING (true);

CREATE POLICY "Anyone can read regulatory updates" 
ON public.regulatory_updates FOR SELECT USING (true);

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role can manage market data sources" 
ON public.market_data_sources FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage market intelligence" 
ON public.market_intelligence_cache FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage trade statistics" 
ON public.trade_statistics FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage regulatory updates" 
ON public.regulatory_updates FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- 6. Insert initial data sources
INSERT INTO public.market_data_sources (source_name, source_type, source_url, description, data_categories, fetch_frequency, reliability_score) VALUES
('Kolay İhracat', 'scrape', 'https://www.kolayihracat.gov.tr/ulkeler/ingiltere', 'Turkish government export portal with UK market data', ARRAY['trade_volume', 'regulatory', 'market_size'], 'weekly', 95),
('TIM UK Report', 'document', 'https://tim.org.tr/files/downloads/Ulke_Bilgi_Notlari/BirlesikKrallikUlkeBilgiNotu.pdf', 'Turkish Exporters Assembly UK market report', ARRAY['trade_volume', 'competition', 'opportunity'], 'monthly', 90),
('Trade Ministry Report', 'document', 'https://ticaret.gov.tr/data/5f43b6cf13b8764f3060f211/Birle%C5%9Fik%20Krall%C4%B1k%20Pazar%20Bilgileri-2025.pdf', 'Turkish Ministry of Trade UK market info 2025', ARRAY['market_size', 'regulatory', 'trade_volume'], 'monthly', 95),
('GOV.UK Regulations', 'scrape', 'https://www.gov.uk/guidance/importing-goods-into-the-uk', 'UK government import regulations', ARRAY['regulatory'], 'daily', 100),
('London Chamber of Commerce', 'scrape', 'https://www.londonchamber.co.uk/', 'LCCI market insights and trade data', ARRAY['market_size', 'competition', 'opportunity'], 'weekly', 85),
('ICC UK', 'scrape', 'https://iccwbo.org/', 'International Chamber of Commerce UK', ARRAY['regulatory', 'trade_volume'], 'weekly', 90),
('HMRC Trade Info', 'api', 'https://www.uktradeinfo.com/', 'UK government bilateral trade statistics', ARRAY['trade_volume'], 'monthly', 100),
('Perplexity Search', 'api', NULL, 'AI-powered real-time web research', ARRAY['competition', 'market_size', 'regulatory', 'opportunity'], 'realtime', 75);

-- 7. Insert initial trade statistics from Kolay İhracat
INSERT INTO public.trade_statistics (source_id, sector, year, export_value, import_value, currency, growth_rate_yoy, top_products) VALUES
((SELECT id FROM public.market_data_sources WHERE source_name = 'Kolay İhracat'), 'All Sectors', 2024, 21140000000, 20530000000, 'USD', 5.2, ARRAY['Automotive Parts', 'Textiles', 'Electronics', 'Machinery', 'Food Products']),
((SELECT id FROM public.market_data_sources WHERE source_name = 'Kolay İhracat'), 'Automotive', 2024, 4333700000, NULL, 'USD', 3.8, ARRAY['Vehicle Parts', 'Tyres', 'Glass', 'Electrical Components']),
((SELECT id FROM public.market_data_sources WHERE source_name = 'Kolay İhracat'), 'Textile', 2024, 3890000000, NULL, 'USD', 6.5, ARRAY['Knitwear', 'Woven Fabrics', 'Home Textiles', 'Denim']),
((SELECT id FROM public.market_data_sources WHERE source_name = 'Kolay İhracat'), 'Electronics', 2024, 2100000000, NULL, 'USD', 8.2, ARRAY['White Goods', 'TVs', 'Cables', 'Transformers']),
((SELECT id FROM public.market_data_sources WHERE source_name = 'Kolay İhracat'), 'Food', 2024, 1200000000, NULL, 'USD', 12.4, ARRAY['Dried Fruits', 'Nuts', 'Olive Oil', 'Confectionery']);

-- 8. Insert initial market intelligence from verified sources
INSERT INTO public.market_intelligence_cache (source_id, industry, data_category, metric_name, metric_value, unit, period, confidence_score) VALUES
-- E-commerce market from Kolay İhracat
((SELECT id FROM public.market_data_sources WHERE source_name = 'Kolay İhracat'), 'retail', 'market_size', 'UK E-commerce Market Size', 152.5, 'billion GBP', '2024', 90),
((SELECT id FROM public.market_data_sources WHERE source_name = 'Kolay İhracat'), 'retail', 'growth_rate', 'Online Retail Share', 26.7, 'percent', '2024', 90),
-- Trade volumes
((SELECT id FROM public.market_data_sources WHERE source_name = 'Kolay İhracat'), 'all', 'trade_volume', 'Turkey to UK Exports', 21.14, 'billion USD', '2024', 95),
((SELECT id FROM public.market_data_sources WHERE source_name = 'Kolay İhracat'), 'all', 'trade_volume', 'UK to Turkey Exports', 20.53, 'billion USD', '2024', 95),
-- Sector market sizes
((SELECT id FROM public.market_data_sources WHERE source_name = 'London Chamber of Commerce'), 'automotive', 'market_size', 'UK Automotive Market', 85, 'billion GBP', '2024', 85),
((SELECT id FROM public.market_data_sources WHERE source_name = 'London Chamber of Commerce'), 'textile', 'market_size', 'UK Textile Market', 65, 'billion GBP', '2024', 85),
((SELECT id FROM public.market_data_sources WHERE source_name = 'London Chamber of Commerce'), 'food', 'market_size', 'UK Food & Beverage Market', 240, 'billion GBP', '2024', 85);

-- 9. Update timestamp trigger
CREATE OR REPLACE FUNCTION public.update_market_data_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_market_data_sources_timestamp
  BEFORE UPDATE ON public.market_data_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_market_data_timestamp();

CREATE TRIGGER update_regulatory_updates_timestamp
  BEFORE UPDATE ON public.regulatory_updates
  FOR EACH ROW EXECUTE FUNCTION public.update_market_data_timestamp();