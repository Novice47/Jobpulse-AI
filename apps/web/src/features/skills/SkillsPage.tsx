import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, TrendingUp, Search, ArrowRight } from 'lucide-react';
import { SyntheticBadge } from '../../components/SyntheticBadge';
import { Link } from 'react-router-dom';

export const SkillsPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['skills', search],
    queryFn: async () => {
      const res = await fetch(`/api/v1/skills?search=${encodeURIComponent(search)}`);
      return res.json();
    },
  });

  const skills = data?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Skill Intelligence & Demand</h1>
            <SyntheticBadge />
          </div>
          <p className="text-xs text-slate-500 mt-1">Track technology growth rates, job counts, and canonical alias mappings</p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skills (e.g. React, Docker)..."
            className="input-light pl-9 w-full"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 card-light">Loading skill data...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {skills.map((skill: any) => (
            <div key={skill.id} className="card-light p-5 space-y-3 hover:border-brand-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Award className="w-4 h-4 text-brand-600" />
                    {skill.name}
                  </h3>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +{skill.growthRate}%
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Category: {skill.category}</p>

                {skill.aliases?.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">Aliases:</span>
                    <span>{skill.aliases.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">{skill.demandCount} Active Job Postings</span>
                <Link to={`/skills/${skill.id}`} className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
