-- Add financial metrics and compliance columns to businesses table
ALTER TABLE public.businesses ADD COLUMN financial_metrics JSONB;
ALTER TABLE public.businesses ADD COLUMN compliance_status JSONB;

-- Create a new table for tracking analysis history/progress over time
CREATE TABLE public.business_analysis_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  overall_score INTEGER,
  score_breakdown JSONB,
  analysis_result JSONB,
  analysis_version TEXT DEFAULT 'v1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE public.business_analysis_history ENABLE ROW LEVEL SECURITY;

-- Create policies for the analysis history table
CREATE POLICY "Users can view their own analysis history" 
ON public.business_analysis_history 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_analysis_history.business_id 
    AND businesses.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert analysis history for their own businesses" 
ON public.business_analysis_history 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE businesses.id = business_analysis_history.business_id 
    AND businesses.user_id = auth.uid()
  )
);

-- Create an index for better performance
CREATE INDEX idx_business_analysis_history_business_id ON public.business_analysis_history(business_id);
CREATE INDEX idx_business_analysis_history_date ON public.business_analysis_history(analysis_date);