import { Router } from 'express';
import { SkillModel } from '../../models/Skill.js';
import { JobModel } from '../../models/Job.js';
import { LearningResourceModel } from '../../models/LearningResource.js';

export const skillsRouter = Router();

// GET /skills
skillsRouter.get('/', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      filter.name = { $regex: new RegExp(search, 'i') };
    }
    if (category && typeof category === 'string') {
      filter.category = category;
    }

    const skills = await SkillModel.find(filter).sort({ demandCount: -1 }).lean();

    res.json({
      success: true,
      data: skills.map((s) => ({ id: s._id.toString(), ...s })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /skills/trending
skillsRouter.get('/trending', async (req, res, next) => {
  try {
    const trending = await SkillModel.find({}).sort({ growthRate: -1 }).limit(10).lean();
    res.json({
      success: true,
      data: trending.map((s) => ({ id: s._id.toString(), ...s })),
    });
  } catch (err) {
    next(err);
  }
});

// GET /skills/:id
skillsRouter.get('/:id', async (req, res, next) => {
  try {
    let skill = await SkillModel.findById(req.params.id).lean();
    if (!skill) {
      skill = await SkillModel.findOne({ slug: req.params.id }).lean();
    }
    if (!skill) {
      return res.status(404).json({ success: false, error: 'Skill not found' });
    }

    const [relatedJobs, resources] = await Promise.all([
      JobModel.find({ skills: { $in: [skill.name] }, status: 'ACTIVE' }).limit(10).lean(),
      LearningResourceModel.find({ skills: { $in: [skill.name] } }).limit(5).lean(),
    ]);

    res.json({
      success: true,
      data: {
        id: skill._id.toString(),
        ...skill,
        relatedJobs: relatedJobs.map((j) => ({ id: j._id.toString(), ...j })),
        resources: resources.map((r) => ({ id: r._id.toString(), ...r })),
      },
    });
  } catch (err) {
    next(err);
  }
});
