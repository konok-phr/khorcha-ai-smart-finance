import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Transaction } from '@/hooks/useTransactions';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { bn } from 'date-fns/locale';
import { toast } from 'sonner';

interface ExportViewProps {
  transactions: Transaction[];
}

export const ExportView = ({ transactions }: ExportViewProps) => {
  const [selectedMonth, setSelectedMonth] = useState('0');
  const [isExporting, setIsExporting] = useState(false);

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: i.toString(),
      label: format(date, 'MMMM yyyy', { locale: bn }),
      start: startOfMonth(date),
      end: endOfMonth(date),
    };
  });

  const getFilteredTransactions = () => {
    const monthData = months[parseInt(selectedMonth)];
    return transactions.filter(t => {
      const date = new Date(t.transaction_date);
      return date >= monthData.start && date <= monthData.end;
    });
  };

  const exportToCSV = () => {
    setIsExporting(true);
    const filtered = getFilteredTransactions();
    
    if (filtered.length === 0) {
      toast.error('এই মাসে কোনো লেনদেন নেই');
      setIsExporting(false);
      return;
    }

    const headers = ['তারিখ', 'ধরন', 'ক্যাটাগরি', 'বিবরণ', 'পরিমাণ'];
    const rows = filtered.map(t => [
      format(new Date(t.transaction_date), 'dd/MM/yyyy'),
      t.type === 'income' ? 'আয়' : 'খরচ',
      t.category,
      t.description,
      t.amount.toString(),
    ]);

    const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    
    rows.push(['', '', '', '', '']);
    rows.push(['', '', '', 'মোট আয়', totalIncome.toString()]);
    rows.push(['', '', '', 'মোট খরচ', totalExpense.toString()]);
    rows.push(['', '', '', 'ব্যালেন্স', (totalIncome - totalExpense).toString()]);

    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `khorcha-report-${format(months[parseInt(selectedMonth)].start, 'yyyy-MM')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('CSV ফাইল ডাউনলোড হয়েছে!');
    setIsExporting(false);
  };

  const exportToText = () => {
    setIsExporting(true);
    const filtered = getFilteredTransactions();
    const monthData = months[parseInt(selectedMonth)];
    
    if (filtered.length === 0) {
      toast.error('এই মাসে কোনো লেনদেন নেই');
      setIsExporting(false);
      return;
    }

    const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const totalExpense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

    let content = `
═══════════════════════════════════════════════════════
                    খরচা AI রিপোর্ট
                ${format(monthData.start, 'MMMM yyyy', { locale: bn })}
═══════════════════════════════════════════════════════

📊 সামগ্রিক সারাংশ
───────────────────────────────────────────────────────
   মোট আয়:     ৳${totalIncome.toLocaleString('bn-BD')}
   মোট খরচ:    ৳${totalExpense.toLocaleString('bn-BD')}
   ব্যালেন্স:   ৳${(totalIncome - totalExpense).toLocaleString('bn-BD')}
   লেনদেন:     ${filtered.length}টি
───────────────────────────────────────────────────────

📝 বিস্তারিত লেনদেন
───────────────────────────────────────────────────────
`;

    // Group by date
    const byDate = filtered.reduce((acc, t) => {
      const date = t.transaction_date;
      if (!acc[date]) acc[date] = [];
      acc[date].push(t);
      return acc;
    }, {} as Record<string, Transaction[]>);

    Object.entries(byDate)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .forEach(([date, txns]) => {
        content += `\n📅 ${format(new Date(date), 'd MMMM yyyy', { locale: bn })}\n`;
        txns.forEach(t => {
          const sign = t.type === 'income' ? '+' : '-';
          const icon = t.type === 'income' ? '💰' : '💸';
          content += `   ${icon} ${t.description} (${t.category}) ${sign}৳${Number(t.amount).toLocaleString('bn-BD')}\n`;
        });
      });

    content += `
───────────────────────────────────────────────────────
                  Powered by খরচা AI
═══════════════════════════════════════════════════════
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `khorcha-report-${format(monthData.start, 'yyyy-MM')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('রিপোর্ট ডাউনলোড হয়েছে!');
    setIsExporting(false);
  };

  const filtered = getFilteredTransactions();
  const totalIncome = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpense = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">রিপোর্ট এক্সপোর্ট</h3>
      </div>

      <Card className="p-4 shadow-card space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            মাস নির্বাচন করুন
          </Label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filtered.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-secondary/50 rounded-xl space-y-2"
          >
            <p className="text-sm font-medium text-foreground">প্রিভিউ:</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div>
                <p className="text-muted-foreground">লেনদেন</p>
                <p className="font-semibold">{filtered.length}টি</p>
              </div>
              <div>
                <p className="text-muted-foreground">আয়</p>
                <p className="font-semibold text-income">৳{totalIncome.toLocaleString('bn-BD')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">খরচ</p>
                <p className="font-semibold text-expense">৳{totalExpense.toLocaleString('bn-BD')}</p>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={exportToCSV}
            disabled={isExporting || filtered.length === 0}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </Button>
          <Button
            variant="outline"
            onClick={exportToText}
            disabled={isExporting || filtered.length === 0}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            TXT রিপোর্ট
          </Button>
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground">
            এই মাসে কোনো লেনদেন নেই
          </p>
        )}
      </Card>
    </div>
  );
};
