import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Key, Settings, FolderKanban, MessageSquareCheck, ShieldAlert, Star, LogOut, ArrowLeft } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { database } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import { AdminUsersTab } from './AdminUsersTab';
import { AdminKeysTab } from './AdminKeysTab';
import { AdminConfigTab } from './AdminConfigTab';
import { AdminContentTab } from './AdminContentTab';
import { AdminSuggestionsTab } from './AdminSuggestionsTab';

type AdminTab = 'users' | 'keys' | 'config' | 'content' | 'suggestions';

export const AdminDashboardPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [currentTab, setCurrentTab] = useState<AdminTab>('users');
  const [totalUsers, setTotalUsers] = useState(0);
  const [premiumUsers, setPremiumUsers] = useState(0);

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      let total = 0;
      let premium = 0;
      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          total++;
          const val = child.val();
          if (val && val.isPremium) {
            premium++;
          }
        });
      }
      setTotalUsers(total);
      setPremiumUsers(premium);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const tabs = [
    { id: 'users' as AdminTab, label: 'Users', icon: Users },
    { id: 'keys' as AdminTab, label: 'Keys', icon: Key },
    { id: 'config' as AdminTab, label: 'Config', icon: Settings },
    { id: 'content' as AdminTab, label: 'Content', icon: FolderKanban },
    { id: 'suggestions' as AdminTab, label: 'Suggestions', icon: MessageSquareCheck },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Top Admin Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="p-3.5 bg-brand-600/20 border border-brand-500/30 text-brand-400 rounded-2xl shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 uppercase tracking-wider">
                Admin Console
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-0.5">
              Platform Administration
            </h1>
            <p className="text-xs text-slate-400">
              Manage student accounts, license keys, repository content, and cloud integrations.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Student View</span>
          </button>

          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-400 hover:text-red-400 transition"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center space-x-4 shadow-lg">
          <div className="p-3 bg-brand-500/10 text-brand-400 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Total Registered Users</span>
            <span className="text-2xl font-black text-white">{totalUsers}</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center space-x-4 shadow-lg">
          <div className="p-3 bg-yellow-500/10 text-yellow-400 rounded-2xl">
            <Star className="w-6 h-6 fill-yellow-400" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block">Premium Accounts</span>
            <span className="text-2xl font-black text-white">{premiumUsers}</span>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center space-x-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'border-brand-500 text-brand-400 bg-brand-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Tab Component */}
      <div className="pt-2">
        {currentTab === 'users' && <AdminUsersTab />}
        {currentTab === 'keys' && <AdminKeysTab />}
        {currentTab === 'config' && <AdminConfigTab />}
        {currentTab === 'content' && <AdminContentTab />}
        {currentTab === 'suggestions' && <AdminSuggestionsTab />}
      </div>
    </div>
  );
};
