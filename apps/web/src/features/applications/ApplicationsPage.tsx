import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Kanban, Plus, Building2, Calendar, MapPin } from 'lucide-react';

const COLUMNS = [
  { key: 'SAVED', title: 'Saved Jobs', color: 'border-t-slate-400' },
  { key: 'APPLIED', title: 'Applied', color: 'border-t-brand-500' },
  { key: 'SCREENING', title: 'Screening', color: 'border-t-indigo-500' },
  { key: 'INTERVIEW', title: 'Interviewing', color: 'border-t-amber-500' },
  { key: 'OFFER', title: 'Offer Received', color: 'border-t-emerald-500' },
  { key: 'REJECTED', title: 'Rejected', color: 'border-t-rose-400' },
];

export const ApplicationsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const res = await fetch('/api/v1/applications');
      return res.json();
    },
  });

  const apps = data?.data || [];

  const handleAddApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !companyName) return;

    await fetch('/api/v1/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobId: `custom-${Date.now()}`,
        jobTitle,
        companyName,
        status: 'APPLIED',
        appliedDate: new Date().toISOString(),
      }),
    });

    setJobTitle('');
    setCompanyName('');
    setShowModal(false);
    refetch();
  };

  const handleMoveStatus = async (appId: string, newStatus: string) => {
    await fetch(`/api/v1/applications/${appId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    refetch();
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Application Tracker Kanban</h1>
          <p className="text-xs text-slate-500 mt-1">Track interview pipeline stages, follow-up dates, and active offers</p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn-primary text-xs">
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-lg">Add New Job Application</h3>
            <form onSubmit={handleAddApp} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Job Title</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Engineer"
                  className="input-light w-full mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. TechCorp Solutions"
                  className="input-light w-full mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary text-xs">
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs">
                  Save Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 items-start overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colApps = apps.filter((a: any) => a.status === col.key);

          return (
            <div key={col.key} className={`bg-slate-100/70 border border-slate-200/80 rounded-xl p-3 min-h-[500px] flex flex-col space-y-3 border-t-4 ${col.color}`}>
              <div className="flex items-center justify-between px-1">
                <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">{col.title}</h3>
                <span className="w-5 h-5 rounded-full bg-white text-slate-700 font-bold text-[11px] flex items-center justify-center shadow-sm">
                  {colApps.length}
                </span>
              </div>

              <div className="space-y-2.5 flex-1">
                {colApps.map((item: any) => (
                  <div key={item.id} className="card-light p-3.5 space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900 leading-snug">{item.jobTitle}</h4>
                    <p className="text-slate-500 font-medium flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {item.companyName}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <select
                        value={item.status}
                        onChange={(e) => handleMoveStatus(item.id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-700 rounded px-1.5 py-0.5"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
