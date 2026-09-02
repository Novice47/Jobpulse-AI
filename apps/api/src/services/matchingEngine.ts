import { MatchResult, ExperienceLevel } from '@jobpulse/shared-types';
import { normalizeSkills } from './skillNormalizer.js';

interface ProfileInput {
  skills: string[];
  experienceLevel: ExperienceLevel;
  targetRoles: string[];
  preferredLocations: string[];
  remotePreference: string;
  salaryExpectation?: number;
  yearsOfExperience?: number;
}

interface JobInput {
  title: string;
  normalizedTitle: string;
  skills: string[];
  requirements?: string[];
  experienceLevel: ExperienceLevel;
  location: string;
  remoteType: string;
  salaryMin?: number;
  salaryMax?: number;
}

const EXPERIENCE_HIERARCHY: Record<ExperienceLevel, number> = {
  ENTRY: 1,
  MID: 2,
  SENIOR: 3,
  LEAD: 4,
  EXECUTIVE: 5,
};

export function calculateJobMatch(profile: ProfileInput, job: JobInput): MatchResult {
  const userSkillsNormalized = normalizeSkills(profile.skills);
  const jobSkillsNormalized = normalizeSkills(job.skills);

  const userSkillSet = new Set(userSkillsNormalized.map((s) => s.toLowerCase()));

  // 1. Skill Score (45% required, 15% preferred)
  const matchedSkills: string[] = [];
  const missingRequiredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];

  for (const jobSkill of jobSkillsNormalized) {
    if (userSkillSet.has(jobSkill.toLowerCase())) {
      matchedSkills.push(jobSkill);
    } else {
      missingRequiredSkills.push(jobSkill);
    }
  }

  const skillScoreRaw =
    jobSkillsNormalized.length > 0
      ? (matchedSkills.length / jobSkillsNormalized.length) * 100
      : 100;
  const skillWeightedScore = skillScoreRaw * 0.60; // 60% total weight for skills (45% req + 15% pref)

  // 2. Experience Score (15%)
  const userExpLevel = EXPERIENCE_HIERARCHY[profile.experienceLevel] || 2;
  const jobExpLevel = EXPERIENCE_HIERARCHY[job.experienceLevel] || 2;

  let experienceScoreRaw = 100;
  if (userExpLevel < jobExpLevel) {
    const diff = jobExpLevel - userExpLevel;
    experienceScoreRaw = Math.max(20, 100 - diff * 35);
  } else if (userExpLevel > jobExpLevel + 1) {
    // slightly overqualified
    experienceScoreRaw = 85;
  }
  const experienceWeightedScore = experienceScoreRaw * 0.15;

  // 3. Location & Remote Score (10%)
  let locationScoreRaw = 50;
  const userLocs = (profile.preferredLocations || []).map((l) => l.toLowerCase());
  const jobLoc = job.location.toLowerCase();

  const isMatchedLoc = userLocs.some((l) => jobLoc.includes(l) || l.includes(jobLoc));
  if (isMatchedLoc || profile.remotePreference === 'ANY') {
    locationScoreRaw = 100;
  } else if (job.remoteType === 'REMOTE' && (profile.remotePreference === 'REMOTE' || profile.remotePreference === 'ANY')) {
    locationScoreRaw = 100;
  } else if (job.remoteType === 'HYBRID') {
    locationScoreRaw = 75;
  }
  const locationWeightedScore = locationScoreRaw * 0.10;

  // 4. Role Similarity Score (10%)
  let roleScoreRaw = 40;
  const targetRoles = (profile.targetRoles || []).map((r) => r.toLowerCase());
  const jobTitleClean = job.title.toLowerCase();

  const isMatchedRole = targetRoles.some((tr) => jobTitleClean.includes(tr) || tr.includes(jobTitleClean));
  if (isMatchedRole) {
    roleScoreRaw = 100;
  }
  const roleWeightedScore = roleScoreRaw * 0.10;

  // 5. Salary Score (5%)
  let salaryScoreRaw = 100;
  if (profile.salaryExpectation && profile.salaryExpectation > 0 && job.salaryMax && job.salaryMax > 0) {
    if (job.salaryMax >= profile.salaryExpectation) {
      salaryScoreRaw = 100;
    } else {
      const ratio = job.salaryMax / profile.salaryExpectation;
      salaryScoreRaw = Math.max(30, Math.round(ratio * 100));
    }
  }
  const salaryWeightedScore = salaryScoreRaw * 0.05;

  // Total weighted score
  const overallScore = Math.round(
    skillWeightedScore + experienceWeightedScore + locationWeightedScore + roleWeightedScore + salaryWeightedScore
  );

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    skillScore: Math.round(skillScoreRaw),
    experienceScore: Math.round(experienceScoreRaw),
    locationScore: Math.round(locationScoreRaw),
    salaryScore: Math.round(salaryScoreRaw),
    roleScore: Math.round(roleScoreRaw),
    matchedSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    explanation: `Deterministic Match Score: ${overallScore}%. Matched ${matchedSkills.length} of ${jobSkillsNormalized.length} key skills.`,
  };
}
