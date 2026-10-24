import React, { useEffect, useState } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { Search, Crown, Loader2 } from 'lucide-react';
import { database } from '../../config/firebase';

interface AdminUserItem {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  district?: string;
  isPremium: boolean;
  isAdmin: boolean;
}

export const AdminUsersTab: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const list: AdminUserItem[] = [];
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          const val = child.val();
          if (val) {
            const expiry = val.premiumExpiry || 0;
            const isPremium = Boolean(val.isPremium) && (expiry === 0 || expiry > Date.now());

            list.push({
              uid: child.key || '',
              name: val.name || 'Student',
              email: val.email || 'No Email',
              phone: val.phone || '',
              district: val.district || '',
              isPremium,
              isAdmin: Boolean(val.isAdmin),
            });
          }
        });
      }
      setUsers(list);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleTogglePremium = async (uid: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    await update(ref(database, `users/${uid}`), {
      isPremium: newStatus,
    });
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.district && u.district.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-brand-400 animate-spin mb-2" />
        <p className="text-xs text-slate-400">Loading registered students...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search students by name, email, or district..."
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-3">
          <span>Showing <strong>{filteredUsers.length}</strong> of <strong>{users.length}</strong> students</span>
        </div>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 gap-3">
        {filteredUsers.map((user) => (
          <div
            key={user.uid}
            className="p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
          >
            <div className="flex items-center space-x-3.5 truncate">
              <div className="w-10 h-10 rounded-2xl bg-brand-600/20 border border-brand-500/30 text-brand-400 flex items-center justify-center font-bold text-sm shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm truncate">{user.name}</h4>
                  {user.isAdmin && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {user.email} {user.phone ? `• ${user.phone}` : ''} {user.district ? `• ${user.district}` : ''}
                </p>
              </div>
            </div>

            {/* Premium Toggle Switch */}
            <div className="flex items-center space-x-3 shrink-0 self-end sm:self-center">
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 ${
                  user.isPremium
                    ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
              >
                {user.isPremium ? (
                  <>
                    <Crown className="w-3 h-3 fill-yellow-400" />
                    <span>PREMIUM</span>
                  </>
                ) : (
                  <span>FREE</span>
                )}
              </span>

              <button
                type="button"
                onClick={() => handleTogglePremium(user.uid, user.isPremium)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  user.isPremium ? 'bg-yellow-500' : 'bg-slate-800 border-slate-700'
                }`}
                title={user.isPremium ? 'Revoke Premium' : 'Grant Premium'}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    user.isPremium ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No students found matching "{searchQuery}".
          </div>
        )}
      </div>
    </div>
  );
};
