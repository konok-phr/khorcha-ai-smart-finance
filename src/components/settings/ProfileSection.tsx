import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const ProfileSection = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [phone, setPhone] = useState(user?.user_metadata?.phone || '');

  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: displayName,
          phone: phone,
        }
      });

      if (error) throw error;
      toast.success('প্রোফাইল আপডেট হয়েছে!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <User className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">প্রোফাইল তথ্য</h3>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 shadow-card space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">
                {displayName ? displayName[0].toUpperCase() : user?.email?.[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-medium text-lg">{displayName || 'নাম সেট করুন'}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">প্রদর্শন নাম</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="আপনার নাম লিখুন"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="pl-10 bg-muted/50"
                />
              </div>
              <p className="text-xs text-muted-foreground">ইমেইল পরিবর্তন করা যাবে না</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">ফোন নম্বর</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1XXX-XXXXXX"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                সেভ হচ্ছে...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                সেভ করুন
              </>
            )}
          </Button>
        </Card>
      </motion.div>
    </div>
  );
};
