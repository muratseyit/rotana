-- Create table for expert review requests
CREATE TABLE IF NOT EXISTS public.expert_review_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  analysis_id UUID,
  request_type TEXT NOT NULL CHECK (request_type IN ('full_review', 'insight_clarification', 'consultation_booking')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'completed', 'cancelled')),
  
  -- For insight clarification
  insight_category TEXT,
  insight_question TEXT,
  
  -- For consultation booking
  preferred_date DATE,
  preferred_time TIME,
  consultation_topic TEXT,
  
  -- Review details
  admin_notes TEXT,
  expert_response TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_review_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own review requests"
ON public.expert_review_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create review requests
CREATE POLICY "Users can create review requests"
ON public.expert_review_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their pending requests
CREATE POLICY "Users can update their pending requests"
ON public.expert_review_requests
FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can manage all requests
CREATE POLICY "Admins can manage all review requests"
ON public.expert_review_requests
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at
CREATE TRIGGER update_expert_review_requests_updated_at
BEFORE UPDATE ON public.expert_review_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_expert_review_requests_user_id ON public.expert_review_requests(user_id);
CREATE INDEX idx_expert_review_requests_status ON public.expert_review_requests(status);
CREATE INDEX idx_expert_review_requests_business_id ON public.expert_review_requests(business_id);