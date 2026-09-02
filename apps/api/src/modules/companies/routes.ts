import { Router } from 'express';
import { CompanyModel } from '../../models/Company.js';
import { JobModel } from '../../models/Job.js';

export const companiesRouter = Router();

// GET /companies
companiesRouter.get('/', async (req, res, next) => {
  try {
    const { search, industry } = req.query;
    const filter: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      filter.name = { $regex: new RegExp(search, 'i') };
    }
    if (industry && typeof industry === 'string') {
      filter.industry = industry;
    }

    const companies = await CompanyModel.find(filter).sort({ activeJobCount: -1 }).lean();

    res.json({
      success: true,
      data: companies.map((c) => ({ id: c._id.toString(), ...c })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /companies/:id
companiesRouter.get('/:id', async (req, res, next) => {
  try {
    const company = await CompanyModel.findById(req.params.id).lean();
    if (!company) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const jobs = await JobModel.find({ companyId: req.params.id, status: 'ACTIVE' }).limit(10).lean();

    res.json({
      success: true,
      data: {
        id: company._id.toString(),
        ...company,
        recentJobs: jobs.map((j) => ({ id: j._id.toString(), ...j })),
      },
    });
  } catch (err) {
    next(err);
  }
});
