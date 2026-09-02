import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../../middleware/auth.js';
import { validateIdParam } from '../../middleware/sanitize.js';
import { AlertModel } from '../../models/Alert.js';
import { AlertSchema } from '@jobpulse/validation';

export const alertsRouter = Router();

// GET /alerts - List user's job alerts
alertsRouter.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const items = await AlertModel.find({ userId }).sort({ createdAt: -1 }).lean();
    res.json({
      success: true,
      data: items.map((i) => ({ id: i._id.toString(), ...i })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /alerts - Create custom alert
alertsRouter.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const data = AlertSchema.parse(req.body);

    const alert = await AlertModel.create({
      userId,
      ...data,
    });

    res.json({
      success: true,
      data: { id: alert._id.toString(), ...alert.toObject() },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /alerts/:id - Delete alert (IDOR protected)
alertsRouter.delete('/:id', authMiddleware, validateIdParam, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const result = await AlertModel.deleteOne({ _id: req.params.id, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Alert not found or access denied.' });
    }
    res.json({ success: true, message: 'Alert deleted successfully' });
  } catch (err) {
    next(err);
  }
});
