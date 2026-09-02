import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, CheckCircle, Clock, ExternalLink, Sparkles, BookOpen } from 'lucide-react';

export const RoadmapPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState('Full Stack Developer');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['roadmap', targetRole],
    queryFn: async () => {
      const res = await fetch('/api/v1/career/roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetRole }),
      });
      return res.json();
    },
  });

  const roadmap = data?.data;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Personalized Career Roadmap</h1>
          <p className="text-xs text-slate-500 mt-1">Generated step-by-step learning sequence referencing verified database resources</p>
        </div>

        <select
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
          className="input-light text-xs font-semibold py-2"
        >
          <option value="Full Stack Developer">Target: Full Stack Developer</option>
          <option value="Frontend Developer">Target: Frontend Developer</option>
          <option value="Backend Engineer">Target: Backend Engineer</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-slate-400 card-light">Generating roadmap steps...</div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200">
          {roadmap?.steps?.map((step: any, idx: number) => (
            <div key={step.id} className="relative pl-12">
              <div className="absolute left-2.5 top-1.5 -translate-x-1/2 w-6 h-6 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                {idx + 1}
              </div>

              <div className="card-light p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-slate-900 text-lg">{step.skillName}</h3>
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                        step.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {step.priority} PRIORITY
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Estimated Effort: {step.estimatedHours} hours
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 text-xs text-slate-700">
                  <span className="font-bold text-slate-900">Project Idea: </span>
                  {step.projectIdea}
                </div>

                {step.resources?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-brand-600" /> Database Verified Learning Links:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {step.resources.map((r: any) => (
                        <a
                          key={r.id}
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                        >
                          {r.title} ({r.provider}) <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
