const SYNONYM_MAP: Record<string, string> = {
  'react.js': 'React',
  reactjs: 'React',
  react: 'React',
  'node.js': 'Node.js',
  nodejs: 'Node.js',
  node: 'Node.js',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  js: 'JavaScript',
  javascript: 'JavaScript',
  py: 'Python',
  python: 'Python',
  python3: 'Python',
  'express.js': 'Express',
  expressjs: 'Express',
  express: 'Express',
  mongo: 'MongoDB',
  mongodb: 'MongoDB',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  k8s: 'Kubernetes',
  kubernetes: 'Kubernetes',
  aws: 'AWS',
  'amazon web services': 'AWS',
  gcp: 'Google Cloud',
  'google cloud platform': 'Google Cloud',
  azure: 'Azure',
  'microsoft azure': 'Azure',
  docker: 'Docker',
  graphql: 'GraphQL',
  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
  nextjs: 'Next.js',
  'next.js': 'Next.js',
  vue: 'Vue.js',
  vuejs: 'Vue.js',
  'vue.js': 'Vue.js',
};

export function normalizeSkill(skillName: string): string {
  const clean = skillName.trim().toLowerCase();
  if (SYNONYM_MAP[clean]) {
    return SYNONYM_MAP[clean];
  }
  // Title case fallback
  return skillName
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export function normalizeSkills(skills: string[]): string[] {
  const set = new Set<string>();
  for (const s of skills) {
    if (s && s.trim()) {
      set.add(normalizeSkill(s));
    }
  }
  return Array.from(set);
}
