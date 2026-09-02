import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Shield, RefreshCw, Database, AlertOctagon, ArrowLeft, Lock } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminPage: React.FC = () => {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [seeding, setSeeding] = useState(false);
  const [seedNotice, setSeedNotice] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const { data, refetch, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/admin/stats');
      if (res.status === 403 || res.status === 401) {
        throw new Error('Access Denied: Administrator privileges required.');
      }
      return res.json();
    },
    enabled: Boolean(isAdmin),
    retry: false,
  });

  if (!isAuthLoading && !isAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="card-light max-w-md w-full p-8 text-center space-y-5 border-2 border-rose-100 shadow-xl rounded-3xl">
          <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Access Denied (403 Forbidden)</h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This area is strictly restricted to authenticated system administrators. Your current account (<code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">{user?.email || 'Guest'}</code>) does not possess administrative privileges.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md active:scale-95"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.data;

  const handleRunSeed = async () => {
    setSeeding(true);
    setSeedNotice(null);
    try {
      const res = await fetch('/api/v1/admin/seed', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Seed failed');
      }
      setSeedNotice('Synthetic demo dataset re-seeded successfully.');
      refetch();
    } catch (e: any) {
      alert(e.message || 'Error executing admin seed operation');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold mb-2">
            <Shield className="w-3.5 h-3.5" /> Administrator Control Panel
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">System Operations & Admin Health</h1>
          <p className="text-xs text-slate-500 mt-1">Manage synthetic demo seed data, inspect ingestion health, and monitor API services</p>
        </div>
      </div>

      {seedNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>✓ {seedNotice}</span>
          <button onClick={() => setSeedNotice(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="card-light p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Users</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalUsers || 0}</p>
        </div>
        <div className="card-light p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Job Listings</p>
          <p className="text-3xl font-extrabold text-brand-600 mt-2">{stats?.totalJobs || 0}</p>
        </div>
        <div className="card-light p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Companies</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{stats?.totalCompanies || 0}</p>
        </div>
        <div className="card-light p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracked Skills</p>
          <p className="text-3xl font-extrabold text-emerald-600 mt-2">{stats?.totalSkills || 0}</p>
        </div>
      </div>

      <div className="card-light p-6 space-y-4 border-l-4 border-l-rose-600">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <Database className="w-5 h-5 text-brand-600" /> Synthetic Data Seeder & Controls
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Repopulate synthetic jobs, companies, skills, and market snapshots. All synthetic records carry explicit <code className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-800">isSynthetic: true</code> flags.
        </p>

        <button onClick={handleRunSeed} disabled={seeding} className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
          {seeding ? 'Seeding Dataset...' : 'Trigger Synthetic Data Seed'}
        </button>
      </div>
    </div>
  );
};
