import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../../middleware/auth.js';
import { NotificationModel } from '../../models/Notification.js';

export const notificationsRouter = Router();

// GET /notifications
notificationsRouter.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const items = await NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(20).lean();

    if (items.length === 0) {
      // Provide initial demo notifications
      const defaults = [
        {
          userId,
          title: '3 New Matching Jobs Found',
          message: 'Senior Full Stack Engineer position at TechCorp matches 92% of your profile.',
          type: 'JOB_ALERT',
          read: false,
          link: '/jobs',
          createdAt: new Date(),
        },
        {
          userId,
          title: 'Market Trend Insight',
          message: 'Demand for TypeScript & Next.js grew by +24% in the last 30 days.',
          type: 'MARKET_ALERT',
          read: true,
          link: '/market',
          createdAt: new Date(Date.now() - 86400000),
        },
      ];
      return res.json({
        success: true,
        data: defaults.map((d, i) => ({ id: `notif-${i}`, ...d })),
      });
    }

    res.json({
      success: true,
      data: items.map((i) => ({ id: i._id.toString(), ...i })),
    });
  } catch (err) {
    next(err);
  }
});
