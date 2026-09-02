import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  Award,
  Building2,
  DollarSign,
  Target,
  FileText,
  MapPin,
  Kanban,
  Bell,
  Shield,
  Zap,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BASE_NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/jobs', label: 'Explore Jobs', icon: Briefcase },
  { path: '/market', label: 'Market Trends', icon: TrendingUp },
  { path: '/skills', label: 'Skills Intelligence', icon: Award },
  { path: '/companies', label: 'Companies', icon: Building2 },
  { path: '/salaries', label: 'Salary Insights', icon: DollarSign },
  { path: '/career', label: 'Career Gap Engine', icon: Target },
  { path: '/resume', label: 'Resume Analyzer', icon: FileText },
  { path: '/roadmap', label: 'Career Roadmap', icon: MapPin },
  { path: '/applications', label: 'Application Tracker', icon: Kanban },
  { path: '/alerts', label: 'Alerts', icon: Bell },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/30">
            <Zap className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-base leading-none">JobPulse AI</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">Market & Career SaaS</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {BASE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 text-slate-500 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* Admin Panel link for admin users */}
        {isAdmin && (
          <NavLink
            to="/admin"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 border-t border-slate-100 mt-2 ${
                isActive
                  ? 'bg-rose-50 text-rose-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:bg-rose-50/50 hover:text-rose-700'
              }`
            }
          >
            <Shield className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Admin Panel</span>
          </NavLink>
        )}
      </nav>

      {/* Footer Banner */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
          <p className="text-xs font-semibold text-slate-900">Deterministic + AI</p>
          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
            Real-time market analytics backed by enterprise-grade security.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile Slide-Over Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          {/* Drawer Content */}
          <div className="relative flex-1 max-w-xs w-full bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
