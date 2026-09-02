import { Router } from 'express';
import multer from 'multer';
import * as pdfParseModule from 'pdf-parse';
import { AuthRequest, authMiddleware, requireAuth } from '../../middleware/auth.js';
import { validateIdParam } from '../../middleware/sanitize.js';
import { ResumeAnalysisModel } from '../../models/ResumeAnalysis.js';
import { ProfileModel } from '../../models/Profile.js';
import { aiProvider } from '../../services/aiProvider.js';

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];
const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  'application/octet-stream',
];

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return cb(new Error('Invalid file format. Only PDF, DOCX, TXT, and Markdown files are permitted.'));
    }
    if (file.mimetype && !ALLOWED_MIMES.includes(file.mimetype)) {
      return cb(new Error('Invalid file MIME type.'));
    }
    cb(null, true);
  },
});

export const resumesRouter = Router();

/**
 * Validates buffer against executable headers and malicious script payloads
 */
function inspectFileSecurity(buffer: Buffer, originalName: string): { isSafe: boolean; reason?: string } {
  // 1. Check for Executable Magic Bytes
  if (buffer.length >= 2) {
    if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
      return { isSafe: false, reason: 'Executable Windows binaries (MZ) are strictly forbidden.' };
    }
  }
  if (buffer.length >= 4) {
    if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
      return { isSafe: false, reason: 'Executable Linux binaries (ELF) are strictly forbidden.' };
    }
  }

  // 2. For PDF files, verify PDF magic header %PDF-
  if (originalName.toLowerCase().endsWith('.pdf')) {
    const header = buffer.slice(0, 10).toString('latin1');
    if (!header.includes('%PDF-')) {
      return { isSafe: false, reason: 'Invalid PDF structure: missing standard PDF header.' };
    }
  }

  // 3. Scan for web-shell and exploit signatures
  const sample = buffer.slice(0, 8192).toString('latin1').toLowerCase();
  const dangerousPatterns = [
    /<script[\s>]/i,
    /javascript:/i,
    /eval\s*\(/i,
    /base64_decode\s*\(/i,
    /shell_exec\s*\(/i,
    /passthru\s*\(/i,
    /system\s*\(/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(sample)) {
      return { isSafe: false, reason: 'Malicious payload or executable script detected in document content.' };
    }
  }

  return { isSafe: true };
}

// Helper to extract clean text from any buffer (PDF, Word, Text)
async function extractTextFromUploadedBuffer(buffer: Buffer, originalName: string, mimetype: string): Promise<string> {
  let text = '';
  const isPdf = (mimetype && mimetype.includes('pdf')) || originalName.toLowerCase().endsWith('.pdf');

  if (isPdf) {
    // 1. Try modern pdf-parse v2 PDFParse class
    try {
      const PDFParseClass = (pdfParseModule as any).PDFParse || (pdfParseModule as any).default?.PDFParse;
      if (PDFParseClass) {
        const parser = new PDFParseClass({ data: buffer });
        const result = await parser.getText();
        if (result?.text && result.text.trim().length > 10) {
          text = result.text.trim();
        }
      }
    } catch (e: any) {
      console.warn('[Resume Parser] PDFParse class error:', e?.message || e);
    }

    // 2. Try legacy default function
    if (!text && typeof (pdfParseModule as any).default === 'function') {
      try {
        const result = await (pdfParseModule as any).default(buffer);
        if (result?.text && result.text.trim().length > 10) {
          text = result.text.trim();
        }
      } catch (e: any) {
        console.warn('[Resume Parser] Legacy pdfParse error:', e?.message || e);
      }
    }

    // 3. Fallback: extract printable strings from raw buffer
    if (!text || text.length < 15) {
      const rawString = buffer.toString('latin1');
      const matches = rawString.match(/[a-zA-Z0-9.,;:!?@#&()/\-+\s]{4,}/g);
      if (matches && matches.length > 5) {
        text = matches
          .map((s) => s.trim())
          .filter((s) => s.length > 3 && !s.startsWith('/Font') && !s.startsWith('/Type'))
          .join('\n');
      }
    }
  } else {
    // Non-PDF text buffer
    text = buffer.toString('utf-8').replace(/\0/g, '').trim();
  }

  return text;
}

// POST /api/v1/resumes/upload - Upload and analyze resume PDF or text, persisting full document & metadata to MongoDB
resumesRouter.post('/upload', authMiddleware, upload.single('resume'), async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const file = req.file;
    let textContent = (req.body?.text || '').trim();

    if (file) {
      // Perform security inspection before parsing
      const securityCheck = inspectFileSecurity(file.buffer, file.originalname);
      if (!securityCheck.isSafe) {
        return res.status(400).json({
          success: false,
          error: `Security Check Failed: ${securityCheck.reason}`,
        });
      }

      const parsedText = await extractTextFromUploadedBuffer(file.buffer, file.originalname, file.mimetype);
      if (parsedText && parsedText.trim().length > 10) {
        textContent = parsedText.trim();
      }
    }

    if (!textContent || textContent.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Could not extract sufficient readable text from the uploaded document. Please upload a standard PDF or paste resume text.',
      });
    }

    // Analyze with OpenAI or robust deterministic taxonomy parser
    const aiResult = await aiProvider.analyzeResume(textContent);

    const record = await ResumeAnalysisModel.create({
      userId,
      uploadedAt: new Date(),
      fileName: file ? file.originalname : 'pasted_resume.txt',
      fileUrl: file ? `/uploads/${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '')}` : '',
      fileSize: file ? file.size : Buffer.byteLength(textContent, 'utf-8'),
      mimeType: file ? file.mimetype || 'text/plain' : 'text/plain',
      rawText: textContent,
      fileData: file
        ? file.buffer.toString('base64')
        : Buffer.from(textContent, 'utf-8').toString('base64'),
      extractedName: aiResult.extractedName || 'Candidate',
      education: aiResult.education || [],
      experience: aiResult.experience || [],
      extractedSkills: aiResult.extractedSkills || [],
      roleAlignmentScore: aiResult.roleAlignmentScore || 78,
      missingSkills: aiResult.missingSkills || [],
      suggestions: aiResult.suggestions || [],
      atsScore: aiResult.atsScore || 82,
      isSynthetic: false,
    });

    // Automatically update the user profile in MongoDB if profile exists
    try {
      const existingProfile = await ProfileModel.findOne({ userId });
      if (existingProfile) {
        const skillSet = new Set(existingProfile.skills || []);
        aiResult.extractedSkills.forEach((s) => skillSet.add(s));
        await ProfileModel.updateOne(
          { userId },
          {
            $set: {
              skills: Array.from(skillSet),
              ...(aiResult.extractedName && aiResult.extractedName !== 'Candidate' ? { name: aiResult.extractedName } : {}),
            },
          }
        );
      }
    } catch (profErr) {
      console.warn('[Resume] Auto-profile sync notice:', profErr);
    }

    res.json({
      success: true,
      data: {
        id: record._id.toString(),
        ...record.toObject(),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/resumes/:id/download - Stream/download resume document stored in MongoDB
resumesRouter.get('/:id/download', authMiddleware, validateIdParam, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const resume = await ResumeAnalysisModel.findOne({ _id: req.params.id, userId });

    if (!resume || !resume.fileData) {
      return res.status(404).json({ success: false, error: 'Stored resume document not found or access denied.' });
    }

    const fileBuffer = Buffer.from(resume.fileData, 'base64');
    const fileName = resume.fileName || 'resume.pdf';
    const mimeType = resume.mimeType || 'application/pdf';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
    res.setHeader('Content-Length', fileBuffer.length);
    return res.send(fileBuffer);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/resumes/:id/raw - Get raw extracted text stored in MongoDB
resumesRouter.get('/:id/raw', authMiddleware, validateIdParam, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const resume = await ResumeAnalysisModel.findOne({ _id: req.params.id, userId });

    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume record not found or access denied.' });
    }

    res.json({
      success: true,
      data: {
        id: resume._id.toString(),
        fileName: resume.fileName,
        uploadedAt: resume.uploadedAt,
        rawText: resume.rawText || '',
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/resumes/:id/apply-to-profile - Sync resume skills to MongoDB profile (IDOR protected)
resumesRouter.post('/:id/apply-to-profile', authMiddleware, validateIdParam, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const resume = await ResumeAnalysisModel.findOne({ _id: req.params.id, userId });
    if (!resume) {
      return res.status(404).json({ success: false, error: 'Resume analysis record not found or access denied.' });
    }

    const currentProfile = await ProfileModel.findOne({ userId });
    const existingSkills = new Set(currentProfile?.skills || []);
    resume.extractedSkills.forEach((s) => existingSkills.add(s));

    const updatedProfile = await ProfileModel.findOneAndUpdate(
      { userId },
      {
        $set: {
          skills: Array.from(existingSkills),
          ...(resume.extractedName && resume.extractedName !== 'Candidate' ? { name: resume.extractedName } : {}),
        },
      },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Candidate skills updated successfully in MongoDB profile',
      data: updatedProfile,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/resumes - List user resumes (Strict ownership filtering)
resumesRouter.get('/', authMiddleware, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user?.userId || '65d100000000000000000001';
    const items = await ResumeAnalysisModel.find({ userId }).sort({ uploadedAt: -1 }).lean();
    res.json({
      success: true,
      data: items.map((i) => ({ id: i._id.toString(), ...i })),
    });
  } catch (err) {
    next(err);
  }
});
