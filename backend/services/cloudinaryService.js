const stream = require('stream');
const cloudinary = require('../config/cloudinary');

const DEFAULT_FOLDER = 'rooms';

const uploadFromStream = (buffer, options = {}) =>
  new Promise((resolve, reject) => {
    const passthrough = new stream.PassThrough();
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }
      return resolve(result);
    });
    passthrough.end(buffer);
    passthrough.pipe(uploadStream);
  });

const uploadImage = async ({ filePath, buffer, folder = DEFAULT_FOLDER, options = {} }) => {
  if (!filePath && !buffer) {
    throw new Error('Thiếu dữ liệu ảnh để upload');
  }

  const uploadOptions = { folder, ...options };

  if (filePath) {
    return cloudinary.uploader.upload(filePath, uploadOptions);
  }

  return uploadFromStream(buffer, uploadOptions);
};

const deleteImage = async (publicId) => {
  if (!publicId) return null;
  return cloudinary.uploader.destroy(publicId);
};

const verifyConnection = async () => {
  try {
    return await cloudinary.api.ping();
  } catch (error) {
    throw new Error(`Không thể kết nối Cloudinary: ${error.message}`);
  }
};

const uploadToCloudinary = (buffer, folder = 'avatars') => {
  return uploadFromStream(buffer, { folder });
};

module.exports = {
  uploadImage,
  uploadToCloudinary,
  deleteImage,
  verifyConnection,
};
