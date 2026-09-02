import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileCheck,
  Zap,
  Trash2,
  RefreshCw,
  PlusCircle,
  Check,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ResumePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [appliedToProfile, setAppliedToProfile] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const { data: pastResumes, refetch } = useQuery({
    queryKey: ['pastResumes'],
    queryFn: async () => {
      const res = await fetch('/api/v1/resumes');
      return res.json();
    },
  });

  useEffect(() => {
    if (analysisResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [analysisResult]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setErrorMsg(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMsg(null);
    }
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setUploading(true);
    setAppliedToProfile(false);

    try {
      const formData = new FormData();
      if (activeTab === 'upload' && file) {
        formData.append('resume', file);
      } else if (activeTab === 'paste' && resumeText.trim()) {
        formData.append('text', resumeText.trim());
      } else {
        throw new Error('Please select a resume file or paste your resume text');
      }

      const res = await fetch('/api/v1/resumes/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to analyze resume');
      }

      setAnalysisResult(json.data);
      refreshUser();
      refetch();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading and analyzing resume');
    } finally {
      setUploading(false);
    }
  };

  const handleApplyToProfile = async () => {
    if (!analysisResult?.id) return;
    try {
      const res = await fetch(`/api/v1/resumes/${analysisResult.id}/apply-to-profile`, {
        method: 'POST',
      });
      const json = await res.json();
      if (json.success) {
        setAppliedToProfile(true);
        refreshUser();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <FileCheck className="w-7 h-7 text-brand-600" />
          AI Resume & ATS Optimizer
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload your resume in PDF format or paste plain text to extract skills, compute ATS keyword score, and receive targeted improvements.
        </p>
      </div>

      {/* Upload / Input Card */}
      <div className="card-light p-6 md:p-8 space-y-6">
        {/* Method Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl max-w-xs">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload PDF / Doc
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'paste' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Paste Text
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-5">
          {activeTab === 'upload' ? (
            <div>
              {file ? (
                <div className="p-6 rounded-2xl border-2 border-brand-200 bg-brand-50/40 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-10 border-2 border-dashed rounded-3xl text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-brand-500 bg-brand-50/60'
                      : 'border-slate-200 hover:border-brand-400 hover:bg-slate-50/60 bg-slate-50/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,.md"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-sm text-slate-900">Click to upload or drag & drop your resume</p>
                  <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, TXT (up to 10MB)</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste your complete resume or CV text here (Summary, Skills, Education, Experience)..."
                className="w-full h-44 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none text-xs font-mono leading-relaxed resize-y"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={uploading || (activeTab === 'upload' && !file) || (activeTab === 'paste' && !resumeText.trim())}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 active:scale-95 transition-all disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Extracting Skills & Computing ATS Score...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Resume & Compute ATS
              </>
            )}
          </button>
        </form>
      </div>

      {/* Analysis Results View */}
      {analysisResult && (
        <div ref={resultRef} className="card-light p-6 md:p-8 space-y-8 border-l-4 border-l-brand-600 animate-in fade-in duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold mb-2">
                <CheckCircle className="w-3.5 h-3.5" /> Resume Analysis & Extraction Complete
              </div>
              <h3 className="font-extrabold text-xl text-slate-900">
                Evaluation for {analysisResult.extractedName || 'Candidate Profile'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Extracted structured skills, computed ATS compatibility score, and generated actionable recommendations.
              </p>
            </div>

            {/* Score Cards */}
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200 text-center min-w-[110px]">
                <span className="text-3xl font-black text-brand-600">{analysisResult.atsScore}%</span>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">ATS Score</p>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center min-w-[110px]">
                <span className="text-3xl font-black text-emerald-600">{analysisResult.roleAlignmentScore}%</span>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-0.5">Alignment</p>
              </div>
            </div>
          </div>

          {/* Sync Skills to Profile Banner */}
          <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-brand-600 shrink-0" />
              <div>
                <p className="font-bold text-xs text-slate-900">Auto-Synced to Candidate Profile</p>
                <p className="text-[11px] text-slate-600">All {analysisResult.extractedSkills?.length || 0} identified skills are synced to your MongoDB profile to update job recommendations & gap scores.</p>
              </div>
            </div>
            <button
              onClick={handleApplyToProfile}
              disabled={appliedToProfile}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 ${
                appliedToProfile
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20'
              }`}
            >
              {appliedToProfile ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Synced to Profile!
                </>
              ) : (
                <>
                  <PlusCircle className="w-3.5 h-3.5" />
                  Re-Sync Profile
                </>
              )}
            </button>
          </div>

          {/* Extracted Skills */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-brand-600" />
              Identified Technical Skills ({analysisResult.extractedSkills?.length || 0})
            </h4>
            <div className="flex flex-wrap gap-2">
              {analysisResult.extractedSkills?.map((s: string) => (
                <span key={s} className="bg-brand-50/70 hover:bg-brand-100 text-brand-900 border border-brand-200 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Education & Experience Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Education */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Detected Education & Qualifications
              </h4>
              <div className="space-y-2">
                {analysisResult.education?.map((edu: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800">
                    {edu}
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Detected Experience Highlights
              </h4>
              <div className="space-y-2">
                {analysisResult.experience?.map((exp: string, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 leading-relaxed">
                    {exp}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Missing Skills */}
          {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                Recommended Skills to Add for Higher ATS Matching
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.missingSkills.map((s: string) => (
                  <span key={s} className="bg-amber-50 text-amber-900 border border-amber-200 text-xs font-semibold px-3 py-1.5 rounded-xl">
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Suggestions */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              Actionable ATS & Content Improvements
            </h4>
            <div className="space-y-2.5">
              {analysisResult.suggestions?.map((sug: string, idx: number) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{sug}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Previous Uploads History */}
      {pastResumes?.data && pastResumes.data.length > 0 && (
        <div className="card-light p-6 space-y-4">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-brand-600" />
            Previous Resume Uploads & ATS Reports
          </h3>
          <div className="divide-y divide-slate-100">
            {pastResumes.data.map((r: any) => (
              <div key={r.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{r.extractedName || 'Candidate Resume'}</p>
                  <p className="text-[11px] text-slate-500">
                    {new Date(r.uploadedAt).toLocaleDateString()} • {r.extractedSkills?.length || 0} skills detected
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                    ATS: {r.atsScore}%
                  </span>
                  <button
                    onClick={() => setAnalysisResult(r)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 font-semibold transition-all"
                  >
                    View Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
