import { describe, it, expect } from 'vitest';
import { calculateJobMatch } from '../src/services/matchingEngine.js';

describe('Deterministic Matching Engine', () => {
  it('calculates 100% score for exact skill, experience, location and role match', () => {
    const profile = {
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      experienceLevel: 'MID' as const,
      targetRoles: ['Full Stack Engineer'],
      preferredLocations: ['Bangalore'],
      remotePreference: 'HYBRID',
      salaryExpectation: 1500000,
    };

    const job = {
      title: 'Senior Full Stack Engineer',
      normalizedTitle: 'Full Stack Engineer',
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
      experienceLevel: 'MID' as const,
      location: 'Bangalore',
      remoteType: 'HYBRID',
      salaryMin: 1400000,
      salaryMax: 2000000,
    };

    const result = calculateJobMatch(profile, job);
    expect(result.overallScore).toBeGreaterThanOrEqual(90);
    expect(result.matchedSkills).toContain('React');
    expect(result.missingRequiredSkills.length).toBe(0);
  });

  it('calculates partial score when missing key required skills', () => {
    const profile = {
      skills: ['React'],
      experienceLevel: 'ENTRY' as const,
      targetRoles: ['Frontend Developer'],
      preferredLocations: ['Remote'],
      remotePreference: 'REMOTE',
    };

    const job = {
      title: 'Senior DevOps Cloud Lead',
      normalizedTitle: 'DevOps Engineer',
      skills: ['Kubernetes', 'AWS', 'Terraform', 'Docker'],
      experienceLevel: 'SENIOR' as const,
      location: 'Bangalore',
      remoteType: 'ON_SITE',
    };

    const result = calculateJobMatch(profile, job);
    expect(result.overallScore).toBeLessThan(50);
    expect(result.missingRequiredSkills.length).toBe(4);
  });
});
