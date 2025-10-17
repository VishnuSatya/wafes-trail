const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');
const verifyToken = require('../middleware/authMiddleware');

// ensure uploads/videos folder exists
const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads', 'videos');
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

// multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_ROOT);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, safeName);
  }
});

// file filter - accept common video mime types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 250 * 1024 * 1024 } // 250 MB limit (adjust as needed)
});

// POST /api/videos/upload
// fields: title (string), video (file)
router.post('/upload', verifyToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    // build relative file path stored in DB
    // store using forward slashes so it works cross-platform
    const relativePath = path.join('uploads', 'videos', req.file.filename).split(path.sep).join('/');

    const video = new Video({
      title,
      filePath: relativePath,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploader: req.user.id || req.user._id // depends on your JWT payload
    });

    await video.save();
    res.json({ message: 'Video uploaded', video });
  } catch (err) {
    console.error('Upload error', err);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

// GET /api/videos
router.get('/', verifyToken, async (req, res) => {
  try {
    const videos = await Video.find().sort({ uploadedAt: -1 }).populate('uploader', 'name email');
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
