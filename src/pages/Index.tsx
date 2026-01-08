import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { BalanceCard } from '@/components/BalanceCard';
import { TransactionList } from '@/components/TransactionList';
import { ManualEntryForm } from '@/components/ManualEntryForm';
import { AIChatbot } from '@/components/AIChatbot';
import { VoiceCallDialer } from '@/components/VoiceCallDialer';
import { FloatingActions } from '@/components/FloatingActions';
import { BottomNav } from '@/components/BottomNav';
import { StatsView } from '@/components/StatsView';
import { AccountsView } from '@/components/AccountsView';
import { LoansView } from '@/components/LoansView';
import { SettingsView } from '@/components/SettingsView';
import { useTransactions } from '@/hooks/useTransactions';
import { useAccounts } from '@/hooks/useAccounts';
import { useBudgetAlerts } from '@/hooks/useBudgetAlerts';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Index = () => {
  const [showManualForm, setShowManualForm] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
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

  const {
    accounts,
    addToBalance,
    deductFromBalance,
    getDefaultAccount,
  } = useAccounts();

  // Budget alerts
  useBudgetAlerts({ transactions, enabled: true });

  const handleAddTransaction = useCallback(async (transaction: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    description: string;
    transaction_date?: string;
    account_id?: string;
  }) => {
    // If no account specified, use default
    let accountId = transaction.account_id;
    if (!accountId) {
      const defaultAccount = getDefaultAccount();
      if (defaultAccount) {
        accountId = defaultAccount.id;
      }
    }

    const result = await addTransaction({
      ...transaction,
      account_id: accountId,
    } as any);

    // Update account balance
    if (result && accountId) {
      if (transaction.type === 'income') {
        await addToBalance(accountId, transaction.amount);
      } else {
        await deductFromBalance(accountId, transaction.amount);
      }
    }

    return result;
  }, [addTransaction, addToBalance, deductFromBalance, getDefaultAccount]);

  const handleUpdateAccountBalance = useCallback(async (accountId: string, amount: number, isAddition: boolean) => {
    if (isAddition) {
      return await addToBalance(accountId, amount);
    } else {
      return await deductFromBalance(accountId, amount);
    }
  }, [addToBalance, deductFromBalance]);

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
      case 'loans':
        return <LoansView />;
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
          onOpenCall={() => setShowVoiceCall(true)}
        />
      )}

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      <AnimatePresence>
        {showManualForm && (
          <ManualEntryForm
            onSubmit={handleAddTransaction}
            onClose={() => setShowManualForm(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAIChat && (
          <AIChatbot
            onAddTransaction={handleAddTransaction}
            onClose={() => setShowAIChat(false)}
            accounts={accounts}
            onUpdateAccountBalance={handleUpdateAccountBalance}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoiceCall && (
          <VoiceCallDialer
            onAddTransaction={handleAddTransaction}
            onClose={() => setShowVoiceCall(false)}
            accounts={accounts}
            onUpdateAccountBalance={handleUpdateAccountBalance}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
