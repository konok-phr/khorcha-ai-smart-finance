import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  has_completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      if (profileData) {
        setProfile(profileData as UserProfile);
      }

      // Check if admin using the security definer function
      const { data: roleData, error: roleError } = await supabase
        .rpc('get_user_role', { _user_id: user.id });

      if (!roleError && roleData === 'admin') {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error('Error in useUserProfile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const completeOnboarding = useCallback(async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_onboarding: true })
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, has_completed_onboarding: true } : null);
      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updates } : null);
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }, [user]);

  return {
    profile,
    isLoading,
    isAdmin,
    completeOnboarding,
    updateProfile,
    refetch: fetchProfile,
  };
};
