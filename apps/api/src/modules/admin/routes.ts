import { Router } from 'express';
import { AuthRequest, authMiddleware, requireAuth, requireAdmin } from '../../middleware/auth.js';
import { JobModel } from '../../models/Job.js';
import { UserModel } from '../../models/User.js';
import { CompanyModel } from '../../models/Company.js';
import { SkillModel } from '../../models/Skill.js';
import { seedDatabase } from '../../seed.js';

export const adminRouter = Router();

// Enforce strict Admin authentication and RBAC for all admin endpoints
adminRouter.use(authMiddleware);
adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// GET /api/v1/admin/stats - Overview metrics exclusively for administrators
adminRouter.get('/stats', async (req: AuthRequest, res, next) => {
  try {
    const [totalUsers, totalJobs, totalCompanies, totalSkills] = await Promise.all([
      UserModel.countDocuments(),
      JobModel.countDocuments(),
      CompanyModel.countDocuments(),
      SkillModel.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalCompanies,
        totalSkills,
        ingestionHealth: 'HEALTHY',
        aiStatus: 'AVAILABLE',
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/admin/seed - Trigger synthetic data seed
adminRouter.post('/seed', async (req: AuthRequest, res, next) => {
  try {
    const result = await seedDatabase();
    res.json({
      success: true,
      message: 'Synthetic seed data populated successfully.',
      data: result,
    });
  } catch (err) {
    next(err);
  }
});
