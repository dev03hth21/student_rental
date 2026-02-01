#!/usr/bin/env node
/* eslint-disable no-console */
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Room = require('../../models/Room');
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

const fetchOwnerPhones = async (ownerIds) => {
  if (!ownerIds.length) {
    return new Map();
  }
  const owners = await User.find({ _id: { $in: ownerIds } }).select('_id phone');
  return owners.reduce((acc, owner) => {
    const phone = owner.phone && owner.phone.trim();
    if (phone) {
      acc.set(owner._id.toString(), phone);
    }
    return acc;
  }, new Map());
};

(async () => {
  const dbUri = process.env.MONGO_URL || process.env.MONGODB_URI || DEFAULT_DB_URI;
  console.log(`📡 Connecting to ${dbUri}`);
  await mongoose.connect(dbUri);

  try {
    const renameResult = await Room.updateMany(
      { hostId: { $exists: true }, ownerId: { $exists: false } },
      { $rename: { hostId: 'ownerId' } }
    );
    console.log(`🔄 Renamed hostId → ownerId for ${renameResult.modifiedCount || renameResult.nModified || 0} rooms`);

    const roomsNeedingPhone = await Room.find({
      $or: [
        { contactPhone: { $exists: false } },
        { contactPhone: null },
        { contactPhone: '' },
      ],
    }).select('_id ownerId');

    const ownerIds = Array.from(
      new Set(
        roomsNeedingPhone
          .map((room) => room.ownerId?.toString())
          .filter(Boolean)
      )
    );
    const phoneMap = await fetchOwnerPhones(ownerIds);

    const bulkOps = roomsNeedingPhone
      .map((room) => {
        const phone = phoneMap.get(room.ownerId?.toString());
        if (!phone) {
          return null;
        }
        return {
          updateOne: {
            filter: { _id: room._id },
            update: { $set: { contactPhone: phone } },
          },
        };
      })
      .filter(Boolean);

    if (bulkOps.length) {
      const bulkResult = await Room.bulkWrite(bulkOps, { ordered: false });
      console.log(`📞 Backfilled contactPhone for ${bulkResult.modifiedCount || bulkResult.nModified || 0} rooms`);
    } else {
      console.log('📞 No rooms required contactPhone backfill');
    }

    await Room.collection.createIndex({ ownerId: 1, status: 1 }, { name: 'ownerId_status_idx' });
    console.log('📚 Ensured index ownerId_status_idx (ownerId + status)');

    console.log('✅ Migration completed successfully');
    await mongoose.disconnect();
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
