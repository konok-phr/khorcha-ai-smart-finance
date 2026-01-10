import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  role: string;
}

export const useAdminUsers = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin } = useUserProfile();

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) {
      setUsers([]);
      setIsLoading(false);
      return;
    }

    try {
      // Fetch all profiles (admin has access via RLS policy)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        throw profilesError;
      }

      // Fetch all roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
      }

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profilesData || []).map((profile: any) => {
        const role = rolesData?.find((r: any) => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          display_name: profile.display_name,
          created_at: profile.created_at,
          role: role?.role || 'user',
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error in useAdminUsers:', error);
      toast.error('ব্যবহারকারী তালিকা লোড করতে সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const deleteUser = useCallback(async (userId: string) => {
    if (!isAdmin) {
      toast.error('আপনার এই কাজ করার অনুমতি নেই');
      return false;
    }

    try {
      // Delete all user activities first
      const deletePromises = [
        supabase.from('transactions').delete().eq('user_id', userId),
        supabase.from('accounts').delete().eq('user_id', userId),
        supabase.from('budgets').delete().eq('user_id', userId),
        supabase.from('recurring_transactions').delete().eq('user_id', userId),
        supabase.from('savings_goals').delete().eq('user_id', userId),
        supabase.from('credit_cards').delete().eq('user_id', userId),
        supabase.from('investments').delete().eq('user_id', userId),
        supabase.from('loans').delete().eq('user_id', userId),
      ];

      // Wait for all activity deletions
      const results = await Promise.all(deletePromises);
      
      // Check for any errors in deletions
      for (const result of results) {
        if (result.error) {
          console.error('Error deleting user data:', result.error);
        }
      }

      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error deleting user role:', roleError);
      }

      // Finally delete the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (profileError) throw profileError;

      setUsers(prev => prev.filter(u => u.user_id !== userId));
      toast.success('ব্যবহারকারী এবং তার সকল ডেটা মুছে ফেলা হয়েছে');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('ব্যবহারকারী মুছতে সমস্যা হয়েছে');
      return false;
    }
  }, [isAdmin]);

  return {
    users,
    isLoading,
    isAdmin,
    deleteUser,
    refetch: fetchUsers,
  };
};
