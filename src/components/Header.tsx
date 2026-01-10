import { motion } from 'framer-motion';
import { Sparkles, LogOut, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const { signOut, user } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-effect border-b border-border/50"
    >
      <div className="container mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="relative"
            >
              <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shadow-button">
                <Wallet className="w-5 h-5 text-primary-foreground" />
              </div>
              {/* Animated sparkle */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full gradient-accent flex items-center justify-center"
              >
                <Sparkles className="w-2.5 h-2.5 text-accent-foreground" />
              </motion.div>
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                Hisab<span className="text-gradient-primary">AI</span>
              </h1>
              <p className="text-xs text-muted-foreground font-medium">স্মার্ট মানি ম্যানেজার</p>
            </div>
          </div>

          {user && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                className="text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
};
