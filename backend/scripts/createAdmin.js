#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const User = require('../models/User');

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
dotenv.config({ override: false });

const ADMIN_CREDENTIALS = {
  email: 'admin@student-rental.com',
  password: 'Admin@123456',
  fullName: 'System Administrator',
  role: 'admin',
  phone: '0123456789',
  isSuperAdmin: true,
};

async function createAdmin() {
  const dbUri = process.env.MONGODB_URI || process.env.MONGO_URL || DEFAULT_DB_URI;
  
  console.log('🔌 Đang kết nối tới MongoDB:', dbUri);
  await mongoose.connect(dbUri);
  console.log('✅ Đã kết nối MongoDB thành công');

  // Kiểm tra xem admin đã tồn tại chưa
  const existingAdmin = await User.findOne({ 
    email: ADMIN_CREDENTIALS.email 
  });

  if (existingAdmin) {
    console.log('⚠️  Tài khoản admin đã tồn tại!');
    console.log('📧 Email:', existingAdmin.email);
    console.log('👤 Tên:', existingAdmin.fullName);
    console.log('🔑 Role:', existingAdmin.role);
    
    // Cập nhật role/isSuperAdmin nếu chưa phải
    let updated = false;
    if (existingAdmin.role !== 'admin') {
      existingAdmin.role = 'admin';
      updated = true;
      console.log('✅ Đã cập nhật role thành admin');
    }
    if (!existingAdmin.isSuperAdmin) {
      existingAdmin.isSuperAdmin = true;
      updated = true;
      console.log('✅ Đã set Super Admin');
    }
    if (updated) {
      await existingAdmin.save();
    }
    
    await mongoose.disconnect();
    return;
  }

  // Tạo admin mới
  const passwordHash = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

  const admin = new User({
    email: ADMIN_CREDENTIALS.email,
    password: passwordHash,
    fullName: ADMIN_CREDENTIALS.fullName,
    role: ADMIN_CREDENTIALS.role,
    phone: ADMIN_CREDENTIALS.phone,
    status: 'active',
    isVerified: true,
    isActive: true
  });

  await admin.save();

  console.log('');
  console.log('🎉 TẠO TÀI KHOẢN ADMIN THÀNH CÔNG!');
  console.log('=====================================');
  console.log('📧 Email:    ', ADMIN_CREDENTIALS.email);
  console.log('🔒 Password: ', ADMIN_CREDENTIALS.password);
  console.log('👤 Tên:      ', ADMIN_CREDENTIALS.fullName);
  console.log('🔑 Role:     ', ADMIN_CREDENTIALS.role);
  console.log('=====================================');
  console.log('');
  console.log('⚠️  LƯU Ý: Hãy đổi mật khẩu sau khi đăng nhập lần đầu!');
  console.log('');

  await mongoose.disconnect();
  console.log('🔌 Đã ngắt kết nối MongoDB');
}

createAdmin()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Lỗi khi tạo admin:', error.message);
    mongoose.connection.readyState && mongoose.disconnect();
    process.exit(1);
  });
