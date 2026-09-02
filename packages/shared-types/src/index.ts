export interface User {
  id: string;
  githubId?: string;
  email: string;
  name: string;
  username: string;
  avatar: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string;
  education: string;
  degree: string;
  graduationYear?: number;
  experienceLevel: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';
  currentRole: string;
  targetRoles: string[];
  skills: string[];
  preferredLocations: string[];
  remotePreference: 'REMOTE' | 'HYBRID' | 'ON_SITE' | 'ANY';
  salaryExpectation: number;
  industries: string[];
  yearsOfExperience: number;
  profileVisibility: 'PUBLIC' | 'PRIVATE';
  profileCompleteness: number; // 0 to 100
  updatedAt: string;
}

export interface Skill {
  id: string;
  name: string;
  slug: string;
  category: string;
  demandCount: number;
  growthRate: number;
  isSynthetic: boolean;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  website?: string;
  industry: string;
  description: string;
  locations: string[];
  activeJobCount: number;
  hiringTrend: number; // growth percentage
  verified: boolean;
  isSynthetic: boolean;
}

export interface Role {
  id: string;
  title: string;
  slug: string;
  category: string;
  demandCount: number;
  avgSalary: number;
  description: string;
}

export interface Location {
  id: string;
  city: string;
  state?: string;
  country: string;
  normalizedName: string;
  timezone?: string;
  activeJobsCount: number;
  remoteShare: number;
}

export type RemoteType = 'REMOTE' | 'HYBRID' | 'ON_SITE';
export type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE';

export interface Job {
  id: string;
  externalId?: string;
  source: string;
  title: string;
  normalizedTitle: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  country: string;
  city: string;
  remoteType: RemoteType;
  employmentType: EmploymentType;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  experienceLevel: ExperienceLevel;
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits: string[];
  skills: string[];
  postedDate: string;
  closingDate?: string;
  applicationUrl: string;
  status: 'ACTIVE' | 'CLOSED';
  isSynthetic: boolean;
  matchScore?: number;
  createdAt: string;
}

export interface MatchResult {
  overallScore: number; // 0 - 100
  skillScore: number;
  experienceScore: number;
  locationScore: number;
  salaryScore: number;
  roleScore: number;
  matchedSkills: string[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  explanation?: string;
}

export interface MarketSnapshot {
  id: string;
  timestamp: string;
  totalJobs: number;
  remotePercentage: number;
  period: '7d' | '30d' | '90d' | '180d' | '365d';
  topRoles: { role: string; count: number; growthRate: number }[];
  topSkills: { skill: string; count: number; growthRate: number }[];
  salaryStats: { median: number; p25: number; p75: number };
  locationStats: { location: string; count: number }[];
  isSynthetic: boolean;
}

export interface SalaryMetric {
  role: string;
  location: string;
  experienceLevel: ExperienceLevel;
  sampleSize: number;
  median: number;
  p25: number;
  p75: number;
  min: number;
  max: number;
  currency: string;
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  uploadedAt: string;
  fileUrl?: string;
  extractedName?: string;
  education: string[];
  experience: string[];
  extractedSkills: string[];
  roleAlignmentScore: number;
  missingSkills: string[];
  suggestions: string[];
  atsScore: number;
  isSynthetic: boolean;
}

export interface JobDescriptionAnalysis {
  id: string;
  title: string;
  seniority: ExperienceLevel;
  requiredSkills: string[];
  preferredSkills: string[];
  responsibilities: string[];
  salaryEstimate?: string;
  summaryExplanation: string;
}

export interface CareerGap {
  targetRole: string;
  readinessScore: number; // 0 to 100
  strengths: string[];
  requiredGaps: string[];
  preferredGaps: string[];
  prioritySkills: string[];
  marketEvidence: string[];
}

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  url: string;
  skills: string[];
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  format: 'COURSE' | 'ARTICLE' | 'VIDEO' | 'BOOK';
  isFree: boolean;
  duration?: string;
  verified: boolean;
}

export interface RoadmapStep {
  id: string;
  skillId: string;
  skillName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  prerequisites: string[];
  estimatedHours: number;
  resources: LearningResource[];
  projectIdea: string;
  completed: boolean;
}

export interface CareerRoadmap {
  id: string;
  userId: string;
  targetRole: string;
  generatedAt: string;
  steps: RoadmapStep[];
}

export type ApplicationStatus = 'SAVED' | 'APPLIED' | 'SCREENING' | 'INTERVIEW' | 'OFFER' | 'REJECTED';

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  location?: string;
  salaryOffered?: number;
  status: ApplicationStatus;
  appliedDate: string;
  notes?: string;
  interviewDates?: string[];
  contactEmail?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  jobId: string;
  job?: Job;
  savedAt: string;
  notes?: string;
  reminderDate?: string;
}

export interface Alert {
  id: string;
  userId: string;
  targetRole: string;
  skills: string[];
  location?: string;
  remoteOnly: boolean;
  minSalary?: number;
  frequency: 'DAILY' | 'WEEKLY';
  active: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'JOB_ALERT' | 'APPLICATION_REMINDER' | 'ROADMAP_UPDATE' | 'MARKET_ALERT';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}
