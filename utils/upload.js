const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const useCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

let upload;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'elearning',
      allowed_formats: ['jpg', 'png', 'mp4']
    }
  });
  upload = multer({ storage });
} else {
  // Fallback local memory storage
  upload = multer({ storage: multer.memoryStorage() });
}

module.exports = upload;