import { Router } from 'express';
import { JobDescriptionInputSchema } from '@jobpulse/validation';
import { aiProvider } from '../../services/aiProvider.js';

export const jobDescriptionsRouter = Router();

// POST /job-descriptions/analyze
jobDescriptionsRouter.post('/analyze', async (req, res, next) => {
  try {
    const { text } = JobDescriptionInputSchema.parse(req.body);
    const analysis = await aiProvider.analyzeJobDescription(text);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (err) {
    next(err);
  }
});
