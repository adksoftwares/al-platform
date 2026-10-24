import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, PlusCircle, User, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const { isAdmin } = useAuth();

  const navItems = isAdmin
    ? [
        { to: '/admin', label: 'Admin', icon: Shield },
        { to: '/dashboard', label: 'Student View', icon: Home },
        { to: '/profile', label: 'Profile', icon: User },
      ]
    : [
        { to: '/dashboard', label: 'Home', icon: Home },
        { to: '/analytics', label: 'AI Insights', icon: Sparkles },
        { to: '/suggest-material', label: 'Suggest', icon: PlusCircle },
        { to: '/profile', label: 'Profile', icon: User },
      ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-800/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full py-1 text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-brand-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-1" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
