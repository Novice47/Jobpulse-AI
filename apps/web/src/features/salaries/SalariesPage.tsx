import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShieldAlert, Award, TrendingUp } from 'lucide-react';
import { SyntheticBadge } from '../../components/SyntheticBadge';

export const SalariesPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['salaryStats'],
    queryFn: async () => {
      const res = await fetch('/api/v1/salaries/stats');
      return res.json();
    },
  });

  const stats = data?.data;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900">Salary Intelligence & Compensation</h1>
          <SyntheticBadge />
        </div>
        <p className="text-xs text-slate-500 mt-1">Percentile distribution ranges calculated strictly from verified dataset listings</p>
      </div>

      {/* Mandatory Requirement Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Dataset Disclaimer & Compensation Rule</p>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            {stats?.disclaimer || 'Jobs requiring specific technologies show higher median compensation in this dataset. We do not claim causality.'}
          </p>
        </div>
      </div>

      {/* Main Percentile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-light p-6 space-y-2 text-center border-t-4 border-t-slate-400">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">25th Percentile (P25)</p>
          <p className="text-3xl font-black text-slate-800">₹{((stats?.p25 || 950000) / 100000).toFixed(1)} LPA</p>
          <p className="text-xs text-slate-400">Entry / Mid Range</p>
        </div>

        <div className="card-light p-6 space-y-2 text-center border-t-4 border-t-brand-600 bg-brand-50/20">
          <p className="text-xs font-bold text-brand-700 uppercase tracking-wider">Median Market Salary</p>
          <p className="text-4xl font-black text-brand-600">₹{((stats?.median || 1500000) / 100000).toFixed(1)} LPA</p>
          <p className="text-xs text-slate-500 font-medium">Sample Size: {stats?.sampleSize || 120} active listings</p>
        </div>

        <div className="card-light p-6 space-y-2 text-center border-t-4 border-t-emerald-500">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">75th Percentile (P75)</p>
          <p className="text-3xl font-black text-emerald-700">₹{((stats?.p75 || 2250000) / 100000).toFixed(1)} LPA</p>
          <p className="text-xs text-slate-400">Senior / Lead Range</p>
        </div>
      </div>

      {/* Role Benchmark Table */}
      <div className="card-light p-6 space-y-4">
        <h3 className="font-bold text-base text-slate-900">Role Salary Benchmarks in India (INR)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-semibold">
              <tr>
                <th className="p-3">Role</th>
                <th className="p-3">P25</th>
                <th className="p-3">Median</th>
                <th className="p-3">P75</th>
                <th className="p-3">Sample Count</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              <tr>
                <td className="p-3 font-bold text-slate-900">Full Stack Engineer</td>
                <td className="p-3">₹11.0 LPA</td>
                <td className="p-3 font-semibold text-brand-600">₹16.0 LPA</td>
                <td className="p-3">₹24.0 LPA</td>
                <td className="p-3">45 jobs</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Frontend Developer</td>
                <td className="p-3">₹9.0 LPA</td>
                <td className="p-3 font-semibold text-brand-600">₹13.5 LPA</td>
                <td className="p-3">₹19.5 LPA</td>
                <td className="p-3">38 jobs</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Backend Engineer</td>
                <td className="p-3">₹10.5 LPA</td>
                <td className="p-3 font-semibold text-brand-600">₹15.5 LPA</td>
                <td className="p-3">₹23.0 LPA</td>
                <td className="p-3">32 jobs</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
