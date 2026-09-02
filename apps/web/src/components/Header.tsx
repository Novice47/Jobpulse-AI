import React, { useState } from 'react';
import { Search, Bell, Sparkles, CheckCircle2, User, LogOut, Settings, LogIn, ChevronDown, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu }) => {
  const { user, profile, isAuthenticated, logout, openAuthModal } = useAuth();
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayName = profile?.name || user?.name || 'Guest User';
  const displayRole = profile?.currentRole || 'Explore Market';
  const displayAvatar =
    user?.avatar ||
    profile?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm gap-3">
        {/* Left Side: Mobile Menu Button & Search */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xl">
          {/* Hamburger Menu Toggle (Mobile only) */}
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
            aria-label="Open menu"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, skills..."
              className="w-full pl-9 pr-8 py-1.5 md:py-2 bg-slate-100/80 hover:bg-slate-100 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none text-xs md:text-sm rounded-xl transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-brand-600 rounded-md"
              title="Search"
            >
              <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </form>
        </div>

        {/* Right Side: Notifications & Account */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifs(!showNotifs);
                setShowUserMenu(false);
              }}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-brand-600 absolute top-2 right-2 border-2 border-white"></span>
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <h3 className="font-semibold text-sm text-slate-900">Live Market Alerts</h3>
                  <span className="text-xs text-brand-600 font-medium cursor-pointer hover:underline">Mark read</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-brand-50/60 border border-brand-100/80 flex gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-900">Real-Time MongoDB Sync Active</p>
                      <p className="text-slate-600 mt-0.5">Your candidate profile and AI analytics are persisted in MongoDB.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Authentication & User Account */}
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifs(false);
                }}
                className="flex items-center gap-2 pl-2 md:pl-3 border-l border-slate-200 hover:opacity-90 transition-all text-left"
              >
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-cover ring-2 ring-brand-200"
                />
                <div className="hidden md:block">
                  <div className="flex items-center gap-1">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">{displayName}</p>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium truncate max-w-[120px]">{displayRole}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 sm:w-56 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900">{displayName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <User className="w-4 h-4 text-brand-600" />
                    Edit Profile & Skills
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      openAuthModal('login');
                    }}
                    className="w-full px-4 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    Switch / Add Account
                  </button>

                  <div className="my-1 border-t border-slate-100"></div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full px-4 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 md:gap-2 pl-2 border-l border-slate-200">
              <button
                onClick={() => openAuthModal('login')}
                className="px-2.5 md:px-3.5 py-1.5 md:py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-all flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition-all"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
    </>
  );
};
