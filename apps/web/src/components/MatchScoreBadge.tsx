import React from 'react';
import { Target } from 'lucide-react';

interface Props {
  score?: number;
}

export const MatchScoreBadge: React.FC<Props> = ({ score }) => {
  if (score === undefined || score === null) return null;

  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  if (score < 60) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (score < 80) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
  }

  return (
    <span className={`inline-flex items-center gap-1 border px-2.5 py-1 rounded-lg text-xs font-semibold ${colorClasses}`}>
      <Target className="w-3.5 h-3.5" />
      {score}% Match
    </span>
  );
};
