import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Check,
  Trash2,
  User,
  Calendar,
  FileText,
  X,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLoans, Loan } from '@/hooks/useLoans';

type LoanDirection = 'borrowed' | 'lent';

export const LoansView = () => {
  const { loans, isLoading, addLoan, markAsPaid, deleteLoan, totalBorrowed, totalLent } =
    useLoans();

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    person_name: '',
    amount: '',
    direction: 'borrowed' as LoanDirection,
    loan_date: new Date().toISOString().split('T')[0],
    due_date: '',
    note: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person_name || !formData.amount) return;

    await addLoan({
      person_name: formData.person_name,
      amount: parseFloat(formData.amount),
      direction: formData.direction,
      loan_date: formData.loan_date,
      due_date: formData.due_date || undefined,
      note: formData.note || undefined,
    });

    setFormData({
      person_name: '',
      amount: '',
      direction: 'borrowed',
      loan_date: new Date().toISOString().split('T')[0],
      due_date: '',
      note: '',
    });
    setShowForm(false);
  };

  const pendingLoans = loans.filter((l) => l.status === 'pending');
  const paidLoans = loans.filter((l) => l.status === 'paid');

  const LoanCard = ({ loan }: { loan: Loan }) => {
    const isBorrowed = loan.direction === 'borrowed';

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isBorrowed ? 'bg-expense/10' : 'bg-income/10'
              }`}
            >
              {isBorrowed ? (
                <ArrowDownLeft className="w-5 h-5 text-expense" />
              ) : (
                <ArrowUpRight className="w-5 h-5 text-income" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{loan.person_name}</p>
                {loan.status === 'paid' && (
                  <span className="text-xs bg-income/20 text-income px-2 py-0.5 rounded-full">
                    পরিশোধিত
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isBorrowed ? 'ধার নিয়েছি' : 'ধার দিয়েছি'}
              </p>
              {loan.note && <p className="text-xs text-muted-foreground mt-1">{loan.note}</p>}
              <p className="text-xs text-muted-foreground mt-1">
                📅 {new Date(loan.loan_date).toLocaleDateString('bn-BD')}
                {loan.due_date && ` • ⏰ ${new Date(loan.due_date).toLocaleDateString('bn-BD')}`}
              </p>
            </div>

            <div className="text-right">
              <p className={`font-semibold ${isBorrowed ? 'text-expense' : 'text-income'}`}>
                ৳{Number(loan.amount).toLocaleString('bn-BD')}
              </p>

              {loan.status === 'pending' && (
                <div className="flex gap-1 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-income hover:bg-income/10"
                    onClick={() => markAsPaid(loan.id)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-expense hover:bg-expense/10"
                    onClick={() => deleteLoan(loan.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-expense/10 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5 text-expense" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ধার নিয়েছি</p>
              <p className="text-lg font-bold text-expense">
                ৳{totalBorrowed.toLocaleString('bn-BD')}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4 shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-income/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-income" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">ধার দিয়েছি</p>
              <p className="text-lg font-bold text-income">৳{totalLent.toLocaleString('bn-BD')}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Button */}
      <Button onClick={() => setShowForm(true)} className="w-full gap-2 gradient-primary">
        <Plus className="w-4 h-4" />
        নতুন ধার যোগ করুন
      </Button>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="w-full max-w-md p-6 shadow-float">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">নতুন ধার</h3>
                  <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}>
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Direction */}
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant={formData.direction === 'borrowed' ? 'default' : 'outline'}
                      className={
                        formData.direction === 'borrowed' ? 'bg-expense hover:bg-expense/90' : ''
                      }
                      onClick={() => setFormData((p) => ({ ...p, direction: 'borrowed' }))}
                    >
                      <ArrowDownLeft className="w-4 h-4 mr-2" />
                      ধার নিয়েছি
                    </Button>
                    <Button
                      type="button"
                      variant={formData.direction === 'lent' ? 'default' : 'outline'}
                      className={
                        formData.direction === 'lent' ? 'bg-income hover:bg-income/90' : ''
                      }
                      onClick={() => setFormData((p) => ({ ...p, direction: 'lent' }))}
                    >
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      ধার দিয়েছি
                    </Button>
                  </div>

                  {/* Person Name */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {formData.direction === 'borrowed' ? 'কার কাছ থেকে' : 'কাকে দিয়েছি'}
                    </Label>
                    <Input
                      placeholder="নাম লিখুন"
                      value={formData.person_name}
                      onChange={(e) => setFormData((p) => ({ ...p, person_name: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <Label>পরিমাণ (টাকা)</Label>
                    <Input
                      type="number"
                      placeholder="০"
                      value={formData.amount}
                      onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                      required
                    />
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        তারিখ
                      </Label>
                      <Input
                        type="date"
                        value={formData.loan_date}
                        onChange={(e) => setFormData((p) => ({ ...p, loan_date: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ফেরতের তারিখ</Label>
                      <Input
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData((p) => ({ ...p, due_date: e.target.value }))}
                      />
                    </div>
                  </div>

                  {/* Note */}
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      নোট (ঐচ্ছিক)
                    </Label>
                    <Textarea
                      placeholder="কোনো নোট থাকলে লিখুন..."
                      value={formData.note}
                      onChange={(e) => setFormData((p) => ({ ...p, note: e.target.value }))}
                      rows={2}
                    />
                  </div>

                  <Button type="submit" className="w-full gradient-primary">
                    সংরক্ষণ করুন
                  </Button>
                </form>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending Loans */}
      {pendingLoans.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">বাকি ধার ({pendingLoans.length})</h3>
          {pendingLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}

      {/* Paid Loans */}
      {paidLoans.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-muted-foreground">পরিশোধিত ({paidLoans.length})</h3>
          {paidLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && loans.length === 0 && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">কোনো ধার নেই</p>
          <p className="text-sm text-muted-foreground mt-1">উপরে বাটনে ক্লিক করে যোগ করুন</p>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-secondary rounded w-1/3" />
                  <div className="h-3 bg-secondary rounded w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
