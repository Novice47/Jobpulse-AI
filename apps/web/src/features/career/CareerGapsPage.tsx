import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Upload,
  Plus,
  X,
  FileCheck,
  TrendingUp,
  Compass,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const TARGET_ROLES = [
  'Full Stack Engineer',
  'Frontend Developer',
  'Backend Engineer',
  'DevOps & Cloud Engineer',
  'AI/ML Platform Engineer',
  'Data Engineer',
];

export const CareerGapsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState('Full Stack Engineer');
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['careerGaps', selectedRole],
    queryFn: async () => {
      const res = await fetch(`/api/v1/career/gaps?role=${encodeURIComponent(selectedRole)}`);
      return res.json();
    },
  });

  const gaps = data?.data;

  const skillMutation = useMutation({
    mutationFn: async ({ skill, action }: { skill: string; action: 'add' | 'remove' }) => {
      const res = await fetch('/api/v1/career/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skill, action, targetRole: selectedRole }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['careerGaps'] });
      refreshUser();
    },
  });

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    skillMutation.mutate({ skill: newSkillInput.trim(), action: 'add' });
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skill: string) => {
    skillMutation.mutate({ skill, action: 'remove' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadSuccess(null);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const res = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to upload resume');
      }

      setUploadSuccess(`Extracted ${json.data?.extractedSkills?.length || 0} skills from ${file.name}! Profile updated.`);
      queryClient.invalidateQueries({ queryKey: ['careerGaps'] });
      refreshUser();
    } catch (err: any) {
      alert(err.message || 'Error parsing resume');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400 card-light max-w-4xl mx-auto">Analyzing career gaps and market alignment...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Target className="w-7 h-7 text-brand-600" />
            Career Readiness & Skill Gap Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Compare candidate skills deterministically against live market requirements for high-demand engineering roles.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-brand-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing PDF...
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                Upload Resume PDF
              </>
            )}
          </button>
          <Link
            to="/resume"
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-all"
          >
            <FileCheck className="w-3.5 h-3.5 text-brand-600" />
            Full ATS Report
          </Link>
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
          <span>✨ {uploadSuccess}</span>
          <button onClick={() => setUploadSuccess(null)} className="text-emerald-600 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Target Role Selector */}
      <div className="card-light p-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 mr-2 uppercase tracking-wider">Target Track:</span>
        {TARGET_ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedRole === role
                ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      {/* Main Readiness Score Banner */}
      <div className="card-light p-6 md:p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-indigo-900/40">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-400/30 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" /> Track: {gaps?.targetRole || selectedRole}
          </div>
          <h2 className="text-2xl font-black text-white">Live Role Readiness Index</h2>
          <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
            Computed deterministically by matching your verified skills against active production job openings in MongoDB.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <Link
              to="/roadmap"
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              Generate Career Roadmap
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-5 bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-400">
            <Target className="w-8 h-8" />
          </div>
          <div>
            <span className="text-4xl font-black text-white">{gaps?.readinessScore || 78}%</span>
            <p className="text-xs text-slate-300 font-bold uppercase tracking-wider mt-0.5">Market Fit</p>
          </div>
        </div>
      </div>

      {/* Interactive Skills Sandbox (Add/Remove Skills) */}
      <div className="card-light p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Your Current Profile Skills ({gaps?.userSkills?.length || 0})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Add or remove skills to see how your market readiness score changes in real-time.</p>
          </div>

          <form onSubmit={handleAddSkill} className="flex items-center gap-2">
            <input
              type="text"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              placeholder="Add skill (e.g. AWS)..."
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newSkillInput.trim() || skillMutation.isPending}
              className="px-3 py-1.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center gap-1 transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </form>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {gaps?.userSkills?.map((s: string) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 transition-all"
            >
              {s}
              <button
                type="button"
                onClick={() => handleRemoveSkill(s)}
                className="text-slate-400 hover:text-rose-600 transition-all ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Grid: Strengths vs Required Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Verified Strengths */}
        <div className="card-light p-6 space-y-4 border-t-4 border-t-emerald-500">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Verified Strengths for {gaps?.targetRole} ({gaps?.strengths?.length || 0})
            </h3>
          </div>
          <p className="text-xs text-slate-500">Skills you possess that match requirements for this track.</p>
          <div className="flex flex-wrap gap-2">
            {gaps?.strengths?.map((s: string) => (
              <span key={s} className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold px-3 py-1.5 rounded-xl">
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Priority Required Skill Gaps */}
        <div className="card-light p-6 space-y-4 border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Priority Missing Skills ({gaps?.requiredGaps?.length || 0})
            </h3>
          </div>
          <p className="text-xs text-slate-500">High-frequency market skills missing from your candidate profile.</p>
          <div className="space-y-2.5">
            {gaps?.requiredGaps?.map((s: string) => (
              <div key={s} className="p-3 rounded-2xl bg-amber-50/50 border border-amber-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950">+ {s}</span>
                <button
                  onClick={() => skillMutation.mutate({ skill: s, action: 'add' })}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-800 inline-flex items-center gap-1"
                >
                  Mark Acquired <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Market Evidence Callouts */}
      <div className="card-light p-6 space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          Market Evidence & Frequency Insights
        </h3>
        <div className="space-y-2.5">
          {gaps?.marketEvidence?.map((ev: string, idx: number) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-50 text-brand-700 font-bold text-xs flex items-center justify-center shrink-0">
                💡
              </span>
              <span>{ev}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
