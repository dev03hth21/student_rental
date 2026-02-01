#!/usr/bin/env node
/* eslint-disable no-console */
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const User = require('../../models/User');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const envCandidates = [
  path.resolve(ROOT_DIR, '.env'),
  path.resolve(__dirname, '..', '.env'),
];

envCandidates.forEach((candidate) => {
  dotenv.config({ path: candidate, override: false });
});
dotenv.config({ override: false });

const DEFAULT_DB_URI = 'mongodb://localhost:27017/student-rental';

(async () => {
  const dbUri = process.env.MONGO_URL || process.env.MONGODB_URI || DEFAULT_DB_URI;
  console.log(`📡 Connecting to ${dbUri}`);
  await mongoose.connect(dbUri);

  try {
    const hostCount = await User.countDocuments({ role: 'host' });
    if (!hostCount) {
      console.log('✅ No users with role "host" were found. Nothing to migrate.');
    } else {
      const updateResult = await User.updateMany(
        { role: 'host' },
        { $set: { role: 'owner' } }
      );
      console.log(
        `🔄 Updated ${updateResult.modifiedCount || updateResult.nModified || 0} user(s) from host → owner`
      );
    }

    const remainingRoles = await User.distinct('role');
    console.log(`🎯 Distinct roles after migration: ${remainingRoles.join(', ')}`);

    await mongoose.disconnect();
    console.log('✅ Host role removal migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('⚠️ Failed to disconnect cleanly:', disconnectError);
    }
    process.exit(1);
  }
})();
