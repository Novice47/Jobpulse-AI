import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Award, DollarSign, Building2, MapPin } from 'lucide-react';
import { SyntheticBadge } from '../../components/SyntheticBadge';

const COLORS = ['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe'];

export const MarketPage: React.FC = () => {
  const [period, setPeriod] = useState('30d');

  const { data, isLoading } = useQuery({
    queryKey: ['marketOverview', period],
    queryFn: async () => {
      const res = await fetch(`/api/v1/market/overview?period=${period}`);
      return res.json();
    },
  });

  const market = data?.data;

  const topSkillsChart = market?.topSkills?.map((s: any) => ({
    name: s.name,
    demand: s.count,
  })) || [
    { name: 'React', demand: 142 },
    { name: 'Python', demand: 135 },
    { name: 'Node.js', demand: 128 },
    { name: 'TypeScript', demand: 115 },
    { name: 'AWS', demand: 104 },
    { name: 'MongoDB', demand: 94 },
  ];

  const remotePieData = [
    { name: 'Remote Jobs', value: market?.remotePercentage || 38 },
    { name: 'On-Site / Hybrid', value: 100 - (market?.remotePercentage || 38) },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Job Market Intelligence</h1>
            <SyntheticBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">Aggregated job metrics, skill demand growth, and remote work distributions</p>
        </div>

        <div className="flex items-center gap-2">
          {['7d', '30d', '90d', '180d', '365d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="card-light p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Active Jobs</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{market?.totalJobs || 1250}</p>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 inline-block">
            +18% growth
          </span>
        </div>

        <div className="card-light p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Remote Work Share</p>
          <p className="text-3xl font-extrabold text-brand-600 mt-2">{market?.remotePercentage || 38}%</p>
          <span className="text-xs font-medium text-slate-500 mt-2 inline-block">High flexibility</span>
        </div>

        <div className="card-light p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Median Market Salary</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            ₹{((market?.salaryStats?.median || 1500000) / 100000).toFixed(1)} LPA
          </p>
          <span className="text-xs font-medium text-slate-500 mt-2 inline-block">75th percentile: ₹22.5 LPA</span>
        </div>

        <div className="card-light p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracked Tech Skills</p>
          <p className="text-3xl font-extrabold text-violet-600 mt-2">{market?.totalSkillsTracked || 65}</p>
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md mt-2 inline-block">
            Top: TypeScript (+26%)
          </span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bar Chart: Top Skill Demand */}
        <div className="lg:col-span-2 card-light p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Top In-Demand Skills</h3>
              <p className="text-xs text-slate-500">Total job count requiring technology</p>
            </div>
            <Award className="w-5 h-5 text-brand-600" />
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkillsChart}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="demand" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Remote Share */}
        <div className="card-light p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Remote vs On-Site Share</h3>
            <p className="text-xs text-slate-500">Distribution across active postings</p>
          </div>

          <div className="h-56 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={remotePieData} innerRadius={55} outerRadius={80} dataKey="value">
                  {remotePieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span className="w-3 h-3 rounded-full bg-brand-600"></span> Remote Jobs
              </span>
              <span className="font-bold text-slate-900">{market?.remotePercentage || 38}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium text-slate-700">
                <span className="w-3 h-3 rounded-full bg-indigo-400"></span> On-Site / Hybrid
              </span>
              <span className="font-bold text-slate-900">{100 - (market?.remotePercentage || 38)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
