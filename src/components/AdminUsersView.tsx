import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Trash2, Shield, ShieldCheck, Search, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingSpinner } from './LoadingSpinner';

export const AdminUsersView = () => {
  const { users, isLoading, isAdmin, deleteUser, refetch } = useAdminUsers();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredUsers = users.filter(user => {
    const query = searchQuery.toLowerCase();
    return (
      user.email?.toLowerCase().includes(query) ||
      user.display_name?.toLowerCase().includes(query)
    );
  });

  const handleDelete = async () => {
    if (!userToDelete) return;
    
    setIsDeleting(true);
    await deleteUser(userToDelete);
    setIsDeleting(false);
    setUserToDelete(null);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('bn-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(dateStr));
  };

  if (!isAdmin) {
    return (
      <Card className="p-8 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h2 className="text-xl font-bold mb-2">অ্যাক্সেস নেই</h2>
        <p className="text-muted-foreground">
          এই পেজ দেখার জন্য অ্যাডমিন অনুমতি প্রয়োজন
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="py-12">
        <LoadingSpinner message="ব্যবহারকারী লোড হচ্ছে..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" />
            অ্যাডমিন প্যানেল
          </h1>
          <p className="text-muted-foreground mt-1">
            মোট {users.length} জন ব্যবহারকারী
          </p>
        </div>
        <Button variant="outline" onClick={refetch} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          রিফ্রেশ
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="ইমেইল বা নাম দিয়ে খুঁজুন..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((user, index) => {
            const isCurrentUser = user.user_id === currentUser?.id;
            
            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={`p-4 shadow-card hover:shadow-float transition-all ${
                  isCurrentUser ? 'border-primary/30 bg-primary/5' : ''
                }`}>
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' 
                        : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {user.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-foreground truncate">
                          {user.display_name || 'নাম নেই'}
                        </p>
                        <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                          {user.role === 'admin' ? (
                            <><ShieldCheck className="w-3 h-3 mr-1" /> অ্যাডমিন</>
                          ) : (
                            <><Users className="w-3 h-3 mr-1" /> ইউজার</>
                          )}
                        </Badge>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-primary border-primary">
                            আপনি
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        যোগদান: {formatDate(user.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    {!isCurrentUser && user.role !== 'admin' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setUserToDelete(user.user_id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredUsers.length === 0 && (
          <Card className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">কোনো ব্যবহারকারী পাওয়া যায়নি</p>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              ব্যবহারকারী মুছে ফেলবেন?
            </AlertDialogTitle>
            <AlertDialogDescription>
              এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না। ব্যবহারকারীর সমস্ত ডেটা মুছে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'মুছছে...' : 'মুছে ফেলুন'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
