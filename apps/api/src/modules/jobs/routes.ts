import { Router } from 'express';
import { JobModel } from '../../models/Job.js';
import { CompanyModel } from '../../models/Company.js';
import { SavedJobModel } from '../../models/SavedJob.js';
import { ProfileModel } from '../../models/Profile.js';
import { JobQuerySchema } from '@jobpulse/validation';
import { AuthRequest, authMiddleware, requireAdmin } from '../../middleware/auth.js';
import { validateIdParam } from '../../middleware/sanitize.js';
import { calculateJobMatch } from '../../services/matchingEngine.js';
import { aiProvider } from '../../services/aiProvider.js';
import { config } from '../../config/env.js';

export const jobsRouter = Router();

/**
 * Helper to normalize titles into canonical JobPulse roles
 */
function normalizeJobTitle(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('frontend') || t.includes('react') || t.includes('vue') || t.includes('ui')) return 'Frontend Developer';
  if (t.includes('backend') || t.includes('node') || t.includes('python') || t.includes('java')) return 'Backend Engineer';
  if (t.includes('devops') || t.includes('cloud') || t.includes('sre') || t.includes('aws')) return 'DevOps & Cloud Engineer';
  if (t.includes('data') || t.includes('ai') || t.includes('machine learning')) return 'Data & AI Engineer';
  return 'Full Stack Engineer';
}

/**
 * Ingests live real jobs from multiple providers (Arbeitnow, Remotive, Adzuna, Jooble)
 */
