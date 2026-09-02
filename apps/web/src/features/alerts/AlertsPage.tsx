import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Bell, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [skills, setSkills] = useState('React, Node.js');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['alerts'],
    queryFn: async () => {
      const res = await fetch('/api/v1/alerts');
      return res.json();
    },
  });

  const alerts = data?.data || [];

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/v1/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetRole,
        skills: skills.split(',').map((s) => s.trim()),
        frequency: 'DAILY',
      }),
    });
    refetch();
  };

  const handleDeleteAlert = async (alertId: string) => {
    await fetch(`/api/v1/alerts/${alertId}`, { method: 'DELETE' });
    refetch();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900">Personalized Job Alerts</h1>
        <p className="text-xs text-slate-500 mt-1">Configure automated matching alert rules triggered by background workers</p>
      </div>

      <div className="card-light p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4 text-brand-600" /> Create New Job Alert Rule
        </h3>

        <form onSubmit={handleCreateAlert} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            required
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target Role"
            className="input-light"
          />
          <input
            type="text"
            required
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Skills (comma separated)"
            className="input-light"
          />
          <button type="submit" className="btn-primary text-xs shrink-0">
            Create Alert Rule
          </button>
        </form>
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-slate-900 text-sm">Active Job Alerts</h3>
        {alerts.map((item: any) => (
          <div key={item.id} className="card-light p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-brand-600" /> {item.targetRole}
              </p>
              <p className="text-xs text-slate-500">Skills: {item.skills?.join(', ')}</p>
            </div>
            <button onClick={() => handleDeleteAlert(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
