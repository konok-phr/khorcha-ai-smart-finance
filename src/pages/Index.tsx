import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionList } from '@/components/TransactionList';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { AIChatbot } from '@/components/AIChatbot';
import { FloatingActions } from '@/components/FloatingActions';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const { user, isLoading: authLoading } = useAuth();
  
  const {
    transactions,
    isLoading,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
  } = useTransactions();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        <BalanceCard
          balance={balance}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
        />
        
        <section>
          <h2 className="text-lg font-semibold mb-4 text-foreground">
            সাম্প্রতিক লেনদেন
          </h2>
          <TransactionList
            transactions={transactions}
            onDelete={deleteTransaction}
            isLoading={isLoading}
          />
        </section>
      </main>

      <FloatingActions
        onOpenManual={() => setShowManualForm(true)}
        onOpenAI={() => setShowAIChat(true)}
      />

      <AnimatePresence>
        {showManualForm && (
          <ManualEntryForm
            onSubmit={addTransaction}
            onClose={() => setShowManualForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAIChat && (
          <AIChatbot
            onAddTransaction={addTransaction}
            onClose={() => setShowAIChat(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
