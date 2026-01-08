-- Create accounts/wallets table
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cash', 'bank', 'card', 'mobile_banking', 'other')),
  balance DECIMAL(12,2) NOT NULL DEFAULT 0,
  icon TEXT DEFAULT '💳',
  color TEXT DEFAULT '#10B981',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create budgets table
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  period TEXT NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category, period)
);

-- Add account_id to transactions
ALTER TABLE public.transactions 
ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Accounts RLS policies
CREATE POLICY "Users can view their own accounts" 
ON public.accounts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" 
ON public.accounts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
ON public.accounts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" 
ON public.accounts FOR DELETE USING (auth.uid() = user_id);

-- Budgets RLS policies
CREATE POLICY "Users can view their own budgets" 
ON public.budgets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets" 
ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
ON public.budgets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
ON public.budgets FOR DELETE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_accounts_updated_at
BEFORE UPDATE ON public.accounts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
BEFORE UPDATE ON public.budgets
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();