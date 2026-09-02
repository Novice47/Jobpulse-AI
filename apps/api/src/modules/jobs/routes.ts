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

export const jobsRouter = Router();

// POST /api/v1/jobs/sync-live - Sync real live jobs from public job board APIs (Admin only)
jobsRouter.post('/sync-live', authMiddleware, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { category = 'software-dev', limit = 20 } = req.body || {};
    let importedCount = 0;

    // Fetch from Remotive Public API
    try {
      const remotiveRes = await fetch(`https://remotive.com/api/remote-jobs?category=${category}&limit=${limit}`);
      if (remotiveRes.ok) {
        const data = (await remotiveRes.json()) as any;
        const jobs = data.jobs || [];

        for (const rJob of jobs) {
          const companyName = rJob.company_name || 'Global Tech';
          const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');

          let company = await CompanyModel.findOne({ slug });
          if (!company) {
            company = await CompanyModel.create({
              name: companyName,
              slug,
              industry: 'Technology & Cloud',
              activeJobCount: 1,
              hiringTrend: 18,
              verified: true,
              isSynthetic: false,
            });
          }

          const existingJob = await JobModel.findOne({
            title: rJob.title,
            companyName: companyName,
          });

          if (!existingJob) {
            const tags = Array.isArray(rJob.tags) ? rJob.tags : [];
            const skills = tags.length > 0 ? tags : ['React', 'TypeScript', 'Node.js', 'API'];

            const titleLower = rJob.title.toLowerCase();
            const normalizedTitle = titleLower.includes('frontend')
              ? 'Frontend Developer'
              : titleLower.includes('backend')
              ? 'Backend Engineer'
              : titleLower.includes('devops') || titleLower.includes('cloud')
              ? 'DevOps & Cloud Engineer'
              : titleLower.includes('data') || titleLower.includes('ai')
              ? 'Data & AI Engineer'
              : 'Full Stack Engineer';

            await JobModel.create({
              title: rJob.title,
              normalizedTitle,
              companyId: company._id,
              companyName: company.name,
              location: rJob.candidate_required_location || 'Remote - Worldwide',
              country: 'Remote',
              city: 'Remote',
              remoteType: 'REMOTE',
              employmentType: rJob.job_type === 'full_time' ? 'FULL_TIME' : 'CONTRACT',
              salaryMin: 1800000,
              salaryMax: 3500000,
              salaryCurrency: 'INR',
              experienceLevel:
                titleLower.includes('senior') || titleLower.includes('lead')
                  ? 'SENIOR'
                  : titleLower.includes('junior')
                  ? 'ENTRY'
                  : 'MID',
              description: rJob.description
                ? rJob.description.replace(/<[^>]*>?/gm, ' ').slice(0, 1500).trim()
                : 'Join our engineering team building resilient distributed cloud platforms.',
              requirements: [
                'Proven experience in software engineering and web application architecture',
                'Strong command of modern frameworks and clean coding patterns',
                'Excellent collaboration, communication, and problem-solving skills',
              ],
              responsibilities: [
                'Design, build, and maintain mission-critical web applications and APIs',
                'Collaborate across cross-functional product and engineering teams',
                'Ensure high code quality, security, and performance benchmarks',
              ],
              benefits: ['100% Remote flexibility', 'Competitive salary & equity options', 'Health insurance & annual stipend'],
              skills: skills.slice(0, 8),
              postedDate: rJob.publication_date ? new Date(rJob.publication_date) : new Date(),
              status: 'ACTIVE',
              isSynthetic: false,
              applicationUrl: rJob.url || 'https://remotive.com',
            });
            importedCount++;
          }
        }
      }
    } catch (apiErr) {
      console.warn('[Jobs Sync] Remotive API fetch notice:', apiErr);
    }

    res.json({
      success: true,
      message: `Successfully imported ${importedCount} live jobs into MongoDB`,
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
