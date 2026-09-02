import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../../middleware/auth.js';
import { validateIdParam } from '../../middleware/sanitize.js';
import { ApplicationModel } from '../../models/Application.js';
import { ApplicationSchema } from '@jobpulse/validation';

export const applicationsRouter = Router();

// GET /applications - List user's job applications
applicationsRouter.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const items = await ApplicationModel.find({ userId }).sort({ updatedAt: -1 }).lean();

    res.json({
      success: true,
      data: items.map((i) => ({ id: i._id.toString(), ...i })),
    });
  } catch (err) {
    next(err);
  }
});

// POST /applications - Create job application tracker item
applicationsRouter.post('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const data = ApplicationSchema.parse(req.body);

    const app = await ApplicationModel.create({
      userId,
      ...data,
      appliedDate: new Date(data.appliedDate),
    });

    res.json({
      success: true,
      data: { id: app._id.toString(), ...app.toObject() },
    });
  } catch (err) {
    next(err);
  }
});

// PUT /applications/:id - Update application status/notes (IDOR protected)
applicationsRouter.put('/:id', authMiddleware, validateIdParam, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const { status, notes, interviewDates, salaryOffered, followUpDate } = req.body;

    const updated = await ApplicationModel.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { status, notes, interviewDates, salaryOffered, followUpDate } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, error: 'Application record not found or access denied.' });
    }

    res.json({
      success: true,
      data: { id: updated._id.toString(), ...updated.toObject() },
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /applications/:id - Delete application (IDOR protected)
applicationsRouter.delete('/:id', authMiddleware, validateIdParam, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const result = await ApplicationModel.deleteOne({ _id: req.params.id, userId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, error: 'Application record not found or access denied.' });
    }
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    next(err);
  }
});
