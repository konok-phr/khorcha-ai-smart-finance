import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, Download, Mail, Calendar, TrendingUp, TrendingDown,
  PieChart, BarChart3, ChevronDown
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types/transaction';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, isWithinInterval } from 'date-fns';
import { bn } from 'date-fns/locale';
import { toast } from 'sonner';

interface ReportsViewProps {
  transactions: Transaction[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
};

const getCategoryLabel = (type: 'income' | 'expense', categoryId: string) => {
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const cat = categories.find(c => c.id === categoryId);
  return cat ? `${cat.icon} ${cat.label}` : categoryId;
};

const generateMonthOptions = () => {
  const options = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const date = subMonths(now, i);
    options.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: bn }),
    });
  }
  return options;
};

const generateYearOptions = () => {
  const options = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 5; i++) {
    const year = currentYear - i;
    options.push({
      value: year.toString(),
      label: `${year}`,
    });
  }
  return options;
};

export const ReportsView = ({ transactions }: ReportsViewProps) => {
  const [reportType, setReportType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  const monthOptions = generateMonthOptions();
  const yearOptions = generateYearOptions();

  // Filter transactions based on selection
  const filteredTransactions = useMemo(() => {
    let start: Date, end: Date;

    if (reportType === 'monthly') {
      const [year, month] = selectedMonth.split('-').map(Number);
      const date = new Date(year, month - 1, 1);
      start = startOfMonth(date);
      end = endOfMonth(date);
    } else {
      const year = parseInt(selectedYear);
      start = startOfYear(new Date(year, 0, 1));
      end = endOfYear(new Date(year, 0, 1));
    }

    return transactions.filter(t => {
      const txDate = new Date(t.transaction_date);
      return isWithinInterval(txDate, { start, end });
    });
  }, [transactions, reportType, selectedMonth, selectedYear]);

  // Calculate summary
  const summary = useMemo(() => {
    const income = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const categoryBreakdown: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
      });

    const incomeBreakdown: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        incomeBreakdown[t.category] = (incomeBreakdown[t.category] || 0) + Number(t.amount);
      });

    return {
      income,
      expense,
      balance: income - expense,
      count: filteredTransactions.length,
      categoryBreakdown: Object.entries(categoryBreakdown)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount),
      incomeBreakdown: Object.entries(incomeBreakdown)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount),
    };
  }, [filteredTransactions]);

  const generatePDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      
      const doc = new jsPDF();
      const periodLabel = reportType === 'monthly' 
        ? monthOptions.find(m => m.value === selectedMonth)?.label 
        : selectedYear;

      // Title
      doc.setFontSize(20);
      doc.text('Financial Report', 105, 20, { align: 'center' });
      doc.setFontSize(14);
      doc.text(`Period: ${periodLabel}`, 105, 30, { align: 'center' });

      // Summary
      doc.setFontSize(12);
      let yPos = 45;
      doc.text('Summary', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.text(`Total Income: BDT ${summary.income.toLocaleString()}`, 14, yPos);
      yPos += 7;
      doc.text(`Total Expense: BDT ${summary.expense.toLocaleString()}`, 14, yPos);
      yPos += 7;
      doc.text(`Net Balance: BDT ${summary.balance.toLocaleString()}`, 14, yPos);
      yPos += 7;
      doc.text(`Total Transactions: ${summary.count}`, 14, yPos);
      yPos += 15;

      // Expense by Category
      if (summary.categoryBreakdown.length > 0) {
        doc.setFontSize(12);
        doc.text('Expense by Category', 14, yPos);
        yPos += 5;

        autoTable(doc, {
          startY: yPos,
          head: [['Category', 'Amount (BDT)', 'Percentage']],
          body: summary.categoryBreakdown.map(item => [
            item.category,
            item.amount.toLocaleString(),
            `${((item.amount / summary.expense) * 100).toFixed(1)}%`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Income by Category
      if (summary.incomeBreakdown.length > 0) {
        doc.setFontSize(12);
        doc.text('Income by Category', 14, yPos);
        yPos += 5;

        autoTable(doc, {
          startY: yPos,
          head: [['Category', 'Amount (BDT)', 'Percentage']],
          body: summary.incomeBreakdown.map(item => [
            item.category,
            item.amount.toLocaleString(),
            `${((item.amount / summary.income) * 100).toFixed(1)}%`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129] },
        });

        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Recent Transactions
      if (filteredTransactions.length > 0) {
        doc.addPage();
        doc.setFontSize(12);
        doc.text('Transaction Details', 14, 20);

        autoTable(doc, {
          startY: 25,
          head: [['Date', 'Type', 'Category', 'Description', 'Amount (BDT)']],
          body: filteredTransactions.slice(0, 50).map(t => [
            format(new Date(t.transaction_date), 'dd/MM/yyyy'),
            t.type === 'income' ? 'Income' : 'Expense',
            t.category,
            t.description,
            `${t.type === 'expense' ? '-' : '+'}${Number(t.amount).toLocaleString()}`
          ]),
          theme: 'striped',
          headStyles: { fillColor: [59, 130, 246] },
        });
      }

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Generated on ${format(new Date(), 'dd MMM yyyy, hh:mm a')} | Page ${i} of ${pageCount}`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save(`financial-report-${periodLabel?.replace(/\s/g, '-')}.pdf`);
      toast.success('PDF ডাউনলোড হয়েছে!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('PDF তৈরি করতে সমস্যা হয়েছে');
    }
  };

  const shareViaEmail = () => {
    const periodLabel = reportType === 'monthly' 
      ? monthOptions.find(m => m.value === selectedMonth)?.label 
      : selectedYear;

    const subject = encodeURIComponent(`আর্থিক রিপোর্ট - ${periodLabel}`);
    const body = encodeURIComponent(`
আর্থিক রিপোর্ট - ${periodLabel}

সারসংক্ষেপ:
-----------
মোট আয়: ${formatCurrency(summary.income)}
মোট খরচ: ${formatCurrency(summary.expense)}
নেট ব্যালেন্স: ${formatCurrency(summary.balance)}
মোট লেনদেন: ${summary.count}টি

খরচ বিশ্লেষণ:
${summary.categoryBreakdown.map(item => 
  `- ${getCategoryLabel('expense', item.category)}: ${formatCurrency(item.amount)} (${((item.amount / summary.expense) * 100).toFixed(1)}%)`
).join('\n')}

আয় বিশ্লেষণ:
${summary.incomeBreakdown.map(item => 
  `- ${getCategoryLabel('income', item.category)}: ${formatCurrency(item.amount)} (${((item.amount / summary.income) * 100).toFixed(1)}%)`
).join('\n')}
    `);

    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    toast.success('ইমেইল অ্যাপ খোলা হচ্ছে...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            আর্থিক রিপোর্ট
          </h2>
          <p className="text-sm text-muted-foreground">
            বিস্তারিত বিশ্লেষণ ও রিপোর্ট
          </p>
        </div>
      </div>

      {/* Report Type & Period Selection */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={reportType} onValueChange={(v) => setReportType(v as any)}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">মাসিক</SelectItem>
              <SelectItem value="yearly">বার্ষিক</SelectItem>
            </SelectContent>
          </Select>

          {reportType === 'monthly' ? (
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <div className="flex gap-2 ml-auto">
            <Button onClick={generatePDF} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button onClick={shareViaEmail} variant="outline" size="sm">
              <Mail className="w-4 h-4 mr-2" />
              শেয়ার
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-income" />
            <span className="text-sm text-muted-foreground">মোট আয়</span>
          </div>
          <p className="text-xl font-bold text-income">{formatCurrency(summary.income)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-expense" />
            <span className="text-sm text-muted-foreground">মোট খরচ</span>
          </div>
          <p className="text-xl font-bold text-expense">{formatCurrency(summary.expense)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">নেট ব্যালেন্স</span>
          </div>
          <p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-income' : 'text-expense'}`}>
            {formatCurrency(summary.balance)}
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">লেনদেন</span>
          </div>
          <p className="text-xl font-bold">{summary.count}টি</p>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Expense Categories */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-expense" />
            খরচ বিশ্লেষণ
          </h3>
          {summary.categoryBreakdown.length > 0 ? (
            <div className="space-y-3">
              {summary.categoryBreakdown.map((item, idx) => {
                const percentage = (item.amount / summary.expense) * 100;
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{getCategoryLabel('expense', item.category)}</span>
                      <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-expense rounded-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">এই সময়ে কোনো খরচ নেই</p>
          )}
        </Card>

        {/* Income Categories */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-income" />
            আয় বিশ্লেষণ
          </h3>
          {summary.incomeBreakdown.length > 0 ? (
            <div className="space-y-3">
              {summary.incomeBreakdown.map((item, idx) => {
                const percentage = (item.amount / summary.income) * 100;
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{getCategoryLabel('income', item.category)}</span>
                      <span className="text-sm font-medium">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="h-full bg-income rounded-full"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}%</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">এই সময়ে কোনো আয় নেই</p>
          )}
        </Card>
      </div>

      {/* Empty State */}
      {summary.count === 0 && (
        <Card className="p-8 text-center">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-lg font-medium mb-2">এই সময়ে কোনো লেনদেন নেই</h3>
          <p className="text-muted-foreground">
            রিপোর্ট দেখতে অন্য সময়কাল নির্বাচন করুন
          </p>
        </Card>
      )}
    </div>
  );
};
