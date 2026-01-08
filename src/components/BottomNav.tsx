import { motion } from 'framer-motion';
import { Home, BarChart3, Wallet, HandCoins, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: 'home', label: 'হোম', icon: Home },
  { id: 'stats', label: 'রিপোর্ট', icon: BarChart3 },
  { id: 'loans', label: 'ধার', icon: HandCoins },
  { id: 'accounts', label: 'অ্যাকাউন্ট', icon: Wallet },
  { id: 'settings', label: 'সেটিংস', icon: Settings },
];

export const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="flex flex-col items-center gap-1 px-4 py-2 relative"
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
  );
};
