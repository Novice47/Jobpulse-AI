import { describe, it, expect } from 'vitest';
import { normalizeSkill, normalizeSkills } from '../src/services/skillNormalizer.js';

describe('Skill Normalizer', () => {
  it('normalizes common tech synonyms correctly', () => {
    expect(normalizeSkill('React.js')).toBe('React');
    expect(normalizeSkill('reactjs')).toBe('React');
    expect(normalizeSkill('node.js')).toBe('Node.js');
    expect(normalizeSkill('ts')).toBe('TypeScript');
    expect(normalizeSkill('python3')).toBe('Python');
    expect(normalizeSkill('k8s')).toBe('Kubernetes');
  });

  it('normalizes arrays of skills deduplicating synonyms', () => {
    const input = ['React', 'React.js', 'reactjs', 'Node.js', 'nodejs'];
    const normalized = normalizeSkills(input);
    expect(normalized).toEqual(['React', 'Node.js']);
  });
});
