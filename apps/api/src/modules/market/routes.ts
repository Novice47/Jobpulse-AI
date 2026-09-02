import { Router } from 'express';
import { MarketSnapshotModel } from '../../models/MarketSnapshot.js';
import { JobModel } from '../../models/Job.js';
import { SkillModel } from '../../models/Skill.js';
import { CompanyModel } from '../../models/Company.js';

export const marketRouter = Router();

// GET /market/overview
marketRouter.get('/overview', async (req, res, next) => {
  try {
    const period = (req.query.period as string) || '30d';

    const latestSnapshot = await MarketSnapshotModel.findOne({ period }).sort({ timestamp: -1 }).lean();

    const totalJobs = await JobModel.countDocuments({ status: 'ACTIVE' });
    const remoteJobs = await JobModel.countDocuments({ status: 'ACTIVE', remoteType: 'REMOTE' });
    const totalCompanies = await CompanyModel.countDocuments({});
    const totalSkills = await SkillModel.countDocuments({});

    const topSkills = await SkillModel.find({}).sort({ demandCount: -1 }).limit(8).lean();
    const topGrowingSkills = await SkillModel.find({}).sort({ growthRate: -1 }).limit(8).lean();

    const data = {
      period,
      totalJobs: totalJobs || 1250,
      remotePercentage: totalJobs > 0 ? Math.round((remoteJobs / totalJobs) * 100) : 38,
      totalCompanies: totalCompanies || 140,
      totalSkillsTracked: totalSkills || 65,
      topSkills: topSkills.map((s) => ({ name: s.name, count: s.demandCount, growthRate: s.growthRate })),
      topGrowingSkills: topGrowingSkills.map((s) => ({ name: s.name, growthRate: s.growthRate })),
      salaryStats: latestSnapshot?.salaryStats || { median: 1450000, p25: 900000, p75: 2200000 },
      isSynthetic: true,
    };

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

// GET /market/snapshots
marketRouter.get('/snapshots', async (req, res, next) => {
  try {
    const snapshots = await MarketSnapshotModel.find({}).sort({ timestamp: -1 }).limit(10).lean();
    res.json({
      success: true,
      data: snapshots.map((s) => ({ id: s._id.toString(), ...s })),
    });
  } catch (err) {
    next(err);
  }
});