async function syncRealJobsFromProviders(limit = 30): Promise<number> {
  let count = 0;

  // 1. Fetch from Arbeitnow Public Job Board API (No Key Required)
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api');
    if (res.ok) {
      const json = (await res.json()) as any;
      const jobs = json.data || [];
      for (const item of jobs.slice(0, limit)) {
        const companyName = item.company_name || 'Global Tech';
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        let company = await CompanyModel.findOne({ slug });
        if (!company) {
          company = await CompanyModel.create({
            name: companyName,
            slug,
            industry: 'Technology & Enterprise Solutions',
            activeJobCount: 1,
            hiringTrend: 22,
            verified: true,
            isSynthetic: false,
          });
        }

        const exists = await JobModel.findOne({ title: item.title, companyName });
        if (!exists) {
          const tags = Array.isArray(item.tags) ? item.tags : ['React', 'TypeScript', 'Node.js'];
          await JobModel.create({
            title: item.title,
            normalizedTitle: normalizeJobTitle(item.title),
            companyId: company._id,
            companyName: company.name,
            location: item.location || 'Remote - Global',
            country: 'Remote',
            city: 'Remote',
            remoteType: item.remote ? 'REMOTE' : 'HYBRID',
            employmentType: 'FULL_TIME',
            salaryMin: 2200000,
            salaryMax: 4200000,
            salaryCurrency: 'INR',
            experienceLevel: 'MID',
            description: item.description ? item.description.replace(/<[^>]*>?/gm, ' ').slice(0, 1500).trim() : 'Join our high-impact engineering team.',
            requirements: ['Proven experience in software engineering', 'Solid understanding of modern web architectures', 'Strong problem solving skills'],
            responsibilities: ['Architect scalable services', 'Collaborate across engineering squads', 'Maintain test coverage and performance'],
            benefits: ['Flexible remote work', 'Competitive compensation & equity', 'Health & wellness stipends'],
            skills: tags.slice(0, 8),
            postedDate: new Date(),
            status: 'ACTIVE',
            isSynthetic: false,
            applicationUrl: item.url || 'https://www.arbeitnow.com',
          });
          count++;
        }
      }
    }
  } catch (err) {
    console.warn('[Jobs Sync] Arbeitnow API notice:', err);
  }

  // 2. Fetch from Remotive Public API (No Key Required)
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=25');
    if (res.ok) {
      const json = (await res.json()) as any;
      const jobs = json.jobs || [];
      for (const item of jobs.slice(0, limit)) {
        const companyName = item.company_name || 'Tech Innovators';
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

        let company = await CompanyModel.findOne({ slug });
        if (!company) {
          company = await CompanyModel.create({
            name: companyName,
            slug,
            industry: 'Software & Cloud Infrastructure',
            activeJobCount: 1,
            hiringTrend: 19,
            verified: true,
            isSynthetic: false,
          });
        }

        const exists = await JobModel.findOne({ title: item.title, companyName });
        if (!exists) {
          const tags = Array.isArray(item.tags) ? item.tags : ['JavaScript', 'Node.js', 'Python'];
          await JobModel.create({
            title: item.title,
            normalizedTitle: normalizeJobTitle(item.title),
            companyId: company._id,
            companyName: company.name,
            location: item.candidate_required_location || 'Remote - Worldwide',
            country: 'Remote',
            city: 'Remote',
            remoteType: 'REMOTE',
            employmentType: item.job_type === 'full_time' ? 'FULL_TIME' : 'CONTRACT',
            salaryMin: 2000000,
            salaryMax: 3800000,
            salaryCurrency: 'INR',
            experienceLevel: item.title.toLowerCase().includes('senior') ? 'SENIOR' : 'MID',
            description: item.description ? item.description.replace(/<[^>]*>?/gm, ' ').slice(0, 1500).trim() : 'Join a distributed team building next-generation platforms.',
            requirements: ['Experience with modern cloud stacks', 'Clear technical communication', 'Customer-centric mindset'],
            responsibilities: ['Build robust microservices', 'Participate in code reviews', 'Improve service reliability'],
            benefits: ['100% Remote flexibility', 'Learning budget', 'Health insurance'],
            skills: tags.slice(0, 8),
            postedDate: item.publication_date ? new Date(item.publication_date) : new Date(),
            status: 'ACTIVE',
            isSynthetic: false,
            applicationUrl: item.url || 'https://remotive.com',
          });
          count++;
        }
      }
    }
  } catch (err) {
    console.warn('[Jobs Sync] Remotive API notice:', err);
  }

  // 3. Optional: Adzuna API Integration (If ADZUNA_APP_ID & ADZUNA_APP_KEY provided in .env)
  if (config.adzunaAppId && config.adzunaAppKey) {
    try {
      const url = `https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=${config.adzunaAppId}&app_key=${config.adzunaAppKey}&results_per_page=20&what=developer`;
      const res = await fetch(url);
      if (res.ok) {
        const json = (await res.json()) as any;
        const results = json.results || [];
        for (const item of results) {
          const companyName = item.company?.display_name || 'Enterprise Corp';
          const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

          let company = await CompanyModel.findOne({ slug });
          if (!company) {
            company = await CompanyModel.create({
              name: companyName,
              slug,
              industry: 'Enterprise Technology',
              activeJobCount: 1,
              hiringTrend: 15,
              verified: true,
              isSynthetic: false,
            });
          }

          const exists = await JobModel.findOne({ title: item.title, companyName });
          if (!exists) {
            await JobModel.create({
              title: item.title,
              normalizedTitle: normalizeJobTitle(item.title),
              companyId: company._id,
              companyName: company.name,
              location: item.location?.display_name || 'India',
              country: 'India',
              city: item.location?.area?.[0] || 'Bangalore',
              remoteType: item.title.toLowerCase().includes('remote') ? 'REMOTE' : 'HYBRID',
              employmentType: 'FULL_TIME',
              salaryMin: item.salary_min || 1500000,
              salaryMax: item.salary_max || 3000000,
              salaryCurrency: 'INR',
              experienceLevel: 'MID',
              description: item.description || 'Full-time software development opportunity with industry competitive packages.',
              requirements: ['Hands-on software development experience', 'Database knowledge (SQL/NoSQL)', 'Team player'],
              responsibilities: ['Deliver features on time', 'Write unit tests', 'Monitor application metrics'],
              benefits: ['Health coverage', 'Professional development stipend', 'Performance bonus'],
              skills: ['Java', 'Python', 'React', 'Node.js', 'SQL'],
              postedDate: item.created ? new Date(item.created) : new Date(),
              status: 'ACTIVE',
              isSynthetic: false,
              applicationUrl: item.redirect_url || 'https://www.adzuna.in',
            });
            count++;
          }
        }
      }
    } catch (adzunaErr) {
      console.warn('[Jobs Sync] Adzuna API fetch notice:', adzunaErr);
    }
  }

  // 4. Optional: Jooble API Integration (If JOOBLE_API_KEY provided in .env)
  if (config.joobleApiKey) {
    try {
      const res = await fetch(`https://jooble.org/api/${config.joobleApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: 'software engineer', location: '' }),
      });
      if (res.ok) {
        const json = (await res.json()) as any;
        const jobs = json.jobs || [];
        for (const item of jobs.slice(0, 20)) {
          const companyName = item.company || 'Tech Solutions';
          const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

          let company = await CompanyModel.findOne({ slug });
          if (!company) {
            company = await CompanyModel.create({
              name: companyName,
              slug,
              industry: 'Digital Systems',
              activeJobCount: 1,
              hiringTrend: 17,
              verified: true,
              isSynthetic: false,
            });
          }

          const exists = await JobModel.findOne({ title: item.title, companyName });
          if (!exists) {
            await JobModel.create({
              title: item.title,
              normalizedTitle: normalizeJobTitle(item.title),
              companyId: company._id,
              companyName: company.name,
              location: item.location || 'Remote',
              country: 'Global',
              city: 'Remote',
              remoteType: 'REMOTE',
              employmentType: 'FULL_TIME',
              salaryMin: 1800000,
              salaryMax: 3200000,
              salaryCurrency: 'INR',
              experienceLevel: 'MID',
              description: item.snippet ? item.snippet.replace(/<[^>]*>?/gm, ' ') : 'Software engineering role.',
              requirements: ['Strong coding foundation', 'Problem solving skills'],
              responsibilities: ['Develop clean modular software', 'Collaborate with agile team'],
              benefits: ['Flexible working hours', 'Competitive base salary'],
              skills: ['JavaScript', 'TypeScript', 'React', 'Node.js'],
              postedDate: item.updated ? new Date(item.updated) : new Date(),
              status: 'ACTIVE',
              isSynthetic: false,
              applicationUrl: item.link || 'https://jooble.org',
            });
            count++;
          }
        }
      }
    } catch (joobleErr) {
      console.warn('[Jobs Sync] Jooble API fetch notice:', joobleErr);
    }
  }

  return count;
}

// POST /api/v1/jobs/sync-live - Sync real live jobs from public job board APIs (Admin only)
jobsRouter.post('/sync-live', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const importedCount = await syncRealJobsFromProviders(30);
    res.json({
      success: true,
      message: `Successfully imported ${importedCount} live real jobs from active providers into MongoDB`,
      importedCount,
    });
  } catch (err) {
    next(err);
  }
});

// GET /jobs - Paginated & filtered search
jobsRouter.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const params = JobQuerySchema.parse(req.query);
    const filter: Record<string, unknown> = { status: 'ACTIVE' };

    if (params.query) {
      filter.$text = { $search: params.query };
    }
    if (params.role) {
      filter.normalizedTitle = { $regex: new RegExp(params.role, 'i') };
    }
    if (params.skill) {
      filter.skills = { $in: [new RegExp(`^${params.skill}$`, 'i')] };
    }
    if (params.company) {
      filter.companyName = { $regex: new RegExp(params.company, 'i') };
    }
    if (params.location) {
      filter.location = { $regex: new RegExp(params.location, 'i') };
    }
    if (params.remoteType && params.remoteType !== 'ALL') {
      filter.remoteType = params.remoteType;
    }
    if (params.experienceLevel && params.experienceLevel !== 'ALL') {
      filter.experienceLevel = params.experienceLevel;
    }
    if (params.employmentType && params.employmentType !== 'ALL') {
      filter.employmentType = params.employmentType;
    }
    if (params.minSalary) {
      filter.salaryMax = { $gte: params.minSalary };
    }
    if (params.maxSalary) {
      filter.salaryMin = { $lte: params.maxSalary };
    }

    const page = params.page;
    const limit = params.limit;
    const skip = (page - 1) * limit;

    const sortOrder = params.sortOrder === 'asc' ? 1 : -1;
    const sortField = params.sortBy === 'salaryMax' ? 'salaryMax' : 'postedDate';

    const [jobs, total] = await Promise.all([
      JobModel.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      JobModel.countDocuments(filter),
    ]);

    // Attach match score if profile exists
    const profile = await ProfileModel.findOne({ userId: req.user?.userId }).lean();
    const formattedJobs = jobs.map((job) => {
      let matchScore: number | undefined;
      if (profile) {
        const match = calculateJobMatch(profile as any, job as any);
        matchScore = match.overallScore;
      }
      return {
        id: job._id.toString(),
        ...job,
        matchScore,
      };
    });

    res.json({
      success: true,
      data: formattedJobs,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /jobs/recommended
jobsRouter.get('/recommended', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const profile = await ProfileModel.findOne({ userId: req.user?.userId }).lean();
    if (!profile) {
      const defaultJobs = await JobModel.find({ status: 'ACTIVE' }).limit(10).lean();
      return res.json({
        success: true,
        data: defaultJobs.map((j) => ({ id: j._id.toString(), ...j })),
      });
    }

    const allJobs = await JobModel.find({ status: 'ACTIVE' }).limit(100).lean();
    const rankedJobs = allJobs
      .map((job) => {
        const match = calculateJobMatch(profile as any, job as any);
        return {
          id: job._id.toString(),
          ...job,
          matchResult: match,
          matchScore: match.overallScore,
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({ success: true, data: rankedJobs });
  } catch (err) {
    next(err);
  }
});

// POST /jobs/natural-search
jobsRouter.post('/natural-search', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'Natural language search query required' });
    }

    const parsedFilters = await aiProvider.parseNaturalSearch(query.slice(0, 200));

    const filter: Record<string, unknown> = { status: 'ACTIVE' };
    if (parsedFilters.remoteType && parsedFilters.remoteType !== 'ALL') {
      filter.remoteType = parsedFilters.remoteType;
    }
    if (parsedFilters.experienceLevel && parsedFilters.experienceLevel !== 'ALL') {
      filter.experienceLevel = parsedFilters.experienceLevel;
    }
    if (parsedFilters.skills && parsedFilters.skills.length > 0) {
      filter.skills = { $in: parsedFilters.skills };
    }
    if (parsedFilters.location) {
      filter.location = { $regex: new RegExp(parsedFilters.location, 'i') };
    }

    const jobs = await JobModel.find(filter).limit(15).lean();

    res.json({
      success: true,
      data: {
        parsedFilters,
        results: jobs.map((j) => ({ id: j._id.toString(), ...j })),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /jobs/saved
jobsRouter.get('/saved', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const saved = await SavedJobModel.find({ userId }).lean();
    const jobIds = saved.map((s) => s.jobId);
    const jobs = await JobModel.find({ _id: { $in: jobIds } }).lean();

    const savedJobsMap = new Map(jobs.map((j) => [j._id.toString(), j]));

    const result = saved.map((s) => ({
      id: s._id.toString(),
      jobId: s.jobId,
      savedAt: s.savedAt,
      notes: s.notes,
      job: savedJobsMap.get(s.jobId),
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

// POST /jobs/:id/save (IDOR & ObjectId protected)
jobsRouter.post('/:id/save', authMiddleware, validateIdParam, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const jobId = req.params.id;

    const existing = await SavedJobModel.findOne({ userId, jobId });
    if (existing) {
      await SavedJobModel.deleteOne({ userId, jobId });
      return res.json({ success: true, saved: false, message: 'Job unsaved' });
    }

    await SavedJobModel.create({ userId, jobId });
    res.json({ success: true, saved: true, message: 'Job saved successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /jobs/:id (ObjectId validated)
jobsRouter.get('/:id', authMiddleware, validateIdParam, async (req: AuthRequest, res, next) => {
  try {
    const job = await JobModel.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ success: false, error: 'Job listing not found' });
    }

    const profile = await ProfileModel.findOne({ userId: req.user?.userId }).lean();
    let matchResult;
    if (profile) {
      matchResult = calculateJobMatch(profile as any, job as any);
    }

    const isSaved = Boolean(await SavedJobModel.findOne({ userId: req.user?.userId, jobId: req.params.id }));

    res.json({
      success: true,
      data: {
        id: job._id.toString(),
        ...job,
        matchResult,
        isSaved,
      },
    });
  } catch (err) {
    next(err);
  }
});

export { syncRealJobsFromProviders };
