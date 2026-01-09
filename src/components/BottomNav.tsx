import { useState } from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart3, Wallet, HandCoins, CreditCard, Settings, Menu, RefreshCw, History, FileText, Target, LineChart, X } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Main tabs shown in bottom nav
const mainNavItems = [
  { id: 'home', label: 'হোম', icon: Home },
  { id: 'stats', label: 'স্ট্যাটস', icon: BarChart3 },
];

// Secondary tabs shown in sidebar menu
const sidebarNavItems = [
  { id: 'reports', label: 'আর্থিক রিপোর্ট', icon: FileText, description: 'PDF এক্সপোর্ট ও বিশ্লেষণ' },
  { id: 'goals', label: 'সেভিংস গোল', icon: Target, description: 'সঞ্চয় লক্ষ্য ট্র্যাকার' },
  { id: 'investments', label: 'বিনিয়োগ ট্র্যাকার', icon: LineChart, description: 'স্টক, ফান্ড ও সোনা' },
  { id: 'recurring', label: 'রিকারিং লেনদেন', icon: RefreshCw, description: 'মাসিক বিল ও সাবস্ক্রিপশন' },
  { id: 'credit-cards', label: 'ক্রেডিট কার্ড', icon: CreditCard, description: 'কার্ড ম্যানেজমেন্ট' },
  { id: 'loans', label: 'ধার/ঋণ', icon: HandCoins, description: 'ধার দেওয়া ও নেওয়া' },
  { id: 'accounts', label: 'অ্যাকাউন্ট', icon: Wallet, description: 'ব্যাংক ও ওয়ালেট' },
  { id: 'settings', label: 'সেটিংস', icon: Settings, description: 'অ্যাপ কাস্টমাইজেশন' },
];

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  
  // Check if current tab is in sidebar menu
  const isSidebarTabActive = sidebarNavItems.some(item => item.id === activeTab);
  
  const handleSidebarItemClick = (tabId: string) => {
    onTabChange(tabId);
    setIsSidebarOpen(false);
  };

  const handleHistoryClick = () => {
    setIsSidebarOpen(false);
    navigate('/history');
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {/* Menu Button - Left Side */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center gap-1 px-6 py-2 relative"
          >
            {isSidebarTabActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary/10 rounded-xl"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <Menu className={`w-5 h-5 relative z-10 transition-colors ${
              isSidebarTabActive ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className={`text-xs relative z-10 transition-colors ${
              isSidebarTabActive ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>
              মেনু
            </span>
          </button>

          {mainNavItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className="flex flex-col items-center gap-1 px-6 py-2 relative"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', duration: 0.5 }}
                  />
                )}
                <Icon className={`w-5 h-5 relative z-10 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`} />
                <span className={`text-xs relative z-10 transition-colors ${
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Left Sidebar Sheet - Custom close button */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-[280px] p-0 [&>button]:hidden">
          <div className="flex flex-col h-full">
            {/* Header with Close Button */}
            <div className="p-6 gradient-primary relative">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="absolute right-4 top-4 p-2 rounded-full bg-primary-foreground/20 hover:bg-primary-foreground/30 transition-colors"
              >
                <X className="w-4 h-4 text-primary-foreground" />
              </button>
              <div>
                <h2 className="text-xl font-bold text-primary-foreground">Khorcha AI</h2>
                <p className="text-sm text-primary-foreground/80 mt-1">স্মার্ট মানি ম্যানেজার</p>
              </div>
            </div>
            
            {/* Navigation Items */}
            <div className="flex-1 py-4 px-3 overflow-y-auto">
              <p className="text-xs font-medium text-muted-foreground px-3 mb-2">নেভিগেশন</p>
              <div className="space-y-1">
                {sidebarNavItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSidebarItemClick(item.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                        isActive 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                          {item.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* History Link */}
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-xs font-medium text-muted-foreground px-3 mb-2">আরো</p>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleHistoryClick}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left hover:bg-muted/50"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-secondary">
                    <History className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">সম্পূর্ণ ইতিহাস</p>
                    <p className="text-xs text-muted-foreground truncate">
                      সব লেনদেন দেখুন
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Khorcha AI v1.0.0
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
