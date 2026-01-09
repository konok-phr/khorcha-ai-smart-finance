import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SecuritySection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('সব ফিল্ড পূরণ করুন');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('পাসওয়ার্ড মিলছে না');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success('পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!newPassword) return { level: 0, text: '', color: '' };
    if (newPassword.length < 6) return { level: 1, text: 'দুর্বল', color: 'bg-expense' };
    if (newPassword.length < 10) return { level: 2, text: 'মাঝারি', color: 'bg-warning' };
    return { level: 3, text: 'শক্তিশালী', color: 'bg-income' };
  };

  const strength = passwordStrength();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">নিরাপত্তা সেটিংস</h3>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 shadow-card space-y-6">
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <Lock className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-sm">পাসওয়ার্ড পরিবর্তন</p>
              <p className="text-xs text-muted-foreground">নতুন পাসওয়ার্ড সেট করুন</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">নতুন পাসওয়ার্ড</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="নতুন পাসওয়ার্ড লিখুন"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          strength.level >= level ? strength.color : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    strength.level === 1 ? 'text-expense' : 
                    strength.level === 2 ? 'text-warning' : 'text-income'
                  }`}>
                    {strength.text}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">পাসওয়ার্ড নিশ্চিত করুন</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড আবার লিখুন"
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {/* Match Indicator */}
              {confirmPassword && (
                <p className={`text-xs flex items-center gap-1 ${
                  newPassword === confirmPassword ? 'text-income' : 'text-expense'
                }`}>
                  {newPassword === confirmPassword ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      পাসওয়ার্ড মিলেছে
                    </>
                  ) : (
                    'পাসওয়ার্ড মিলছে না'
                  )}
                </p>
              )}
            </div>
          </div>

          <Button 
            onClick={handleChangePassword} 
            disabled={isLoading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                পরিবর্তন হচ্ছে...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                পাসওয়ার্ড পরিবর্তন করুন
              </>
            )}
          </Button>
        </Card>
      </motion.div>

      {/* Security Tips */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 shadow-card bg-muted/30">
          <p className="text-sm font-medium mb-2">🔒 নিরাপত্তা টিপস</p>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• কমপক্ষে ৮-১০ অক্ষরের পাসওয়ার্ড ব্যবহার করুন</li>
            <li>• বড় ও ছোট হাতের অক্ষর মিশ্রিত করুন</li>
            <li>• সংখ্যা ও বিশেষ চিহ্ন যোগ করুন</li>
            <li>• সহজে অনুমানযোগ্য তথ্য এড়িয়ে চলুন</li>
          </ul>
        </Card>
      </motion.div>
    </div>
  );
};
