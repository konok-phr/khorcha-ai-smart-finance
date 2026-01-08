import { motion } from 'framer-motion';
import { Sparkles, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export const Header = () => {
  const { signOut, user } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 glass-effect border-b border-border"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-button"
            >
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Khorcha AI</h1>
              <p className="text-xs text-muted-foreground">আপনার স্মার্ট অর্থ সহায়ক</p>
            </div>
          </div>

          {user && (
            <Button
              variant="ghost"
              size="icon"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
