import { z } from 'zod';
export const JobQuerySchema = z.object({
    query: z.string().optional(),
    role: z.string().optional(),
    skill: z.string().optional(),
    company: z.string().optional(),
    location: z.string().optional(),
    remoteType: z.enum(['REMOTE', 'HYBRID', 'ON_SITE', 'ALL']).optional(),
    experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE', 'ALL']).optional(),
    employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'ALL']).optional(),
    minSalary: z.coerce.number().optional(),
    maxSalary: z.coerce.number().optional(),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    sortBy: z.enum(['postedDate', 'salaryMax', 'matchScore', 'title']).default('postedDate'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
export const UserProfileSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    education: z.string().optional().default(''),
    degree: z.string().optional().default(''),
    graduationYear: z.number().optional(),
    experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']),
    currentRole: z.string().default(''),
    targetRoles: z.array(z.string()).default([]),
    skills: z.array(z.string()).default([]),
    preferredLocations: z.array(z.string()).default([]),
    remotePreference: z.enum(['REMOTE', 'HYBRID', 'ON_SITE', 'ANY']),
    salaryExpectation: z.number().nonnegative().default(0),
    industries: z.array(z.string()).default([]),
    yearsOfExperience: z.number().nonnegative().default(0),
    profileVisibility: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
});
export const ApplicationSchema = z.object({
    jobId: z.string().min(1, 'Job ID is required'),
    jobTitle: z.string().min(1, 'Job title is required'),
    companyName: z.string().min(1, 'Company name is required'),
    companyLogo: z.string().optional(),
    location: z.string().optional(),
    salaryOffered: z.number().optional(),
    status: z.enum(['SAVED', 'APPLIED', 'SCREENING', 'INTERVIEW', 'OFFER', 'REJECTED']),
    appliedDate: z.string().default(() => new Date().toISOString()),
    notes: z.string().optional(),
    interviewDates: z.array(z.string()).optional(),
    contactEmail: z.string().email().optional().or(z.literal('')),
    followUpDate: z.string().optional(),
});
export const AlertSchema = z.object({
    targetRole: z.string().min(1, 'Target role is required'),
    skills: z.array(z.string()).default([]),
    location: z.string().optional(),
    remoteOnly: z.boolean().default(false),
    minSalary: z.number().optional(),
    frequency: z.enum(['DAILY', 'WEEKLY']).default('DAILY'),
});
export const JobDescriptionInputSchema = z.object({
    text: z.string().min(10, 'Job description must be at least 10 characters long'),
});
export const AIResumeAnalysisSchema = z.object({
    extractedName: z.string().optional(),
    education: z.array(z.string()).default([]),
    experience: z.array(z.string()).default([]),
    extractedSkills: z.array(z.string()).default([]),
    roleAlignmentScore: z.number().min(0).max(100).default(70),
    missingSkills: z.array(z.string()).default([]),
    suggestions: z.array(z.string()).default([]),
    atsScore: z.number().min(0).max(100).default(75),
});
export const AIJobDescriptionSchema = z.object({
    title: z.string(),
    seniority: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']).default('MID'),
    requiredSkills: z.array(z.string()).default([]),
    preferredSkills: z.array(z.string()).default([]),
    responsibilities: z.array(z.string()).default([]),
    salaryEstimate: z.string().optional(),
    summaryExplanation: z.string().default('Job description successfully extracted.'),
});
export const AICareerRoadmapSchema = z.object({
    steps: z.array(z.object({
        skillName: z.string(),
        priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
        prerequisites: z.array(z.string()).default([]),
        estimatedHours: z.number().default(20),
        projectIdea: z.string().default('Build a portfolio project demonstrating this skill.'),
    })),
});
export const AISearchParseSchema = z.object({
    role: z.string().optional(),
    skills: z.array(z.string()).default([]),
    location: z.string().optional(),
    remoteType: z.enum(['REMOTE', 'HYBRID', 'ON_SITE', 'ALL']).optional(),
    minSalary: z.number().optional(),
    experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE', 'ALL']).optional(),
});
