import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../../config/env.js';
import { AuthRequest, authMiddleware } from '../../middleware/auth.js';
import { UserModel } from '../../models/User.js';
import { ProfileModel } from '../../models/Profile.js';

export const authRouter = Router();

// Helper to sign JWT
function generateToken(userId: string, email: string, role: string) {
  return jwt.sign({ userId, email, role }, config.jwtSecret, {
    expiresIn: '7d',
  });
}

// Helper to set session cookie
function setAuthCookie(res: any, token: string) {
  res.cookie('jobpulse_session', token, {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// GET /api/v1/auth/me - Get current authenticated user & profile
authRouter.get('/me', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    let user = await UserModel.findById(userId);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User account not found' });
    }

    let profile = await ProfileModel.findOne({ userId: user._id });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
        },
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/signup - Email & Password registration
authRouter.post('/signup', async (req, res, next) => {
  try {
    const { email, password, name, currentRole, skills, experienceLevel } = req.body;

    if (!email || !password || !name || typeof email !== 'string' || typeof password !== 'string' || typeof name !== 'string') {
      return res.status(400).json({ success: false, error: 'Email, password, and name are required strings' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters long' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await UserModel.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const username = normalizedEmail.split('@')[0] + Math.floor(Math.random() * 1000);
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;

    const user = await UserModel.create({
      email: normalizedEmail,
      name: name.trim(),
      username,
      avatar,
      passwordHash,
      role: 'user',
    });

    const parsedSkills = Array.isArray(skills) ? skills : (skills ? String(skills).split(',').map((s: string) => s.trim()) : ['React', 'TypeScript', 'Node.js']);
    const initialRole = (typeof currentRole === 'string' && currentRole.trim()) ? currentRole.trim() : 'Software Engineer';

    const profile = await ProfileModel.create({
      userId: user._id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      education: 'Bachelor of Technology / Computer Science',
      degree: 'B.Tech CS',
      graduationYear: new Date().getFullYear(),
      experienceLevel: experienceLevel || 'MID',
      currentRole: initialRole,
      targetRoles: [initialRole, 'Senior Software Engineer', 'Full Stack Developer'],
      skills: parsedSkills,
      preferredLocations: ['Bangalore', 'Remote', 'Hyderabad'],
      remotePreference: 'ANY',
      salaryExpectation: 1500000,
      yearsOfExperience: 3,
      profileVisibility: 'PUBLIC',
      profileCompleteness: 85,
    });

    const token = generateToken(user._id.toString(), user.email, user.role);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
        },
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/login - Email & Password sign-in
authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Email and password must be valid strings' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    if (user.passwordHash) {
      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }
    }

    let profile = await ProfileModel.findOne({ userId: user._id });
    if (!profile) {
      profile = await ProfileModel.create({
        userId: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        education: 'Bachelor of Science / Engineering',
        degree: 'B.S.',
        experienceLevel: 'MID',
        currentRole: 'Software Engineer',
        targetRoles: ['Full Stack Developer', 'Frontend Engineer'],
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB'],
        preferredLocations: ['Remote', 'Bangalore'],
        remotePreference: 'ANY',
        salaryExpectation: 1400000,
        yearsOfExperience: 3,
        profileVisibility: 'PUBLIC',
        profileCompleteness: 90,
      });
    }

    const token = generateToken(user._id.toString(), user.email, user.role);
    setAuthCookie(res, token);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
        },
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/google - Google OAuth Signup / Sign-in
authRouter.post('/google', async (req, res, next) => {
  try {
    const { credential, email, name, picture, googleId } = req.body;

    let userEmail = typeof email === 'string' ? email : '';
    let userName = typeof name === 'string' ? name : '';
    let userAvatar = typeof picture === 'string' ? picture : '';
    let userGoogleId = typeof googleId === 'string' ? googleId : '';

    if (credential && typeof credential === 'string') {
      try {
        const payloadBase64 = credential.split('.')[1];
        if (payloadBase64) {
          const decoded = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
          userEmail = decoded.email || userEmail;
          userName = decoded.name || userName;
          userAvatar = decoded.picture || userAvatar;
          userGoogleId = decoded.sub || userGoogleId;
        }
      } catch (e) {
        console.warn('[Google Auth] Failed to parse credential token:', e);
      }
    }

    if (!userEmail) {
      return res.status(400).json({ success: false, error: 'Google account email not provided' });
    }

    const normalizedEmail = userEmail.toLowerCase().trim();
    let user = await UserModel.findOne({ $or: [{ googleId: userGoogleId }, { email: normalizedEmail }] });

    if (!user) {
      const username = normalizedEmail.split('@')[0] + Math.floor(Math.random() * 1000);
      user = await UserModel.create({
        googleId: userGoogleId,
        email: normalizedEmail,
        name: userName || normalizedEmail.split('@')[0],
        username,
        avatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        role: 'user',
      });

      await ProfileModel.create({
        userId: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        education: 'Bachelor of Science / Engineering',
        degree: 'B.S.',
        experienceLevel: 'MID',
        currentRole: 'Software Engineer',
        targetRoles: ['Full Stack Developer', 'Frontend Engineer', 'Backend Engineer'],
        skills: ['React', 'TypeScript', 'Node.js', 'MongoDB', 'Tailwind CSS'],
        preferredLocations: ['Remote', 'Bangalore'],
        remotePreference: 'ANY',
        salaryExpectation: 1500000,
        yearsOfExperience: 3,
        profileVisibility: 'PUBLIC',
        profileCompleteness: 90,
      });
    } else {
      if (userGoogleId && !user.googleId) {
        user.googleId = userGoogleId;
        await user.save();
      }
    }

    const profile = await ProfileModel.findOne({ userId: user._id });
    const token = generateToken(user._id.toString(), user.email, user.role);
    setAuthCookie(res, token);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          role: user.role,
        },
        profile,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/logout - Sign out
authRouter.post('/logout', (req, res) => {
  res.clearCookie('jobpulse_session');
  res.json({ success: true, message: 'Logged out successfully' });
});
