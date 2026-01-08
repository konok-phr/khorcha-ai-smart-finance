-- Create loans table for tracking money borrowed/lent
CREATE TABLE public.loans (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    person_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('borrowed', 'lent')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
    loan_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own loans"
ON public.loans
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loans"
ON public.loans
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own loans"
ON public.loans
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own loans"
ON public.loans
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updating updated_at
CREATE TRIGGER update_loans_updated_at
BEFORE UPDATE ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();