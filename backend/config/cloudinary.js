const cloudinary = require('cloudinary').v2;

typeof process.env.CLOUDINARY_CLOUD_NAME === 'undefined' && console.warn('[cloudinary] CLOUDINARY_CLOUD_NAME is missing');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

module.exports = cloudinary;
