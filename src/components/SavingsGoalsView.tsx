import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Plus, Trash2, TrendingUp, Calendar, 
  PiggyBank, ChevronRight, X, Check
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSavingsGoals, SavingsGoal } from '@/hooks/useSavingsGoals';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Intl.DateTimeFormat('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
};

const goalIcons = ['🎯', '🏠', '🚗', '✈️', '💍', '📱', '💰', '🎓', '🏥', '🎁'];
const goalColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4'];

export const SavingsGoalsView = () => {
  const { goals, isLoading, addGoal, updateGoalAmount, deleteGoal } = useSavingsGoals();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDepositDialog, setShowDepositDialog] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Form state
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    icon: '🎯',
    color: '#10B981',
  });

  const handleAddGoal = async () => {
    if (!newGoal.name || !newGoal.target_amount) return;

    await addGoal({
      name: newGoal.name,
      target_amount: parseFloat(newGoal.target_amount),
      target_date: newGoal.target_date || null,
      icon: newGoal.icon,
      color: newGoal.color,
    });

    setNewGoal({ name: '', target_amount: '', target_date: '', icon: '🎯', color: '#10B981' });
    setShowAddForm(false);
  };

  const handleDeposit = async () => {
    if (!showDepositDialog || !depositAmount) return;
    await updateGoalAmount(showDepositDialog.id, parseFloat(depositAmount));
    setDepositAmount('');
    setShowDepositDialog(null);
  };

  const activeGoals = goals.filter(g => !g.is_completed);
  const completedGoals = goals.filter(g => g.is_completed);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            সেভিংস গোল
          </h2>
          <p className="text-sm text-muted-foreground">
            আপনার আর্থিক লক্ষ্য অর্জন করুন
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          নতুন লক্ষ্য
        </Button>
      </div>

      {/* Summary Card */}
      {goals.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{activeGoals.length}</p>
              <p className="text-xs text-muted-foreground">চলমান</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-500">{completedGoals.length}</p>
              <p className="text-xs text-muted-foreground">সম্পন্ন</p>
            </div>
            <div>
              <p className="text-lg font-bold">
                {formatCurrency(goals.reduce((sum, g) => sum + g.current_amount, 0))}
              </p>
              <p className="text-xs text-muted-foreground">মোট জমা</p>
            </div>
          </div>
        </Card>
      )}

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-muted-foreground">চলমান লক্ষ্য</h3>
          {activeGoals.map((goal) => {
            const progress = (goal.current_amount / goal.target_amount) * 100;
            const remaining = goal.target_amount - goal.current_amount;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      {goal.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold truncate">{goal.name}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Progress value={progress} className="h-2 mb-2" />
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                        </span>
                        <span className="font-medium" style={{ color: goal.color }}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>

                      {goal.target_date && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          লক্ষ্য তারিখ: {formatDate(goal.target_date)}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          onClick={() => setShowDepositDialog(goal)}
                          className="flex-1"
                          style={{ backgroundColor: goal.color }}
                        >
                          <PiggyBank className="w-4 h-4 mr-1" />
                          জমা করুন
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          বাকি: {formatCurrency(remaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-muted-foreground flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            সম্পন্ন লক্ষ্য
          </h3>
          {completedGoals.map((goal) => (
            <Card key={goal.id} className="p-4 opacity-75 border-green-500/30 bg-green-500/5">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${goal.color}20` }}
                >
                  {goal.icon}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{goal.name}</h4>
                  <p className="text-sm text-green-600">
                    ✓ {formatCurrency(goal.target_amount)} অর্জিত!
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteGoal(goal.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="p-8 text-center">
          <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">কোনো সেভিংস গোল নেই</h3>
          <p className="text-muted-foreground mb-4">
            আপনার আর্থিক লক্ষ্য নির্ধারণ করুন এবং সেভিংস ট্র্যাক করুন
          </p>
          <Button onClick={() => setShowAddForm(true)} className="gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            প্রথম লক্ষ্য তৈরি করুন
          </Button>
        </Card>
      )}

      {/* Add Goal Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">নতুন সেভিংস গোল</h3>
                <Button variant="ghost" size="icon" onClick={() => setShowAddForm(false)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">লক্ষ্যের নাম</label>
                  <Input
                    value={newGoal.name}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="যেমন: জরুরি তহবিল, বিদেশ ভ্রমণ"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">লক্ষ্য পরিমাণ (৳)</label>
                  <Input
                    type="number"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_amount: e.target.value }))}
                    placeholder="50000"
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">লক্ষ্য তারিখ (ঐচ্ছিক)</label>
                  <Input
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">আইকন</label>
                  <div className="flex flex-wrap gap-2">
                    {goalIcons.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setNewGoal(prev => ({ ...prev, icon }))}
                        className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                          newGoal.icon === icon ? 'bg-primary/20 ring-2 ring-primary' : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">রং</label>
                  <div className="flex gap-2">
                    {goalColors.map(color => (
                      <button
                        key={color}
                        onClick={() => setNewGoal(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full transition-all ${
                          newGoal.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleAddGoal} 
                  className="w-full gradient-primary"
                  disabled={!newGoal.name || !newGoal.target_amount}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  লক্ষ্য তৈরি করুন
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deposit Dialog */}
      <Dialog open={!!showDepositDialog} onOpenChange={() => setShowDepositDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PiggyBank className="w-5 h-5" />
              {showDepositDialog?.name} - জমা করুন
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm text-muted-foreground">জমার পরিমাণ (৳)</label>
              <Input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="1000"
                autoFocus
              />
            </div>
            {showDepositDialog && (
              <p className="text-sm text-muted-foreground">
                বর্তমান: {formatCurrency(showDepositDialog.current_amount)} / 
                লক্ষ্য: {formatCurrency(showDepositDialog.target_amount)}
              </p>
            )}
            <Button 
              onClick={handleDeposit} 
              className="w-full"
              disabled={!depositAmount}
            >
              জমা করুন
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
