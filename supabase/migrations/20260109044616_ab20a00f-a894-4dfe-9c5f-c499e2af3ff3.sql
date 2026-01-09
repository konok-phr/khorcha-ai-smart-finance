-- Create credit cards table
CREATE TABLE public.credit_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  card_name TEXT NOT NULL,
  card_number_last4 TEXT,
  credit_limit NUMERIC NOT NULL DEFAULT 0,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  bill_generation_date INTEGER NOT NULL DEFAULT 1,
  due_date INTEGER NOT NULL DEFAULT 15,
  color TEXT DEFAULT '#8B5CF6',
  icon TEXT DEFAULT '💳',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own credit cards" 
ON public.credit_cards FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own credit cards" 
ON public.credit_cards FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit cards" 
ON public.credit_cards FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit cards" 
ON public.credit_cards FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_credit_cards_updated_at
BEFORE UPDATE ON public.credit_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();