import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { MapPin, DollarSign, CheckCircle, XCircle, ArrowLeft, Bookmark, ExternalLink, Sparkles, Building2 } from 'lucide-react';
import { SyntheticBadge } from '../../components/SyntheticBadge';
import { MatchScoreBadge } from '../../components/MatchScoreBadge';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isSaved, setIsSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/jobs/${id}`);
      return res.json();
    },
  });

  const job = data?.data;
  const match = job?.matchResult;

  const handleSaveToggle = async () => {
    setIsSaved(!isSaved);
    await fetch(`/api/v1/jobs/${id}/save`, { method: 'POST' });
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 card-light max-w-4xl mx-auto">Loading job details...</div>;
  }

  if (!job) {
    return (
      <div className="p-12 text-center card-light max-w-4xl mx-auto space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Job not found</h2>
        <Link to="/jobs" className="btn-primary text-xs inline-flex">Return to jobs search</Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Back Link */}
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to job search
      </Link>

      {/* Main Header Card */}
      <div className="card-light p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900">{job.title}</h1>
              <MatchScoreBadge score={job.matchScore} />
              {job.isSynthetic && <SyntheticBadge />}
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-700 flex-wrap">
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-brand-600" /> {job.companyName}</span>
              <span className="flex items-center gap-1.5 text-slate-500 font-normal"><MapPin className="w-4 h-4 text-slate-400" /> {job.location}</span>
              <span className="bg-brand-50 text-brand-700 px-2.5 py-0.5 rounded-md text-xs font-bold">{job.remoteType}</span>
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md text-xs font-bold">
                ₹{(job.salaryMin / 100000).toFixed(1)} - {(job.salaryMax / 100000).toFixed(1)} LPA
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button onClick={handleSaveToggle} className="btn-secondary text-xs">
              <Bookmark className="w-4 h-4" /> {isSaved ? 'Saved' : 'Save Job'}
            </button>
            <a href={job.applicationUrl} target="_blank" rel="noreferrer" className="btn-primary text-xs">
              Apply Now <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Deterministic Match Score Breakdown */}
        {match && (
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Deterministic Match Score Breakdown ({match.overallScore}%)
              </h3>
              <span className="text-xs font-medium text-slate-500">Weighted Engine</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Skills (60%)</p>
                <p className="text-lg font-extrabold text-slate-900">{match.skillScore}%</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Experience (15%)</p>
                <p className="text-lg font-extrabold text-slate-900">{match.experienceScore}%</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Location (10%)</p>
                <p className="text-lg font-extrabold text-slate-900">{match.locationScore}%</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Role (10%)</p>
                <p className="text-lg font-extrabold text-slate-900">{match.roleScore}%</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Salary (5%)</p>
                <p className="text-lg font-extrabold text-slate-900">{match.salaryScore}%</p>
              </div>
            </div>

            {/* Matched vs Missing Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Matched Skills ({match.matchedSkills?.length || 0})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.matchedSkills?.map((s: string) => (
                    <span key={s} className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-2">
                <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-amber-600" />
                  Missing Required Skills ({match.missingRequiredSkills?.length || 0})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {match.missingRequiredSkills?.map((s: string) => (
                    <span key={s} className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-md">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Explanation Box */}
            <div className="p-3.5 bg-brand-50/60 border border-brand-100 rounded-xl text-xs text-slate-700 leading-relaxed">
              <span className="font-bold text-brand-900">AI Explanation: </span>
              {match.explanation || `You match ${match.matchedSkills?.length} of the required skills for this position.`}
            </div>
          </div>
        )}

        {/* Detailed Job Requirements & Description */}
        <div className="space-y-6 pt-4 text-sm text-slate-700">
          <div>
            <h3 className="font-bold text-base text-slate-900 mb-2">Job Description</h3>
            <p className="leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>

          {job.requirements?.length > 0 && (
            <div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Requirements</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                {job.requirements.map((req: string, idx: number) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {job.responsibilities?.length > 0 && (
            <div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Responsibilities</h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                {job.responsibilities.map((res: string, idx: number) => (
                  <li key={idx}>{res}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
