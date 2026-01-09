import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Palette } from 'lucide-react';
import { Card } from '@/components/ui/card';

type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'khorcha-theme';

export const ThemeSection = () => {
  const [theme, setTheme] = useState<ThemeMode>('system');

  // Get system preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  // Apply theme to document
  const applyTheme = (themeMode: ThemeMode) => {
    const root = document.documentElement;
    const actualTheme = themeMode === 'system' ? getSystemTheme() : themeMode;
    
    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  // Load theme on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (saved) {
      setTheme(saved);
      applyTheme(saved);
    } else {
      applyTheme('system');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(newTheme);
  };

  const themeOptions = [
    {
      id: 'light' as const,
      icon: Sun,
      label: 'লাইট',
      description: 'সবসময় উজ্জ্বল থিম',
    },
    {
      id: 'dark' as const,
      icon: Moon,
      label: 'ডার্ক',
      description: 'সবসময় অন্ধকার থিম',
    },
    {
      id: 'system' as const,
      icon: Monitor,
      label: 'সিস্টেম',
      description: 'ডিভাইস সেটিং অনুসরণ',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
          <Palette className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">থিম সেটিংস</h2>
          <p className="text-sm text-muted-foreground">অ্যাপের রং কাস্টমাইজ করুন</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {themeOptions.map((option, index) => {
          const Icon = option.icon;
          const isActive = theme === option.id;
          
          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`p-4 cursor-pointer transition-all text-center ${
                  isActive
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => handleThemeChange(option.id)}
              >
                <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <p className={`font-medium text-sm ${isActive ? 'text-primary' : ''}`}>
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {option.description}
                </p>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <Card className="p-4 mt-6 bg-muted/30">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Monitor className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">সিস্টেম থিম সম্পর্কে</p>
            <p className="text-xs text-muted-foreground mt-1">
              "সিস্টেম" নির্বাচন করলে আপনার ফোন বা কম্পিউটারের থিম অনুসরণ করবে। 
              রাতে অটোমেটিক ডার্ক মোড চালু হবে।
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
