import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../../middleware/auth.js';
import { ProfileModel } from '../../models/Profile.js';
import { UserProfileSchema } from '@jobpulse/validation';

export const usersRouter = Router();

function calculateProfileCompleteness(p: Partial<import('../../models/Profile.js').IProfileDocument>): number {
  let score = 0;
  if (p.name && p.name.trim()) score += 10;
  if (p.education && p.education.trim()) score += 10;
  if (p.experienceLevel) score += 10;
  if (p.currentRole && p.currentRole.trim()) score += 10;
  if (p.targetRoles && p.targetRoles.length > 0) score += 15;
  if (p.skills && p.skills.length >= 3) score += 20;
  else if (p.skills && p.skills.length > 0) score += 10;
  if (p.preferredLocations && p.preferredLocations.length > 0) score += 10;
  if (p.salaryExpectation && p.salaryExpectation > 0) score += 15;
  return Math.min(100, score);
}

// GET user profile
usersRouter.get('/profile', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    let profile = await ProfileModel.findOne({ userId });

    if (!profile) {
      profile = await ProfileModel.create({
        userId,
        name: 'Demo Candidate',
        username: 'democandidate',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        education: 'Bachelor of Science in Computer Science',
        degree: 'B.S. CS',
        graduationYear: 2024,
        experienceLevel: 'MID',
        currentRole: 'Full Stack Engineer',
        targetRoles: ['Full Stack Developer', 'Frontend Engineer', 'Backend Engineer'],
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Express', 'Tailwind CSS', 'SQL'],
        preferredLocations: ['Bangalore', 'Remote', 'Hyderabad'],
        remotePreference: 'ANY',
        salaryExpectation: 1400000,
        yearsOfExperience: 3,
        profileVisibility: 'PUBLIC',
        profileCompleteness: 100,
      });
    }

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

// PUT update profile
usersRouter.put('/profile', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    const validatedData = UserProfileSchema.parse(req.body);

    const completeness = calculateProfileCompleteness(validatedData as any);

    const profile = await ProfileModel.findOneAndUpdate(
      { userId },
      { ...validatedData, profileCompleteness: completeness },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});
