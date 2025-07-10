-- Add analysis results to businesses table
ALTER TABLE public.businesses ADD COLUMN analysis_result JSONB;
ALTER TABLE public.businesses ADD COLUMN overall_score INTEGER;
ALTER TABLE public.businesses ADD COLUMN analysis_status TEXT DEFAULT 'pending';
ALTER TABLE public.businesses ADD COLUMN analyzed_at TIMESTAMP WITH TIME ZONE;