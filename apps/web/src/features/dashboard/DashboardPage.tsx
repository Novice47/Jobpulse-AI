import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target, Briefcase, TrendingUp, Sparkles, ArrowUpRight, Award, MapPin } from 'lucide-react';
import { SyntheticBadge } from '../../components/SyntheticBadge';
import { MatchScoreBadge } from '../../components/MatchScoreBadge';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { data: recJobsData, isLoading: recsLoading } = useQuery({
    queryKey: ['recommendedJobs'],
    queryFn: async () => {
      const res = await fetch('/api/v1/jobs/recommended');
      return res.json();
    },
  });

  const { data: marketData } = useQuery({
    queryKey: ['marketOverview'],
    queryFn: async () => {
      const res = await fetch('/api/v1/market/overview');
      return res.json();
    },
  });

  const { data: gapsData } = useQuery({
    queryKey: ['careerGaps'],
    queryFn: async () => {
      const res = await fetch('/api/v1/career/gaps');
      return res.json();
    },
  });

  const recJobs = recJobsData?.data || [];
  const market = marketData?.data;
  const gaps = gapsData?.data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600 text-white rounded-2xl p-8 shadow-lg shadow-brand-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Market Intelligence Active</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome back, Demo Candidate!</h1>
          <p className="text-brand-100 text-sm mt-1 max-w-xl">
            You match <strong className="text-white font-bold">{recJobs.length} top jobs</strong> in current market data. Your target role readiness score is <strong className="text-white font-bold">{gaps?.readinessScore || 78}%</strong>.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/jobs" className="bg-white text-brand-700 hover:bg-slate-50 font-bold px-5 py-2.5 rounded-xl shadow-sm text-sm transition-all">
            Explore Jobs
          </Link>
          <Link to="/career" className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all">
            View Skill Gaps
          </Link>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="card-light p-5 border-l-4 border-l-brand-600">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Career Readiness</span>
            <Target className="w-5 h-5 text-brand-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{gaps?.readinessScore || 78}%</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+4% this week</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Target: Full Stack Developer</p>
        </div>

        <div className="card-light p-5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Matched Jobs</span>
            <Briefcase className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{recJobs.length || 14}</span>
            <span className="text-xs font-medium text-slate-500">active listings</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Avg match score: 86%</p>
        </div>

        <div className="card-light p-5 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Tracked Skills</span>
            <Award className="w-5 h-5 text-violet-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{market?.totalSkillsTracked || 65}</span>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+28% growth</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Top: TypeScript, Next.js</p>
        </div>

        <div className="card-light p-5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Remote Share</span>
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{market?.remotePercentage || 38}%</span>
            <span className="text-xs font-medium text-slate-500">of active postings</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Median Salary: ₹15.0 LPA</p>
        </div>
      </div>

      {/* Main Grid: Recommended Jobs & Market Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recommended Jobs (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Top Recommended Jobs</h2>
              <p className="text-xs text-slate-500">Ranked deterministically based on skill & location alignment</p>
            </div>
            <Link to="/jobs" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View all <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recsLoading ? (
            <div className="p-8 text-center text-slate-400 text-sm card-light">Loading recommendations...</div>
          ) : (
            <div className="space-y-3.5">
              {recJobs.slice(0, 4).map((job: any) => (
                <div key={job.id} className="card-light p-5 hover:border-brand-300 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base hover:text-brand-600 transition-colors">
                        <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                      </h3>
                      <MatchScoreBadge score={job.matchScore} />
                      {job.isSynthetic && <SyntheticBadge />}
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                      <span className="font-semibold text-slate-700">{job.companyName}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                      <span>₹{(job.salaryMin / 100000).toFixed(1)} - {(job.salaryMax / 100000).toFixed(1)} LPA</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {job.skills?.slice(0, 5).map((skill: string) => (
                        <span key={skill} className="bg-slate-100 text-slate-700 text-[11px] font-medium px-2.5 py-0.5 rounded-md">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link to={`/jobs/${job.id}`} className="btn-secondary text-xs shrink-0 self-stretch md:self-auto justify-center">
                    Inspect Match
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar: Skill Gaps & Trending Skills */}
        <div className="space-y-6">
          {/* Priority Skill Gaps */}
          <div className="card-light p-5">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>Priority Skill Gaps</span>
              <span className="text-xs text-brand-600 font-medium">Gap Engine</span>
            </h3>
            <div className="space-y-2.5">
              {gaps?.requiredGaps?.slice(0, 3).map((skill: string) => (
                <div key={skill} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{skill}</p>
                    <p className="text-[11px] text-slate-500">High demand in {gaps.targetRole}</p>
                  </div>
                  <Link to="/roadmap" className="text-[11px] font-semibold text-brand-600 hover:underline">
                    Add to Roadmap
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Top Trending Skills */}
          <div className="card-light p-5">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center justify-between">
              <span>Trending Market Skills</span>
              <SyntheticBadge />
            </h3>
            <div className="space-y-2 text-xs">
              {market?.topGrowingSkills?.slice(0, 4).map((item: any) => (
                <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-none">
                  <span className="font-medium text-slate-800">{item.name}</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+{item.growthRate}% YoY</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
