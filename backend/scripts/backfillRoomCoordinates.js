#!/usr/bin/env node
/* eslint-disable no-console */
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');
const Room = require('../models/Room');

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

const DISTRICT_COORDINATES = {
  'quan 1': { lat: 10.776889, lng: 106.700897 },
  'quan 3': { lat: 10.784024, lng: 106.695028 },
  'quan 4': { lat: 10.758217, lng: 106.706932 },
  'quan 5': { lat: 10.754027, lng: 106.666512 },
  'quan 7': { lat: 10.738, lng: 106.721403 },
  'quan 8': { lat: 10.724587, lng: 106.643241 },
  'quan 10': { lat: 10.773374, lng: 106.667984 },
  'quan 11': { lat: 10.762622, lng: 106.650247 },
  'quan binh thanh': { lat: 10.804173, lng: 106.707736 },
  'quan phu nhuan': { lat: 10.799194, lng: 106.680977 },
  'thu duc': { lat: 10.851, lng: 106.753 },
  'go vap': { lat: 10.84109, lng: 106.667343 },
  'tan binh': { lat: 10.803002, lng: 106.652001 },
  'tan phu': { lat: 10.790283, lng: 106.628609 },
};

const isValidLocation = (location = {}) => {
  if (!location.coordinates || location.coordinates.length !== 2) {
    return false;
  }
  const [lng, lat] = location.coordinates;
  return Number.isFinite(lat) && Number.isFinite(lng);
};

const normalizeKey = (value = '') => value.toLowerCase().normalize('NFD').replace(/[^a-z0-9\s]/g, '').trim();

const detectDistrictKey = (room) => {
  const candidates = [
    room.address?.district,
    room.address?.fullAddress,
  ]
    .filter(Boolean)
    .map(normalizeKey);

  for (const candidate of candidates) {
    for (const districtKey of Object.keys(DISTRICT_COORDINATES)) {
      if (candidate.includes(districtKey)) {
        return districtKey;
      }
    }
  }

  return null;
};

const upsertLocation = (roomDoc) => {
  const key = detectDistrictKey(roomDoc);
  if (!key) return null;
  const point = DISTRICT_COORDINATES[key];
  return {
    type: 'Point',
    coordinates: [point.lng, point.lat],
  };
};

(async () => {
  const dbUri = process.env.MONGO_URL || process.env.MONGODB_URI || DEFAULT_DB_URI;
  console.log(`📡 Connecting to ${dbUri}`);
  await mongoose.connect(dbUri);

  const rooms = await Room.find();
  let updated = 0;

  for (const room of rooms) {
    if (isValidLocation(room.location)) {
      continue;
    }

    const nextLocation = upsertLocation(room);
    if (!nextLocation) {
      continue;
    }

    room.location = nextLocation;
    await room.save({ validateBeforeSave: false });
    updated += 1;
    console.log(`✅ Updated ${room.title} -> ${nextLocation.coordinates.join(', ')}`);
  }

  console.log(`🎯 Done. Rooms updated: ${updated}`);
  await mongoose.disconnect();
  process.exit(0);
})().catch(async (error) => {
  console.error('❌ Backfill failed:', error);
  try {
    await mongoose.disconnect();
  } catch (disconnectError) {
    console.error(disconnectError);
  }
  process.exit(1);
});
