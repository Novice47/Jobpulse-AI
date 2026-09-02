import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Save, Sparkles, Check, User, MapPin, DollarSign, Briefcase, GraduationCap } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();

  const [name, setName] = useState(profile?.name || user?.name || '');
  const [currentRole, setCurrentRole] = useState(profile?.currentRole || 'Software Engineer');
  const [targetRoles, setTargetRoles] = useState(profile?.targetRoles?.join(', ') || 'Full Stack Developer, Frontend Engineer');
  const [skills, setSkills] = useState(profile?.skills?.join(', ') || 'React, TypeScript, Node.js, MongoDB');
  const [experienceLevel, setExperienceLevel] = useState<any>(profile?.experienceLevel || 'MID');
  const [yearsOfExperience, setYearsOfExperience] = useState(profile?.yearsOfExperience || 3);
  const [preferredLocations, setPreferredLocations] = useState(profile?.preferredLocations?.join(', ') || 'Bangalore, Remote');
  const [remotePreference, setRemotePreference] = useState<any>(profile?.remotePreference || 'ANY');
  const [salaryExpectation, setSalaryExpectation] = useState(profile?.salaryExpectation || 1500000);
  const [education, setEducation] = useState(profile?.education || 'Bachelor of Technology');

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || user?.name || '');
      setCurrentRole(profile.currentRole || '');
      setTargetRoles(profile.targetRoles?.join(', ') || '');
      setSkills(profile.skills?.join(', ') || '');
      setExperienceLevel(profile.experienceLevel || 'MID');
      setYearsOfExperience(profile.yearsOfExperience || 0);
      setPreferredLocations(profile.preferredLocations?.join(', ') || '');
      setRemotePreference(profile.remotePreference || 'ANY');
      setSalaryExpectation(profile.salaryExpectation || 0);
      setEducation(profile.education || '');
    }
  }, [profile, user]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name,
        currentRole,
        targetRoles: targetRoles.split(',').map((s) => s.trim()).filter(Boolean),
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        experienceLevel,
        yearsOfExperience: Number(yearsOfExperience),
        preferredLocations: preferredLocations.split(',').map((s) => s.trim()).filter(Boolean),
        remotePreference,
        salaryExpectation: Number(salaryExpectation),
        education,
      });
      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Manage Candidate Profile</h2>
              <p className="text-xs text-slate-500">Updates will sync in MongoDB and recompute job matches & analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Role / Title</label>
              <input
                type="text"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Target Roles (comma-separated)</label>
              <input
                type="text"
                value={targetRoles}
                onChange={(e) => setTargetRoles(e.target.value)}
                placeholder="Full Stack Developer, Lead Backend Engineer, Solution Architect"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Skills Arsenal (comma-separated)</label>
              <input
                type="text"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="React, TypeScript, Node.js, MongoDB, Redis, Docker, AWS"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl"
              >
                <option value="ENTRY">Entry (0-2 years)</option>
                <option value="MID">Mid Level (2-5 years)</option>
                <option value="SENIOR">Senior (5-8 years)</option>
                <option value="LEAD">Lead / Staff (8+ years)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Years of Experience</label>
              <input
                type="number"
                value={yearsOfExperience}
                onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Locations</label>
              <input
                type="text"
                value={preferredLocations}
                onChange={(e) => setPreferredLocations(e.target.value)}
                placeholder="Bangalore, Remote, Hyderabad"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Remote Preference</label>
              <select
                value={remotePreference}
                onChange={(e) => setRemotePreference(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl"
              >
                <option value="ANY">Any / Flexible</option>
                <option value="REMOTE">100% Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expected Salary (INR / Annum)</label>
              <input
                type="number"
                step="50000"
                value={salaryExpectation}
                onChange={(e) => setSalaryExpectation(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Education / Degree</label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white focus:outline-none rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold flex items-center gap-2 shadow-md shadow-brand-500/25 active:scale-95 transition-all"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved to MongoDB!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Profile
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
