const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { verifyConnection } = require('../services/cloudinaryService');

const hasCredentials =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME) &&
  Boolean(process.env.CLOUDINARY_API_KEY) &&
  Boolean(process.env.CLOUDINARY_API_SECRET);

describe('Cloudinary integration', () => {
  if (!hasCredentials) {
    test.skip('cloudinary credentials not provided', () => {});
    return;
  }

  test(
    'ping returns ok status',
    async () => {
      const response = await verifyConnection();
      expect(response?.status).toBe('ok');
    },
    15000
  );
});
