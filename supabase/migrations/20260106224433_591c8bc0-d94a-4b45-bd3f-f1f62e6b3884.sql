-- Fix 1: Drop and recreate overly permissive RLS policies on subscribers
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_own_subscription" ON public.subscribers;

-- Create proper RLS policies for subscribers
-- Insert only allowed for authenticated users inserting their own subscription OR service role
CREATE POLICY "Users can insert their own subscription" 
ON public.subscribers 
FOR INSERT 
WITH CHECK (
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR 
  (auth.uid() IS NOT NULL AND email = auth.email())
);

-- Update only allowed for service role (webhooks) or users updating their own record
CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (user_id = auth.uid() OR email = auth.email());

-- Fix 2: Drop and recreate overly permissive RLS policies on transactions  
DROP POLICY IF EXISTS "System can insert transactions" ON public.transactions;
DROP POLICY IF EXISTS "System can update transactions" ON public.transactions;

-- Transactions should only be insertable by authenticated users for their own payments
CREATE POLICY "Users can insert their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (payer_id = auth.uid());

-- Transactions can only be updated by involved parties
CREATE POLICY "Users can update their own transactions" 
ON public.transactions 
FOR UPDATE 
USING (payer_id = auth.uid() OR payee_id = auth.uid());

-- Fix 3: Fix mutable search_path in update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;