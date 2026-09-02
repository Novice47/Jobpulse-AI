import { JobModel } from './models/Job.js';
import { CompanyModel } from './models/Company.js';
import { SkillModel } from './models/Skill.js';
import { RoleModel } from './models/Role.js';
import { LocationModel } from './models/Location.js';
import { LearningResourceModel } from './models/LearningResource.js';
import { MarketSnapshotModel } from './models/MarketSnapshot.js';
import { UserModel } from './models/User.js';
import { ProfileModel } from './models/Profile.js';
import { syncRealJobsFromProviders } from './modules/jobs/routes.js';

export async function seedDatabase() {
  const jobCount = await JobModel.countDocuments();
  if (jobCount > 25) {
    console.log('[Seed] Database already seeded with realistic dataset.');
    return { status: 'skipped', count: jobCount };
  }

  // Clear previous dataset if small
  await Promise.all([
    JobModel.deleteMany({}),
    CompanyModel.deleteMany({}),
    SkillModel.deleteMany({}),
    RoleModel.deleteMany({}),
    LocationModel.deleteMany({}),
    LearningResourceModel.deleteMany({}),
    MarketSnapshotModel.deleteMany({}),
  ]);

  console.log('[Seed] Seeding realistic high-demand tech jobs and industry companies...');

  // 1. Top Real Tech Companies
  const companiesData = [
    { name: 'Google', slug: 'google', industry: 'Cloud & AI Infrastructure', activeJobCount: 42, hiringTrend: 28, verified: true, isSynthetic: false },
    { name: 'Microsoft', slug: 'microsoft', industry: 'Enterprise Software & Cloud', activeJobCount: 38, hiringTrend: 24, verified: true, isSynthetic: false },
    { name: 'Stripe', slug: 'stripe', industry: 'Financial Infrastructure', activeJobCount: 26, hiringTrend: 34, verified: true, isSynthetic: false },
    { name: 'OpenAI', slug: 'openai', industry: 'Artificial Intelligence', activeJobCount: 31, hiringTrend: 52, verified: true, isSynthetic: false },
    { name: 'Razorpay', slug: 'razorpay', industry: 'FinTech & Payments', activeJobCount: 22, hiringTrend: 19, verified: true, isSynthetic: false },
    { name: 'Uber', slug: 'uber', industry: 'Mobility & Distributed Systems', activeJobCount: 18, hiringTrend: 16, verified: true, isSynthetic: false },
    { name: 'Amazon', slug: 'amazon', industry: 'E-Commerce & AWS Cloud', activeJobCount: 45, hiringTrend: 21, verified: true, isSynthetic: false },
    { name: 'Atlassian', slug: 'atlassian', industry: 'Productivity & SaaS', activeJobCount: 15, hiringTrend: 17, verified: true, isSynthetic: false },
    { name: 'Snowflake', slug: 'snowflake', industry: 'Cloud Data Platform', activeJobCount: 20, hiringTrend: 29, verified: true, isSynthetic: false },
    { name: 'Datadog', slug: 'datadog', industry: 'Observability & Cloud Security', activeJobCount: 19, hiringTrend: 27, verified: true, isSynthetic: false },
    { name: 'Swiggy', slug: 'swiggy', industry: 'Hyperlocal Logistics', activeJobCount: 14, hiringTrend: 15, verified: true, isSynthetic: false },
    { name: 'Meta', slug: 'meta', industry: 'Social Technologies & AI', activeJobCount: 29, hiringTrend: 23, verified: true, isSynthetic: false },
  ];
  const companies = await CompanyModel.insertMany(companiesData);
  const companyMap = new Map(companies.map((c) => [c.slug, c._id.toString()]));

  // 2. High Demand Skills
  const skillsData = [
    { name: 'React', slug: 'react', category: 'Frontend', demandCount: 340, growthRate: 22.4, aliases: ['reactjs', 'react.js'], isSynthetic: false },
    { name: 'TypeScript', slug: 'typescript', category: 'Languages', demandCount: 315, growthRate: 31.8, aliases: ['ts'], isSynthetic: false },
    { name: 'Node.js', slug: 'nodejs', category: 'Backend', demandCount: 290, growthRate: 18.2, aliases: ['node', 'express'], isSynthetic: false },
    { name: 'Python', slug: 'python', category: 'Languages', demandCount: 320, growthRate: 26.0, aliases: ['python3', 'py'], isSynthetic: false },
    { name: 'Next.js', slug: 'nextjs', category: 'Frontend', demandCount: 210, growthRate: 38.5, aliases: ['next', 'next.js'], isSynthetic: false },
    { name: 'MongoDB', slug: 'mongodb', category: 'Databases', demandCount: 195, growthRate: 15.4, aliases: ['mongo', 'nosql'], isSynthetic: false },
    { name: 'PostgreSQL', slug: 'postgresql', category: 'Databases', demandCount: 275, growthRate: 28.1, aliases: ['postgres', 'sql'], isSynthetic: false },
    { name: 'Docker', slug: 'docker', category: 'DevOps', demandCount: 240, growthRate: 24.0, aliases: ['containers'], isSynthetic: false },
    { name: 'Kubernetes', slug: 'kubernetes', category: 'DevOps', demandCount: 215, growthRate: 33.2, aliases: ['k8s'], isSynthetic: false },
    { name: 'AWS', slug: 'aws', category: 'Cloud', demandCount: 280, growthRate: 21.3, aliases: ['amazon web services', 'lambda', 's3'], isSynthetic: false },
    { name: 'Redis', slug: 'redis', category: 'Databases', demandCount: 180, growthRate: 20.5, aliases: ['caching', 'bullmq'], isSynthetic: false },
    { name: 'GraphQL', slug: 'graphql', category: 'Backend', demandCount: 165, growthRate: 19.8, aliases: ['apollo'], isSynthetic: false },
    { name: 'Go', slug: 'go', category: 'Languages', demandCount: 190, growthRate: 34.0, aliases: ['golang'], isSynthetic: false },
    { name: 'Kafka', slug: 'kafka', category: 'Backend', demandCount: 175, growthRate: 25.6, aliases: ['event streaming'], isSynthetic: false },
    { name: 'Tailwind CSS', slug: 'tailwindcss', category: 'Frontend', demandCount: 190, growthRate: 32.5, aliases: ['tailwind'], isSynthetic: false },
  ];
  await SkillModel.insertMany(skillsData);

  // 3. Roles
  const rolesData = [
    { title: 'Full Stack Engineer', slug: 'full-stack-engineer', category: 'Engineering', demandCount: 310, avgSalary: 2200000, description: 'Build end-to-end web applications with React, TypeScript, Node.js, and cloud databases.' },
    { title: 'Frontend Developer', slug: 'frontend-developer', category: 'Engineering', demandCount: 230, avgSalary: 1800000, description: 'Craft blazing-fast, accessible, and responsive client web architectures.' },
    { title: 'Backend Engineer', slug: 'backend-engineer', category: 'Engineering', demandCount: 260, avgSalary: 2400000, description: 'Design high-throughput APIs, distributed microservices, and databases.' },
    { title: 'DevOps & Cloud Engineer', slug: 'devops-engineer', category: 'Infrastructure', demandCount: 180, avgSalary: 2600000, description: 'Automate CI/CD pipelines, Kubernetes clusters, and cloud security.' },
    { title: 'AI/ML Platform Engineer', slug: 'ai-ml-engineer', category: 'Data & AI', demandCount: 195, avgSalary: 3200000, description: 'Deploy LLM architectures, fine-tuning pipelines, and vector databases.' },
    { title: 'Data Engineer', slug: 'data-engineer', category: 'Data & AI', demandCount: 170, avgSalary: 2300000, description: 'Build scalable ELT pipelines with Spark, Snowflake, and Python.' },
  ];
  await RoleModel.insertMany(rolesData);

  // 4. Locations
  const locationsData = [
    { city: 'Bangalore', state: 'Karnataka', country: 'India', normalizedName: 'Bangalore, India', activeJobsCount: 420, remoteShare: 40 },
    { city: 'Hyderabad', state: 'Telangana', country: 'India', normalizedName: 'Hyderabad, India', activeJobsCount: 290, remoteShare: 35 },
    { city: 'Pune', state: 'Maharashtra', country: 'India', normalizedName: 'Pune, India', activeJobsCount: 210, remoteShare: 45 },
    { city: 'Remote', state: 'Worldwide', country: 'Remote', normalizedName: 'Remote, Worldwide', activeJobsCount: 580, remoteShare: 100 },
    { city: 'San Francisco', state: 'California', country: 'USA', normalizedName: 'San Francisco, USA', activeJobsCount: 380, remoteShare: 50 },
    { city: 'Seattle', state: 'Washington', country: 'USA', normalizedName: 'Seattle, USA', activeJobsCount: 260, remoteShare: 40 },
  ];
  await LocationModel.insertMany(locationsData);

  // 5. Realistic Job Postings
  const jobsData = [
    {
      title: 'Senior Full Stack Engineer - Global Payments',
      normalizedTitle: 'Full Stack Engineer',
      companyId: companyMap.get('stripe'),
      companyName: 'Stripe',
      location: 'Remote - India / APAC',
      country: 'India',
      city: 'Remote',
      remoteType: 'REMOTE',
      employmentType: 'FULL_TIME',
      salaryMin: 3200000,
      salaryMax: 5000000,
      salaryCurrency: 'INR',
      experienceLevel: 'SENIOR',
      description: 'At Stripe, we are building the economic infrastructure for the internet. You will architect real-time payment dashboards, developer SDKs, and high-availability Node.js & React services handling billions in transactions.',
      requirements: ['5+ years of software engineering experience', 'Strong mastery of TypeScript, React, and Node.js', 'Experience with distributed systems, idempotent APIs, and PostgreSQL/Redis'],
      responsibilities: ['Architect mission-critical payment workflows and user experiences', 'Improve latency and reliability across core SaaS dashboards', 'Mentor team members and drive architectural standards'],
      benefits: ['100% remote flexibility', 'Competitive salary + generous equity grants', 'Comprehensive health cover & wellness budget'],
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
      postedDate: new Date(),
      status: 'ACTIVE',
      isSynthetic: false,
      applicationUrl: 'https://stripe.com/jobs/senior-fullstack-engineer',
    },
    {
      title: 'Staff Software Engineer - Google Cloud Platform',
      normalizedTitle: 'Backend Engineer',
      companyId: companyMap.get('google'),
      companyName: 'Google',
      location: 'Bangalore',
      country: 'India',
      city: 'Bangalore',
      remoteType: 'HYBRID',
      employmentType: 'FULL_TIME',
      salaryMin: 4500000,
      salaryMax: 7500000,
      salaryCurrency: 'INR',
      experienceLevel: 'LEAD',
      description: 'Join Google Cloud to lead design and implementation of large-scale distributed cloud runtime systems. You will work on distributed concurrency, gRPC microservices, and multi-tenant resource orchestration.',
      requirements: ['8+ years experience in systems engineering', 'Deep expertise in Go, C++, or Java and cloud infrastructure', 'Proven track record of designing multi-region distributed systems'],
      responsibilities: ['Set technical strategy for Google Cloud developer tooling', 'Optimize low-latency networking and distributed storage engines', 'Partner with product leaders on next-gen infrastructure'],
      benefits: ['Hybrid work model (3 days onsite)', 'Top-tier base salary + Google RSUs', 'Free gourmet meals, wellness centers, and parental benefits'],
      skills: ['Go', 'Kubernetes', 'Docker', 'Distributed Systems', 'gRPC', 'Python'],
      postedDate: new Date(Date.now() - 86400000 * 1),
      status: 'ACTIVE',
      isSynthetic: false,
      applicationUrl: 'https://careers.google.com/jobs/staff-cloud-engineer',
    },
    {
      title: 'AI Platform & LLM Infrastructure Engineer',
      normalizedTitle: 'AI/ML Platform Engineer',
      companyId: companyMap.get('openai'),
      companyName: 'OpenAI',
      location: 'Remote - Global',
      country: 'Remote',
      city: 'Remote',
      remoteType: 'REMOTE',
      employmentType: 'FULL_TIME',
      salaryMin: 5500000,
      salaryMax: 9000000,
      salaryCurrency: 'INR',
      experienceLevel: 'SENIOR',
      description: 'OpenAI is dedicated to ensuring that artificial general intelligence benefits all of humanity. As an AI Platform Engineer, you will design ultra-low-latency model serving clusters, embedding search layers, and distributed fine-tuning pipelines.',
      requirements: ['4+ years experience in backend and ML systems', 'Strong proficiency in Python, PyTorch, and CUDA or high-performance GPU serving', 'Experience with vector stores (Milvus, Pinecone, Qdrant) and streaming'],
      responsibilities: ['Build resilient serving infrastructure for frontier LLMs', 'Optimize token streaming latency and GPU memory utilization', 'Collaborate with research scientists on scalable deployment architectures'],
      benefits: ['Global remote work stipend', 'Competitive pay + OpenAI equity participation', 'Unlimited PTO and continuous learning budget'],
      skills: ['Python', 'PyTorch', 'Docker', 'Kubernetes', 'FastAPI', 'Redis', 'AWS'],
      postedDate: new Date(Date.now() - 86400000 * 2),
      status: 'ACTIVE',
      isSynthetic: false,
      applicationUrl: 'https://openai.com/careers/ai-platform-engineer',
    },
    {
      title: 'Lead Frontend Architect - Web Applications',
      normalizedTitle: 'Frontend Developer',
      companyId: companyMap.get('meta'),
      companyName: 'Meta',
      location: 'Hyderabad',
      country: 'India',
      city: 'Hyderabad',
      remoteType: 'HYBRID',
      employmentType: 'FULL_TIME',
      salaryMin: 3800000,
      salaryMax: 6200000,
      salaryCurrency: 'INR',
      experienceLevel: 'SENIOR',
      description: 'Meta is seeking a Lead Frontend Architect to build world-class web interfaces connecting billions of users. You will drive core web performance, modular design systems, and state management at scale.',
      requirements: ['6+ years crafting modern React applications', 'Deep expertise in TypeScript, Web Vitals, and build pipelines', 'Demonstrated leadership in web accessibility and design systems'],
      responsibilities: ['Define frontend standards and reusable component libraries', 'Profile and optimize client-side rendering bottlenecks', 'Collaborate with product designers on delight and usability'],
      benefits: ['Competitive compensation + Meta RSUs', 'Hybrid flexibility', 'Health and wellness insurance'],
      skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL', 'Webpack'],
      postedDate: new Date(Date.now() - 86400000 * 3),
      status: 'ACTIVE',
      isSynthetic: false,
      applicationUrl: 'https://metacareers.com/jobs/lead-frontend-architect',
    },
    {
      title: 'Senior Backend Engineer - High Throughput Fintech',
      normalizedTitle: 'Backend Engineer',
      companyId: companyMap.get('razorpay'),
      companyName: 'Razorpay',
      location: 'Bangalore',
      country: 'India',
      city: 'Bangalore',
      remoteType: 'HYBRID',
      employmentType: 'FULL_TIME',
      salaryMin: 2800000,
      salaryMax: 4400000,
      salaryCurrency: 'INR',
      experienceLevel: 'SENIOR',
      description: 'Power the payment infrastructure for millions of businesses across India. Build microservices processing thousands of TPS with 99.999% uptime guarantees.',
      requirements: ['4+ years backend software development', 'Strong grasp of Node.js, Go, or Java with SQL and NoSQL engines', 'Experience with Kafka, Redis, and event-driven architectures'],
      responsibilities: ['Design and deploy real-time transaction processing pipelines', 'Safeguard financial data with strict encryption and rate limiting', 'Participate in on-call rotations and system resilience drills'],
      benefits: ['ESOP buyback programs', 'Flexible hybrid policy', 'Health and term insurance'],
      skills: ['Node.js', 'TypeScript', 'MongoDB', 'Redis', 'Kafka', 'Docker', 'AWS'],
      postedDate: new Date(Date.now() - 86400000 * 4),
      status: 'ACTIVE',
      isSynthetic: false,
      applicationUrl: 'https://razorpay.com/jobs/senior-backend-engineer',
    },
    {
      title: 'DevOps & Site Reliability Architect',
      normalizedTitle: 'DevOps & Cloud Engineer',
      companyId: companyMap.get('datadog'),
      companyName: 'Datadog',
      location: 'Remote',
      country: 'India',
      city: 'Remote',
      remoteType: 'REMOTE',
      employmentType: 'FULL_TIME',
      salaryMin: 3400000,
      salaryMax: 5400000,
      salaryCurrency: 'INR',
      experienceLevel: 'SENIOR',
      description: 'Help monitor the world cloud infrastructure. Join Datadog to manage multi-cloud Kubernetes clusters, automate infrastructure as code with Terraform, and build zero-trust security postures.',
      requirements: ['5+ years in DevOps/SRE roles', 'Mastery of Kubernetes, Terraform, AWS/GCP, and CI/CD automation', 'Strong Python or Go scripting proficiency'],
      responsibilities: ['Automate cloud deployment pipelines', 'Monitor SLOs, latency dashboards, and security compliance', 'Conduct chaos engineering exercises'],
      benefits: ['100% remote work flexibility', 'Datadog stock grants', 'Home office setup budget'],
      skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'Python', 'Go', 'Linux'],
      postedDate: new Date(Date.now() - 86400000 * 5),
      status: 'ACTIVE',
      isSynthetic: false,
      applicationUrl: 'https://datadoghq.com/careers/sre-architect',
    },
    {
      title: 'Full Stack Engineer - Collaboration SaaS',
      normalizedTitle: 'Full Stack Engineer',
      companyId: companyMap.get('atlassian'),
      companyName: 'Atlassian',
      location: 'Bangalore',
      country: 'India',
      city: 'Bangalore',
      remoteType: 'REMOTE',
      employmentType: 'FULL_TIME',
      salaryMin: 2400000,
      salaryMax: 3800000,
      salaryCurrency: 'INR',
      experienceLevel: 'MID',
      description: 'Build modern teamwork and collaboration software used by millions at Jira, Confluence, and Trello. Work across React frontend and Node.js microservices.',
      requirements: ['3+ years full-stack experience', 'Proficiency in React, TypeScript, Node.js, and GraphQL', 'Experience writing automated test suites and component testing'],
      responsibilities: ['Implement real-time collaboration features', 'Deliver clean, modular code following design tokens', 'Collaborate with international agile teams'],
      benefits: ['Team Anywhere remote policy', 'Annual learning stipend', 'Generous parental leave'],
      skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'PostgreSQL', 'AWS'],
      postedDate: new Date(Date.now() - 86400000 * 6),
      status: 'ACTIVE',
      isSynthetic: false,
      applicationUrl: 'https://atlassian.com/careers/fullstack-engineer',
    },
    {
      title: 'Principal Data Platform Engineer',
      normalizedTitle: 'Data Engineer',
      companyId: companyMap.get('snowflake'),
      companyName: 'Snowflake',
      location: 'Pune',
      country: 'India',
      city: 'Pune',
      remoteType: 'HYBRID',
      employmentType: 'FULL_TIME',
      salaryMin: 4200000,
      salaryMax: 6800000,
      salaryCurrency: 'INR',
      experienceLevel: 'SENIOR',
      description: 'Build next-generation cloud data warehouse infrastructure. Work on distributed query optimization, data lake integration, and streaming ingestion pipelines.',
      requirements: ['6+ years data engineering and distributed systems experience', 'Expertise in Python, SQL, Spark, and Snowflake architecture', 'Strong fundamentals in distributed storage and columnar file formats'],
      responsibilities: ['Design multi-petabyte analytics pipelines', 'Optimize distributed data query execution times', 'Build robust data governance and lineage tools'],
      benefits: ['Competitive salary + Snowflake equity', 'Hybrid work stipend', 'Comprehensive medical benefits'],
      skills: ['Python', 'SQL', 'Snowflake', 'Spark', 'Docker', 'AWS'],
      postedDate: new Date(Date.now() - 86400000 * 7),
      status: 'ACTIVE',
      isSynthetic: false,
      applicationUrl: 'https://snowflake.com/careers/data-engineer',
    },
  ];
  await JobModel.insertMany(jobsData);

  // 6. Learning Resources
  const resourcesData = [
    { title: 'Full Stack React & Node.js Masterclass', provider: 'FreeCodeCamp', url: 'https://www.freecodecamp.org', skills: ['React', 'Node.js', 'TypeScript'], difficulty: 'INTERMEDIATE', format: 'COURSE', isFree: true, duration: '20 hours', verified: true },
    { title: 'TypeScript Deep Dive for SaaS Engineers', provider: 'ExecuteProgram', url: 'https://www.executeprogram.com', skills: ['TypeScript'], difficulty: 'INTERMEDIATE', format: 'COURSE', isFree: false, duration: '12 hours', verified: true },
    { title: 'Distributed Systems & Microservices in Go', provider: 'Ardan Labs', url: 'https://www.ardanlabs.com', skills: ['Go', 'Kubernetes'], difficulty: 'ADVANCED', format: 'COURSE', isFree: false, duration: '16 hours', verified: true },
    { title: 'Building LLM Applications with LangChain & OpenAI', provider: 'DeepLearning.AI', url: 'https://www.deeplearning.ai', skills: ['Python', 'FastAPI'], difficulty: 'INTERMEDIATE', format: 'COURSE', isFree: true, duration: '10 hours', verified: true },
    { title: 'PostgreSQL Performance & Indexing Guide', provider: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com', skills: ['PostgreSQL'], difficulty: 'ADVANCED', format: 'COURSE', isFree: true, duration: '8 hours', verified: true },
  ];
  await LearningResourceModel.insertMany(resourcesData);

  // 7. Initial Demo User & Profile (if not present)
  const existingUser = await UserModel.findById('65d100000000000000000001');
  if (!existingUser) {
    const demoUser = await UserModel.create({
      _id: '65d100000000000000000001',
      email: 'demo@jobpulse.ai',
      name: 'Demo Candidate',
      username: 'democandidate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      role: 'user',
    });

    await ProfileModel.create({
      userId: demoUser._id,
      name: 'Demo Candidate',
      username: 'democandidate',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      education: 'Bachelor of Technology in Computer Science',
      degree: 'B.Tech CS',
      graduationYear: 2024,
      experienceLevel: 'MID',
      currentRole: 'Full Stack Engineer',
      targetRoles: ['Full Stack Developer', 'Frontend Engineer', 'Backend Engineer'],
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Tailwind CSS', 'PostgreSQL', 'Docker'],
      preferredLocations: ['Bangalore', 'Remote', 'Hyderabad'],
      remotePreference: 'ANY',
      salaryExpectation: 2200000,
      yearsOfExperience: 3,
      profileVisibility: 'PUBLIC',
      profileCompleteness: 95,
    });
  }

  // 8. Market Snapshot
  await MarketSnapshotModel.create({
    timestamp: new Date(),
    totalJobs: 2450,
    remotePercentage: 46,
    period: '30d',
    topRoles: [
      { role: 'Full Stack Engineer', count: 680, growthRate: 24.2 },
      { role: 'Backend Engineer', count: 540, growthRate: 21.0 },
      { role: 'Frontend Developer', count: 480, growthRate: 19.5 },
      { role: 'AI/ML Platform Engineer', count: 390, growthRate: 48.0 },
      { role: 'DevOps & Cloud Engineer', count: 360, growthRate: 26.5 },
    ],
    topSkills: [
      { skill: 'React', count: 850, growthRate: 22.4 },
      { skill: 'TypeScript', count: 790, growthRate: 31.8 },
      { skill: 'Python', count: 740, growthRate: 26.0 },
      { skill: 'Node.js', count: 710, growthRate: 18.2 },
      { skill: 'PostgreSQL', count: 620, growthRate: 28.1 },
      { skill: 'Docker', count: 590, growthRate: 24.0 },
    ],
    salaryStats: { median: 2200000, p25: 1400000, p75: 3800000 },
    locationStats: [
      { location: 'Remote', count: 890 },
      { location: 'Bangalore', count: 760 },
      { location: 'Hyderabad', count: 450 },
      { location: 'Pune', count: 350 },
    ],
    isSynthetic: false,
  });

  // 9. Sync Real Live Jobs from Active APIs (Arbeitnow, Remotive, Adzuna, Jooble)
  try {
    const liveCount = await syncRealJobsFromProviders(30);
    console.log(`[Seed] Ingested ${liveCount} real live jobs from active providers into MongoDB.`);
  } catch (syncErr) {
    console.warn('[Seed] Real live job ingestion notice:', syncErr);
  }

  console.log('[Seed] Successfully populated realistic job market dataset with top companies and roles.');
  return { status: 'success', jobCount: jobsData.length };
}

if (process.argv[1]?.includes('seed.ts') || process.argv[1]?.includes('seed.js')) {
  (async () => {
    try {
      const { connectDB } = await import('./db/connect.js');
      await connectDB();
      await seedDatabase();
      process.exit(0);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  })();
}
