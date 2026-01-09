import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BarChart3, Wallet, HandCoins, CreditCard, Settings, MoreHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Main tabs shown in bottom nav
const mainNavItems = [
  { id: 'home', label: 'হোম', icon: Home },
  { id: 'stats', label: 'রিপোর্ট', icon: BarChart3 },
];

// Secondary tabs shown in "More" menu
const moreNavItems = [
  { id: 'credit-cards', label: 'ক্রেডিট কার্ড', icon: CreditCard },
  { id: 'loans', label: 'ধার/ঋণ', icon: HandCoins },
  { id: 'accounts', label: 'অ্যাকাউন্ট', icon: Wallet },
  { id: 'settings', label: 'সেটিংস', icon: Settings },
];

// All items for checking active state
const allNavItems = [...mainNavItems, ...moreNavItems];

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  // Check if current tab is in "More" menu
  const isMoreTabActive = moreNavItems.some(item => item.id === activeTab);
  
  const handleMoreItemClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMoreOpen(false);
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-pb">
        <div className="flex items-center justify-around py-2">
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
          
          {/* More Button */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center gap-1 px-6 py-2 relative"
          >
            {isMoreTabActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary/10 rounded-xl"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <MoreHorizontal className={`w-5 h-5 relative z-10 transition-colors ${
              isMoreTabActive ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <span className={`text-xs relative z-10 transition-colors ${
              isMoreTabActive ? 'text-primary font-medium' : 'text-muted-foreground'
            }`}>
              আরও
            </span>
          </button>
        </div>
      </nav>

      {/* More Menu Sheet */}
      <Sheet open={isMoreOpen} onOpenChange={setIsMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-3xl">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-center">আরও অপশন</SheetTitle>
          </SheetHeader>
          
          <div className="grid grid-cols-2 gap-3 pb-6">
            {moreNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleMoreItemClick(item.id)}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-primary/10 border-primary/30 text-primary' 
                      : 'bg-muted/30 border-border hover:bg-muted/50'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
