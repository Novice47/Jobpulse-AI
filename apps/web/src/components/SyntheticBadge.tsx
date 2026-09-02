import React from 'react';
import { Database } from 'lucide-react';

interface Props {
  className?: string;
}

export const SyntheticBadge: React.FC<Props> = ({ className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/80 px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      title="This record is part of the synthetic demo dataset and is clearly labeled."
    >
      <Database className="w-3 h-3 text-amber-600" />
      SYNTHETIC DEMO DATA
    </span>
  );
};
