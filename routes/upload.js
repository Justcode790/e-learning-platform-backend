const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

// Route for uploading both image and video
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = req.file.path; // Cloudinary URL
    const fileType = req.file.mimetype.startsWith('video') ? 'video' : 'image';

    res.json({
      success: true,
      fileType,
      url: fileUrl
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

module.exports = router;
