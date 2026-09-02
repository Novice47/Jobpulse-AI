import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building2, Search, TrendingUp, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CompaniesPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['companies', search],
    queryFn: async () => {
      const res = await fetch(`/api/v1/companies?search=${encodeURIComponent(search)}`);
      return res.json();
    },
  });

  const companies = data?.data || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-brand-600" />
            Top Tech Companies & Employers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore hiring velocity, verified corporate profiles, and active engineering openings across leading organizations.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies (e.g. Google, Stripe)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl text-xs"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs card-light flex flex-col items-center justify-center gap-2">
          <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
          Loading verified employers...
        </div>
      ) : companies.length === 0 ? (
        <div className="p-16 text-center card-light space-y-2">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-sm">No companies found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((c: any) => (
            <div
              key={c.id}
              className="card-light p-6 space-y-4 hover:border-brand-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-md">
                    {c.name.slice(0, 2).toUpperCase()}
                  </div>
                  {c.verified && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Verified Tech Employer
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-slate-900 text-lg pt-1 group-hover:text-brand-600 transition-colors">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">{c.industry}</p>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  Leading global innovator actively recruiting top engineering and product talent.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-base font-extrabold text-slate-900">{c.activeJobCount}</span>
                  <span className="text-xs text-slate-500 font-medium ml-1.5">Openings</span>
                </div>
                <Link
                  to={`/jobs?query=${encodeURIComponent(c.name)}`}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-50 group-hover:bg-brand-50 group-hover:text-brand-700 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  View Jobs <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
