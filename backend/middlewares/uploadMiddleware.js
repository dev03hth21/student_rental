const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ROOM_MEDIA_DIR = path.join(__dirname, '..', 'uploads', 'rooms');

const ensureUploadDir = () => {
  if (!fs.existsSync(ROOM_MEDIA_DIR)) {
    fs.mkdirSync(ROOM_MEDIA_DIR, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      ensureUploadDir();
      cb(null, ROOM_MEDIA_DIR);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype || !file.mimetype.startsWith('image/')) {
    return cb(new Error('Chỉ có thể tải lên tệp hình ảnh'));
  }
  cb(null, true);
};

// Memory storage for Cloudinary uploads (avatar, rooms, etc.)
const memoryStorage = multer.memoryStorage();

const roomImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024,
  },
});

// Memory upload for Cloudinary (rooms)
const roomImageUploadMemory = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    files: 10,
    fileSize: 5 * 1024 * 1024,
  },
});

const upload = multer({
  storage: memoryStorage,
  fileFilter,
  limits: {
    files: 1,
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = {
  roomImageUpload,
  roomImageUploadMemory,
  upload,
  ROOM_MEDIA_DIR,
};
