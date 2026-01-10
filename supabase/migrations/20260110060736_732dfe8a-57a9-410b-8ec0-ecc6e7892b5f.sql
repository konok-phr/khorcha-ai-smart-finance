-- Add admin delete policies to all user data tables

-- Transactions: Admin can delete any transaction
CREATE POLICY "Admins can delete any transaction" 
ON public.transactions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Accounts: Admin can delete any account
CREATE POLICY "Admins can delete any account" 
ON public.accounts 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Budgets: Admin can delete any budget
CREATE POLICY "Admins can delete any budget" 
ON public.budgets 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Recurring transactions: Admin can delete any recurring transaction
CREATE POLICY "Admins can delete any recurring transaction" 
ON public.recurring_transactions 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Savings goals: Admin can delete any savings goal
CREATE POLICY "Admins can delete any savings goal" 
ON public.savings_goals 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Credit cards: Admin can delete any credit card
CREATE POLICY "Admins can delete any credit card" 
ON public.credit_cards 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Investments: Admin can delete any investment
CREATE POLICY "Admins can delete any investment" 
ON public.investments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Loans: Admin can delete any loan
CREATE POLICY "Admins can delete any loan" 
ON public.loans 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- User roles: Admin can delete any user role
CREATE POLICY "Admins can delete any user role" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));