#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const BACKEND_DIR = path.resolve(__dirname, '..');
const ROOT_DIR = path.resolve(__dirname, '..', '..');
const DEFAULT_DB_URI = 'mongodb://localhost:27017/student-rental';

const envCandidates = [
  path.resolve(BACKEND_DIR, '.env'),
  path.resolve(ROOT_DIR, '.env')
];

envCandidates.forEach((candidate) => {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate, override: false });
  }
});
// Fallback: load .env from current working directory if present
dotenv.config({ override: false });

const dbUri = process.env.MONGODB_URI || process.env.MONGO_URL || DEFAULT_DB_URI;

async function resetDatabase() {
  if (!dbUri) {
    throw new Error('Không xác định được MONGODB_URI để xoá dữ liệu');
  }

  console.log('🧹 Đang kết nối tới MongoDB:', dbUri);
  await mongoose.connect(dbUri);

  const dbName = mongoose.connection.name;
  await mongoose.connection.db.dropDatabase();
  console.log(`✅ Đã xoá toàn bộ database "${dbName}"`);

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

resetDatabase().catch((error) => {
  console.error('❌ Lỗi khi reset database:', error.message);
  mongoose.connection.readyState && mongoose.disconnect();
  process.exit(1);
});
