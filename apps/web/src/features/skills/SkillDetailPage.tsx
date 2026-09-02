import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Award, TrendingUp, BookOpen, ExternalLink, ArrowLeft, Briefcase } from 'lucide-react';
import { SyntheticBadge } from '../../components/SyntheticBadge';

export const SkillDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['skillDetail', id],
    queryFn: async () => {
      const res = await fetch(`/api/v1/skills/${id}`);
      return res.json();
    },
  });

  const skill = data?.data;

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 card-light max-w-4xl mx-auto">Loading skill intelligence...</div>;
  }

  if (!skill) {
    return <div className="p-12 text-center card-light max-w-4xl mx-auto">Skill not found</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <Link to="/skills" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600">
        <ArrowLeft className="w-4 h-4" /> Back to skills index
      </Link>

      <div className="card-light p-8 space-y-6">
        <div className="flex items-start justify-between border-b border-slate-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-900">{skill.name}</h1>
              <SyntheticBadge />
            </div>
            <p className="text-xs text-slate-500 mt-1">Category: {skill.category}</p>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-brand-600">{skill.demandCount}</span>
            <p className="text-xs text-slate-500 font-medium">Active Jobs</p>
          </div>
        </div>

        {/* Growth Stats Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <div>
              <p className="text-sm font-bold text-emerald-900">Year-over-Year Demand Growth</p>
              <p className="text-xs text-emerald-700">Calculated over historical job post aggregations in synthetic dataset</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-emerald-700">+{skill.growthRate}%</span>
        </div>

        {/* Curated Learning Resources */}
        <div className="space-y-4 pt-4">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-brand-600" /> Curated Learning Resources
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skill.resources?.map((res: any) => (
              <div key={res.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-sm text-slate-900">{res.title}</h4>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md uppercase">{res.format}</span>
                </div>
                <p className="text-xs text-slate-500">Provider: {res.provider} • Difficulty: {res.difficulty}</p>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-brand-600 hover:underline inline-flex items-center gap-1 pt-1"
                >
                  Open Resource <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Related Job Postings */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-brand-600" /> Recent Jobs Requiring {skill.name}
          </h3>

          <div className="space-y-2">
            {skill.relatedJobs?.map((job: any) => (
              <div key={job.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <Link to={`/jobs/${job.id}`} className="font-bold text-sm text-slate-900 hover:text-brand-600">
                    {job.title}
                  </Link>
                  <p className="text-xs text-slate-500">{job.companyName} • {job.location}</p>
                </div>
                <Link to={`/jobs/${job.id}`} className="btn-secondary text-xs">
                  View Job
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
