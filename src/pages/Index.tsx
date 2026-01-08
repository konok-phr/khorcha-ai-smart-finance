import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionList } from '@/components/TransactionList';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { AIChatbot } from '@/components/AIChatbot';
import { FloatingActions } from '@/components/FloatingActions';
import { BottomNav } from '@/components/BottomNav';
import { StatsView } from '@/components/StatsView';
import { AccountsView } from '@/components/AccountsView';
import { SettingsView } from '@/components/SettingsView';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
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

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
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
          </>
        );
      case 'stats':
        return <StatsView transactions={transactions} />;
      case 'accounts':
        return <AccountsView />;
      case 'settings':
        return <SettingsView transactions={transactions} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6 max-w-lg">
        {renderContent()}
      </main>

      {activeTab === 'home' && (
        <FloatingActions
          onOpenManual={() => setShowManualForm(true)}
          onOpenAI={() => setShowAIChat(true)}
        />
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

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
