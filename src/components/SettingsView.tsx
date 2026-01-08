import { motion } from 'framer-motion';
import { LogOut, User, Shield, Bell, HelpCircle, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const SettingsView = () => {
  const { user, signOut } = useAuth();

  const menuItems = [
    { icon: User, label: 'প্রোফাইল', description: 'আপনার তথ্য পরিবর্তন করুন', disabled: true },
    { icon: Bell, label: 'নোটিফিকেশন', description: 'বাজেট সতর্কতা সেট করুন', disabled: true },
    { icon: Shield, label: 'নিরাপত্তা', description: 'পাসওয়ার্ড পরিবর্তন করুন', disabled: true },
    { icon: HelpCircle, label: 'সাহায্য', description: 'সাধারণ প্রশ্ন ও উত্তর', disabled: true },
  ];

  return (
    <div className="space-y-6">
      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">Khorcha AI ব্যবহারকারী</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Menu Items */}
      <div className="space-y-2">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 shadow-card ${item.disabled ? 'opacity-50' : 'hover:shadow-float cursor-pointer'}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {item.disabled && (
                    <span className="text-xs bg-secondary px-2 py-1 rounded-full text-muted-foreground">
                      শীঘ্রই
                    </span>
                  )}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Logout Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          variant="outline"
          className="w-full h-12 text-expense border-expense/20 hover:bg-expense/10"
          onClick={signOut}
        >
          <LogOut className="w-5 h-5 mr-2" />
          লগআউট
        </Button>
      </motion.div>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground">
        Khorcha AI v1.0.0 • Made with ❤️ in Bangladesh
      </p>
    </div>
  );
};
