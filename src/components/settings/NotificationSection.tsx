import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, BellRing, AlertTriangle, Calendar, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface NotificationPreferences {
  budgetAlerts: boolean;
  budgetWarningThreshold: boolean;
  recurringReminders: boolean;
  dailyReminders: boolean;
}

const STORAGE_KEY = 'khorcha-notification-preferences';

export const NotificationSection = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    budgetAlerts: true,
    budgetWarningThreshold: true,
    recurringReminders: true,
    dailyReminders: false,
  });

  // Load preferences from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse notification preferences');
      }
    }
  }, []);

  // Save preferences to localStorage
  const updatePreference = (key: keyof NotificationPreferences, value: boolean) => {
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const notificationItems = [
    {
      id: 'budgetAlerts' as const,
      icon: AlertTriangle,
      label: 'বাজেট অতিক্রম সতর্কতা',
      description: 'বাজেট ১০০% ছাড়িয়ে গেলে নোটিফিকেশন পাবেন',
      color: 'text-expense',
    },
    {
      id: 'budgetWarningThreshold' as const,
      icon: Wallet,
      label: 'বাজেট সীমা সতর্কতা',
      description: 'বাজেট ৮০% হলে আগাম সতর্কতা পাবেন',
      color: 'text-warning',
    },
    {
      id: 'recurringReminders' as const,
      icon: Calendar,
      label: 'রিকারিং লেনদেন রিমাইন্ডার',
      description: 'আসন্ন বিল ও সাবস্ক্রিপশনের রিমাইন্ডার',
      color: 'text-primary',
    },
    {
      id: 'dailyReminders' as const,
      icon: BellRing,
      label: 'দৈনিক রিমাইন্ডার',
      description: 'প্রতিদিন খরচ লিখতে মনে করিয়ে দিবে',
      color: 'text-income',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
          <Bell className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">নোটিফিকেশন সেটিংস</h2>
          <p className="text-sm text-muted-foreground">সতর্কতা ও রিমাইন্ডার নিয়ন্ত্রণ</p>
        </div>
      </div>

      <Card className="p-4 shadow-card">
        <div className="space-y-4">
          {notificationItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor={item.id} className="font-medium cursor-pointer">
                        {item.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={item.id}
                    checked={preferences[item.id]}
                    onCheckedChange={(checked) => updatePreference(item.id, checked)}
                  />
                </div>
                {index < notificationItems.length - 1 && <Separator className="mt-3" />}
              </motion.div>
            );
          })}
        </div>
      </Card>

      <p className="text-xs text-muted-foreground text-center mt-4">
        💡 এই সেটিংস শুধুমাত্র অ্যাপের মধ্যে কাজ করে
      </p>
    </div>
  );
};
