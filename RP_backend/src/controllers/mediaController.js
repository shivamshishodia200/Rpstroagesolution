import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { MediaAsset } from '../models/MediaAsset.js';
import { logAudit } from '../utils/audit.js';

// Setup Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve('uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `rp-asset-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file format. Only JPEG, PNG, WebP, and SVG are supported.'), false);
  }
};

export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    const media = await MediaAsset.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      path: req.file.path,
      mimeType: req.file.mimetype,
      size: req.file.size,
      altText: req.body.altText || req.file.originalname.split('.')[0],
      uploadedBy: req.user._id,
    });

    await logAudit({
      req,
      action: 'UPLOAD_MEDIA',
      entityType: 'MediaAsset',
      entityId: media._id,
      details: `Uploaded asset '${media.originalName}'`,
    });

    return res.status(201).json({ success: true, media });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMediaList = async (req, res) => {
  try {
    const media = await MediaAsset.find().sort({ createdAt: -1 }).limit(50).lean();
    return res.status(200).json({ success: true, media });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteMedia = async (req, res) => {
  try {
    const media = await MediaAsset.findById(req.params.id);
    if (!media) return res.status(404).json({ success: false, message: 'Media asset not found.' });

    if (fs.existsSync(media.path)) {
      fs.unlinkSync(media.path);
    }

    await media.deleteOne();

    await logAudit({
      req,
      action: 'DELETE_MEDIA',
      entityType: 'MediaAsset',
      entityId: req.params.id,
      details: `Deleted media file '${media.filename}'`,
    });

    return res.status(200).json({ success: true, message: 'Asset deleted.' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
