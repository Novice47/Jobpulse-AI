import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Sparkles,
  MapPin,
  Briefcase,
  DollarSign,
  Bookmark,
  Check,
  RefreshCw,
  Globe,
  ExternalLink,
  Building2,
  Filter,
} from 'lucide-react';
import { MatchScoreBadge } from '../../components/MatchScoreBadge';
import { Link, useSearchParams } from 'react-router-dom';

export const JobsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [remoteType, setRemoteType] = useState('ALL');
  const [expLevel, setExpLevel] = useState('ALL');
  const [naturalInput, setNaturalInput] = useState('');
  const [nlResults, setNlResults] = useState<any>(null);
  const [nlLoading, setNlLoading] = useState(false);
  const [isSyncingLive, setIsSyncingLive] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);
  const [savedJobs, setSavedJobs] = useState<Record<string, boolean>>({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['jobs', query, remoteType, expLevel],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (query) p.set('query', query);
      if (remoteType !== 'ALL') p.set('remoteType', remoteType);
      if (expLevel !== 'ALL') p.set('experienceLevel', expLevel);

      const res = await fetch(`/api/v1/jobs?${p.toString()}`);
      return res.json();
    },
  });

  const jobs = nlResults?.results || data?.data || [];

  const handleNaturalSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!naturalInput.trim()) return;

    setNlLoading(true);
    try {
      const res = await fetch('/api/v1/jobs/natural-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: naturalInput }),
      });
      const json = await res.json();
      if (json.success) {
        setNlResults(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNlLoading(false);
    }
  };

  const handleSyncLiveJobs = async () => {
    setIsSyncingLive(true);
    setSyncNotice(null);
    try {
      const res = await fetch('/api/v1/jobs/sync-live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: 'software-dev', limit: 20 }),
      });
      const json = await res.json();
      if (json.success) {
        setSyncNotice(`Synced ${json.importedCount} new live jobs directly into MongoDB!`);
        refetch();
        setTimeout(() => setSyncNotice(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncingLive(false);
    }
  };

  const toggleSave = async (jobId: string) => {
    setSavedJobs((prev) => ({ ...prev, [jobId]: !prev[jobId] }));
    await fetch(`/api/v1/jobs/${jobId}/save`, { method: 'POST' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-brand-600" />
            Explore Tech Jobs & Career Matches
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-world openings from top technology leaders and verified live public remote job boards.
          </p>
        </div>

        <button
          onClick={handleSyncLiveJobs}
          disabled={isSyncingLive}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-brand-600 font-semibold text-xs flex items-center gap-2 shadow-sm transition-all shrink-0 active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingLive ? 'animate-spin text-brand-600' : ''}`} />
          {isSyncingLive ? 'Syncing Live Feeds...' : 'Sync Live Remote Jobs'}
        </button>
      </div>

      {syncNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          {syncNotice}
        </div>
      )}

      {/* Natural Language AI Search Box */}
      <div className="card-light p-6 bg-gradient-to-r from-brand-50/60 via-indigo-50/40 to-white border-brand-200/90 shadow-sm">
        <form onSubmit={handleNaturalSearch} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-600" />
              OpenAI Smart Job Query Parser
            </label>
            <span className="text-[11px] text-slate-400 font-medium">Try natural search</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={naturalInput}
              onChange={(e) => setNaturalInput(e.target.value)}
              placeholder="e.g. 'Senior Remote TypeScript & React engineer above 25 LPA at Stripe or Google'"
              className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-brand-500 focus:outline-none rounded-xl text-xs shadow-sm"
            />
            <button
              type="submit"
              disabled={nlLoading}
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl text-xs shadow-md shadow-brand-500/25 shrink-0 transition-all active:scale-95"
            >
              {nlLoading ? 'Parsing...' : 'Parse & Search'}
            </button>
          </div>
          {nlResults?.parsedFilters && (
            <div className="text-xs text-slate-700 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-brand-100 mt-2 flex flex-wrap items-center gap-3">
              <span className="font-bold text-brand-700">OpenAI Parsed:</span>
              {nlResults.parsedFilters.skills?.length > 0 && (
                <span className="bg-brand-50 text-brand-700 px-2 py-0.5 rounded-md font-medium">
                  Skills: {nlResults.parsedFilters.skills.join(', ')}
                </span>
              )}
              {nlResults.parsedFilters.remoteType && (
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  Mode: {nlResults.parsedFilters.remoteType}
                </span>
              )}
              {nlResults.parsedFilters.experienceLevel && (
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                  Level: {nlResults.parsedFilters.experienceLevel}
                </span>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Keyword & Filters Bar */}
      <div className="card-light p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setNlResults(null);
            }}
            placeholder="Search role, skills (e.g. React), company..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <select
            value={remoteType}
            onChange={(e) => {
              setRemoteType(e.target.value);
              setNlResults(null);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl text-xs font-medium"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">100% Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>

          <select
            value={expLevel}
            onChange={(e) => {
              setExpLevel(e.target.value);
              setNlResults(null);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl text-xs font-medium"
          >
            <option value="ALL">All Experience Levels</option>
            <option value="ENTRY">Entry Level (0-2y)</option>
            <option value="MID">Mid Level (2-5y)</option>
            <option value="SENIOR">Senior (5-8y)</option>
            <option value="LEAD">Lead / Staff (8+y)</option>
          </select>
        </div>
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs card-light flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          Loading real-time job listings...
        </div>
      ) : jobs.length === 0 ? (
        <div className="p-16 text-center card-light space-y-3">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No matching jobs found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or click 'Sync Live Remote Jobs' to import openings.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: any) => (
            <div
              key={job.id}
              className="card-light p-6 hover:border-brand-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-sm">
                    {job.companyName?.slice(0, 2).toUpperCase() || 'CO'}
                  </div>
                  <h3 className="font-bold text-slate-900 text-base md:text-lg hover:text-brand-600 transition-colors">
                    <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                  </h3>
                  <MatchScoreBadge score={job.matchScore} />
                </div>

                <div className="flex items-center gap-3.5 text-xs font-medium text-slate-600 flex-wrap">
                  <span className="font-bold text-slate-900 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {job.companyName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
                  </span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded-lg font-semibold text-slate-700">
                    {job.remoteType}
                  </span>
                  <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                    ₹{(job.salaryMin / 100000).toFixed(1)} - {(job.salaryMax / 100000).toFixed(1)} LPA
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{job.description}</p>

                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {job.skills?.map((skill: string) => (
                    <span
                      key={skill}
                      className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-2 w-full md:w-auto shrink-0">
                <Link
                  to={`/jobs/${job.id}`}
                  className="w-full md:w-36 py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-brand-500/20 active:scale-95 transition-all"
                >
                  Inspect Match
                </Link>

                {job.applicationUrl && (
                  <a
                    href={job.applicationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full md:w-36 py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    Apply Direct <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                <button
                  onClick={() => toggleSave(job.id)}
                  className={`w-full md:w-36 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    savedJobs[job.id]
                      ? 'bg-brand-50 border-brand-200 text-brand-700 font-bold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {savedJobs[job.id] ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-brand-600" /> Saved
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-3.5 h-3.5" /> Save Job
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
