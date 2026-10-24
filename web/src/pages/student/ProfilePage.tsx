import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, MapPin, Globe, Crown, LogOut, CheckCircle2, Edit2, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { userProfile, updateProfile, isPremium, logout } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [district, setDistrict] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('tamil');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile && !isEditing) {
      setDistrict(userProfile.district || '');
      setPhone(userProfile.phone || '');
      setLanguage(userProfile.language || 'tamil');
    }
  }, [userProfile, isEditing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateProfile(district, phone, language);
    setIsSaving(false);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        {/* Avatar & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-brand-600/30">
              {userProfile?.name?.charAt(0).toUpperCase() || 'S'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{userProfile?.name || 'Student'}</h2>
              <p className="text-xs text-slate-400">{userProfile?.email || 'No email'}</p>
              <div className="mt-2">
                {isPremium ? (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 text-[11px] font-bold">
                    <Crown className="w-3.5 h-3.5 fill-yellow-400" />
                    PREMIUM ACCOUNT
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-semibold">
                    FREE ACCOUNT
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="self-start sm:self-center p-2.5 rounded-xl bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-xs font-semibold transition flex items-center gap-1.5"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Profile information updated successfully!</span>
          </div>
        )}

        {/* Profile Info & Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>District</span>
            </label>
            <input
              type="text"
              value={district}
              disabled={!isEditing}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Colombo, Jaffna, Kandy"
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />
              <span>Phone Number</span>
            </label>
            <input
              type="text"
              value={phone}
              disabled={!isEditing}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 0771234567"
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Preferred Language (App & Materials)</span>
            </label>
            <select
              value={language}
              disabled={!isEditing}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-brand-500 disabled:opacity-60 disabled:cursor-not-allowed capitalize"
            >
              <option value="tamil" className="bg-slate-900">Tamil (தமிழ்)</option>
              <option value="english" className="bg-slate-900">English</option>
              <option value="sinhala" className="bg-slate-900">Sinhala (සිංහල)</option>
            </select>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-brand-600/30"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </form>

        {/* Upgrade Card if Free */}
        {!isPremium && (
          <div className="pt-4 border-t border-slate-800">
            <Link
              to="/payment"
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:brightness-110 transition flex items-center justify-center gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade to Premium for Rs. 500</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
