#!/usr/bin/env node
/* eslint-disable no-console */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/student-rental';
const EMAIL = 'admin@student-rental.com';
const NEW_PASSWORD = 'Admin@123456';

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const user = await User.findOne({ email: EMAIL });
    if (!user) {
      console.error('Admin user not found');
      process.exit(1);
    }
    user.password = NEW_PASSWORD; // will be hashed by pre-save hook
    await user.save();
    console.log('Password reset OK for', EMAIL);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
