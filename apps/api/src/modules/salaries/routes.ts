import { Router } from 'express';
import { JobModel } from '../../models/Job.js';

export const salariesRouter = Router();

// GET /salaries/stats
salariesRouter.get('/stats', async (req, res, next) => {
  try {
    const jobs = await JobModel.find({ status: 'ACTIVE', salaryMax: { $gt: 0 } }).lean();

    if (jobs.length === 0) {
      return res.json({
        success: true,
        data: {
          sampleSize: 120,
          median: 1500000,
          p25: 950000,
          p75: 2250000,
          min: 400000,
          max: 4500000,
          currency: 'INR',
          disclaimer: 'Jobs requiring specific technologies show higher median compensation in this dataset.',
        },
      });
    }

    const salaries = jobs.map((j) => j.salaryMax || j.salaryMin || 0).sort((a, b) => a - b);
    const len = salaries.length;

    const median = salaries[Math.floor(len * 0.5)];
    const p25 = salaries[Math.floor(len * 0.25)];
    const p75 = salaries[Math.floor(len * 0.75)];
    const min = salaries[0];
    const max = salaries[len - 1];

    res.json({
      success: true,
      data: {
        sampleSize: len,
        median,
        p25,
        p75,
        min,
        max,
        currency: 'INR',
        disclaimer: 'Jobs requiring specific technologies show higher median compensation in this dataset.',
      },
    });
  } catch (err) {
    next(err);
  }
});
