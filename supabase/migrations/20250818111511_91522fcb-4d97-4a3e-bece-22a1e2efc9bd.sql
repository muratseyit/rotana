-- Create projects table for client job postings
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min DECIMAL(10,2),
  budget_max DECIMAL(10,2),
  currency TEXT DEFAULT 'GBP',
  category TEXT NOT NULL,
  skills_required TEXT[],
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create bids table for partner proposals
CREATE TABLE public.bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  proposal TEXT NOT NULL,
  bid_amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  delivery_time_days INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, partner_id)
);

-- Create milestones table for payment tracking
CREATE TABLE public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  bid_id UUID NOT NULL REFERENCES public.bids(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'GBP',
  due_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'approved', 'paid', 'disputed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create transactions table for payment tracking with escrow
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id),
  milestone_id UUID REFERENCES public.milestones(id),
  payer_id UUID NOT NULL REFERENCES auth.users(id),
  payee_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'GBP',
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('milestone_payment', 'ai_analysis', 'commission')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'held_in_escrow', 'released', 'refunded', 'completed')),
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create ai_analysis_payments table for immediate AI analysis billing
CREATE TABLE public.ai_analysis_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL DEFAULT 7.00,
  currency TEXT DEFAULT 'GBP',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_analysis_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Anyone can view open projects" ON public.projects
  FOR SELECT USING (status = 'open' OR client_id = auth.uid());

CREATE POLICY "Clients can create their own projects" ON public.projects
  FOR INSERT WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update their own projects" ON public.projects
  FOR UPDATE USING (client_id = auth.uid());

-- RLS Policies for bids
CREATE POLICY "Anyone can view bids on projects they're involved in" ON public.bids
  FOR SELECT USING (
    partner_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
  );

CREATE POLICY "Partners can create bids" ON public.bids
  FOR INSERT WITH CHECK (partner_id = auth.uid());

CREATE POLICY "Partners can update their own bids" ON public.bids
  FOR UPDATE USING (partner_id = auth.uid());

-- RLS Policies for milestones
CREATE POLICY "Project participants can view milestones" ON public.milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.projects p 
      JOIN public.bids b ON b.project_id = p.id 
      WHERE p.id = project_id AND (p.client_id = auth.uid() OR b.partner_id = auth.uid())
    )
  );

CREATE POLICY "Clients can create milestones" ON public.milestones
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
  );

CREATE POLICY "Clients can update milestones" ON public.milestones
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
  );

-- RLS Policies for transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (payer_id = auth.uid() OR payee_id = auth.uid());

CREATE POLICY "System can insert transactions" ON public.transactions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "System can update transactions" ON public.transactions
  FOR UPDATE USING (true);

-- RLS Policies for ai_analysis_payments
CREATE POLICY "Users can view their own AI analysis payments" ON public.ai_analysis_payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create AI analysis payments" ON public.ai_analysis_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Add indexes for performance
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_bids_project_id ON public.bids(project_id);
CREATE INDEX idx_bids_partner_id ON public.bids(partner_id);
CREATE INDEX idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX idx_transactions_payer_id ON public.transactions(payer_id);
CREATE INDEX idx_transactions_payee_id ON public.transactions(payee_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bids_updated_at
  BEFORE UPDATE ON public.bids
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON public.milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();