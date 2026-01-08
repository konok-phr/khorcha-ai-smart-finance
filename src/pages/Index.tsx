import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionList } from '@/components/TransactionList';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { AIChatbot } from '@/components/AIChatbot';
import { FloatingActions } from '@/components/FloatingActions';
import { useTransactions } from '@/hooks/useTransactions';

const Index = () => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  
  const {
    transactions,
    addTransaction,
    deleteTransaction,
    totalIncome,
    totalExpense,
    balance,
  } = useTransactions();

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
