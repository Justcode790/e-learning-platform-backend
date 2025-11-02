const express = require('express');
const upload = require('../middleware/upload');

const router = express.Router();

// POST /api/upload
router.post('/', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    res.status(200).json({
      success: true,
      url: req.file.path, // Cloudinary URL is automatically added here
      resourceType: req.file.mimetype.startsWith('video') ? 'video' : 'image',
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});

module.exports = router;
