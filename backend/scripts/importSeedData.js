#!/usr/bin/env node
/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const BACKEND_DIR = path.resolve(__dirname, '..');
const ACCOUNT_FILE = path.resolve(ROOT_DIR, 'account.json');
const BOOKING_FILE = path.resolve(ROOT_DIR, 'booking.json');
const DEFAULT_DB_URI = 'mongodb://localhost:27017/student-rental';

const envCandidates = [
  path.resolve(BACKEND_DIR, '.env'),
  path.resolve(ROOT_DIR, '.env')
];

envCandidates.forEach(candidate => {
  if (fs.existsSync(candidate)) {
    dotenv.config({ path: candidate, override: false });
  }
});
// As fallback, load from current working directory (.env) if available
dotenv.config({ override: false });

const DEFAULT_PASSWORD = process.env.SEED_DEFAULT_PASSWORD || 'Password@123';

const AMENITY_KEYWORDS = [
  { test: /wifi/i, value: 'wifi' },
  { test: /máy\s*lạnh|air/i, value: 'air_conditioner' },
  { test: /nước\s*nóng|water heater/i, value: 'water_heater' },
  { test: /máy\s*giặt|washing/i, value: 'washing_machine' },
  { test: /tủ\s*lạnh|fridge|refrigerator/i, value: 'refrigerator' },
  { test: /giường|bed/i, value: 'bed' },
  { test: /tủ|wardrobe/i, value: 'wardrobe' },
  { test: /bàn|desk/i, value: 'desk' },
  { test: /thang\s*máy|elevator/i, value: 'elevator' },
  { test: /ban\s*công|balcony/i, value: 'balcony' },
  { test: /bãi\s*xe|parking/i, value: 'parking' },
  { test: /an\s*ninh|security|camera/i, value: 'security' },
  { test: /pet/i, value: 'pet_allowed' }
];

const ensureArray = value => Array.isArray(value) ? value : [];

const stripComments = text => text.replace(/\/\*[\s\S]*?\*\//g, '');

const extractTopLevelSegments = text => {
  const segments = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escapeNext = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escapeNext) {
        escapeNext = false;
      } else if (char === '\\') {
        escapeNext = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '[' || char === '{') {
      if (depth === 0) {
        start = index;
      }
      depth += 1;
      continue;
    }

    if (char === ']' || char === '}') {
      depth -= 1;
      if (depth === 0 && start !== -1) {
        segments.push(text.slice(start, index + 1));
        start = -1;
      }
      continue;
    }
  }

  return segments;
};

const parseLooseJsonFile = filePath => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing data file: ${filePath}`);
  }

  const raw = fs.readFileSync(filePath, 'utf8');
  const sanitized = stripComments(raw);
  const segments = extractTopLevelSegments(sanitized);
  if (!segments.length) {
    return [];
  }

  const flattened = [];

  for (const segment of segments) {
    if (!segment.trim()) continue;
    try {
      const sanitizedSegment = segment.replace(/,(\s*[}\]])/g, '$1');
      const parsed = JSON.parse(sanitizedSegment);
      if (Array.isArray(parsed)) {
        flattened.push(...parsed);
      } else if (typeof parsed === 'object' && parsed !== null) {
        flattened.push(parsed);
      }
    } catch (error) {
      const preview = segment.slice(0, 200).replace(/\s+/g, ' ').trim();
      throw new Error(`Unable to parse ${path.basename(filePath)}: ${error.message} | Segment preview: ${preview}`);
    }
  }

  return flattened;
};

const convertSpecialTypes = input => {
  if (Array.isArray(input)) {
    return input.map(convertSpecialTypes);
  }

  if (input && typeof input === 'object') {
    if (Object.keys(input).length === 1 && Object.prototype.hasOwnProperty.call(input, '$oid')) {
      return new mongoose.Types.ObjectId(input.$oid);
    }
    if (Object.keys(input).length === 1 && Object.prototype.hasOwnProperty.call(input, '$date')) {
      return new Date(input.$date);
    }

    return Object.entries(input).reduce((acc, [key, value]) => {
      acc[key] = convertSpecialTypes(value);
      return acc;
    }, {});
  }

  return input;
};

const mapUserStatus = status => {
  if (!status) return 'unverified';
  const normalized = status.toLowerCase();
  if (['active', 'blocked', 'unverified'].includes(normalized)) {
    return normalized;
  }
  return 'unverified';
};

const deriveAmenities = (labels = []) => {
  const normalized = ensureArray(labels)
    .map(label => (typeof label === 'string' ? label.trim() : ''))
    .filter(Boolean);

  const amenities = new Set();

  normalized.forEach(label => {
    AMENITY_KEYWORDS.forEach(({ test, value }) => {
      if (test.test(label)) {
        amenities.add(value);
      }
    });
  });

  return Array.from(amenities);
};

const toGeoPoint = (location = {}) => {
  const lat = Number(location.lat ?? location.latitude);
  const lng = Number(location.lng ?? location.longitude);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return {
      type: 'Point',
      coordinates: [lng, lat]
    };
  }

  // Default to Ho Chi Minh City coordinates if missing
  return {
    type: 'Point',
    coordinates: [106.660172, 10.762622]
  };
};

const deriveDepositAmount = price => {
  if (!Number.isFinite(price)) return 0;
  // 1 month rent as deposit to keep it simple
  return price;
};

const deriveCapacity = area => {
  if (!Number.isFinite(area)) return 1;
  if (area >= 28) return 3;
  if (area >= 20) return 2;
  return 1;
};

const summarizeContractNotes = record => {
  const bits = [];
  if (record.paymentId) bits.push(`paymentId=${record.paymentId}`);
  if (record.contractUrl) bits.push(`contract=${record.contractUrl}`);
  return bits.join(' | ') || undefined;
};

const derivePaymentStatus = record => {
  if (record.status === 'completed') return 'fully_paid';
  if (record.status === 'paid' || record.paymentId) return 'deposit_paid';
  return 'unpaid';
};

const ensureDateValue = (value, fallback) => {
  if (!value) return fallback ? new Date(fallback) : new Date();
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback ? new Date(fallback) : new Date();
  }
  return date;
};

const prepareUsers = async accounts => {
  if (!accounts.length) return [];
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  return accounts.map(account => ({
    _id: account._id,
    email: account.email?.toLowerCase(),
    password: passwordHash,
    role: account.role || 'student',
    status: mapUserStatus(account.status),
    fullName: account.fullName,
    phone: account.phone,
    avatar: account.avatarUrl || account.avatar,
    identityCard: account.idCardFront || account.identityCard,
    isVerified: Boolean(account.verified),
    isActive: account.status !== 'blocked',
    createdAt: account.createdAt ? new Date(account.createdAt) : new Date(),
    updatedAt: account.updatedAt ? new Date(account.updatedAt) : new Date()
  }));
};

const prepareRooms = rooms => {
  if (!rooms.length) return { roomsPayload: [], priceMap: new Map() };

  const priceMap = new Map();

  const roomsPayload = rooms.map(room => {
    const price = room.price ?? 0;
    priceMap.set(String(room._id), price);

    return {
      _id: room._id,
      owner: room.ownerId || room.owner,
      title: room.title,
      description: room.description,
      price,
      deposit: deriveDepositAmount(price),
      area: room.area,
      capacity: deriveCapacity(room.area),
      address: {
        fullAddress: room.address,
        city: room.address?.includes('TP.HCM') ? 'TP.HCM' : undefined
      },
      location: toGeoPoint(room.location),
      images: ensureArray(room.images).map(url => ({ url })),
      amenities: deriveAmenities(room.utilities),
      utilities: {
        electricity: { included: false },
        water: { included: false },
        internet: { included: true },
        cleaning: { included: false }
      },
      status: room.status || 'available',
      approvalStatus: 'approved',
      createdAt: room.createdAt ? new Date(room.createdAt) : new Date(),
      updatedAt: room.updatedAt ? new Date(room.updatedAt) : new Date()
    };
  });

  return { roomsPayload, priceMap };
};

const prepareBookings = (bookings, priceMap, knownUserIds = new Set()) => {
  if (!bookings.length) return { bookingsPayload: [], missingStudents: new Set(), missingRooms: new Set() };

  const missingStudents = new Set();
  const missingRooms = new Set();

  const bookingsPayload = bookings.map(booking => {
    const roomId = booking.roomId || booking.room;
    const studentId = booking.studentId || booking.student;
    const ownerId = booking.ownerId || booking.owner;
    const price = priceMap.get(String(roomId));
    if (!price) {
      missingRooms.add(String(roomId));
    }

    const payload = {
      _id: booking._id,
      room: roomId,
      student: studentId,
      owner: ownerId,
      checkInDate: ensureDateValue(booking.checkinDate || booking.checkInDate || booking.createdAt),
      checkOutDate: booking.checkoutDate ? ensureDateValue(booking.checkoutDate) : null,
      depositAmount: booking.depositAmount ?? 0,
      monthlyRent: price ?? booking.depositAmount ?? 0,
      status: booking.status || 'pending',
      paymentStatus: derivePaymentStatus(booking),
      notes: summarizeContractNotes(booking),
      cancellationReason: booking.status === 'cancelled' ? (booking.cancellationReason || 'Cancelled during seed import') : undefined,
      createdAt: booking.createdAt ? new Date(booking.createdAt) : new Date(),
      updatedAt: booking.updatedAt ? new Date(booking.updatedAt) : new Date()
    };

    const studentKey = studentId ? String(studentId) : 'missing-student-id';
    if (!studentId || (knownUserIds.size && !knownUserIds.has(studentKey))) {
      missingStudents.add(studentKey);
    }

    return payload;
  });

  return { bookingsPayload, missingStudents, missingRooms };
};

const upsertCollection = async (Model, payload) => {
  if (!payload.length) return 0;
  const ids = payload.map(doc => doc._id);
  await Model.deleteMany({ _id: { $in: ids } });
  await Model.insertMany(payload, { ordered: false });
  return payload.length;
};

const seed = async () => {
  const dbUri = process.env.MONGO_URL || process.env.MONGODB_URI || DEFAULT_DB_URI;
  console.log(`📦 Using Mongo URI: ${dbUri}`);

  await mongoose.connect(dbUri);
  console.log('✅ Connected to MongoDB');

  const accountDocs = parseLooseJsonFile(ACCOUNT_FILE).map(convertSpecialTypes);
  const bookingDocs = parseLooseJsonFile(BOOKING_FILE).map(convertSpecialTypes);

  const accounts = accountDocs.filter(Boolean);
  const roomsRaw = bookingDocs.filter(doc => Object.prototype.hasOwnProperty.call(doc, 'price'));
  const bookingsRaw = bookingDocs.filter(doc => Object.prototype.hasOwnProperty.call(doc, 'depositAmount'));

  const usersPayload = await prepareUsers(accounts);
  const knownUserIds = new Set(usersPayload.map(user => String(user._id)));
  const { roomsPayload, priceMap } = prepareRooms(roomsRaw);
  const { bookingsPayload, missingStudents, missingRooms } = prepareBookings(bookingsRaw, priceMap, knownUserIds);

  console.log(`➡️ Preparing to seed ${usersPayload.length} users, ${roomsPayload.length} rooms, ${bookingsPayload.length} bookings.`);

  const insertedUsers = await upsertCollection(User, usersPayload);
  const insertedRooms = await upsertCollection(Room, roomsPayload);
  const insertedBookings = await upsertCollection(Booking, bookingsPayload);

  if (missingStudents.size) {
    console.warn(`⚠️ WARN: ${missingStudents.size} student ids referenced in bookings were not found in account.json.`);
    console.warn(`   Missing IDs: ${Array.from(missingStudents).join(', ')}`);
  }
  if (missingRooms.size) {
    console.warn(`⚠️ WARN: ${missingRooms.size} bookings reference rooms missing price data.`);
    console.warn(`   Missing Room IDs: ${Array.from(missingRooms).join(', ')}`);
  }

  console.log('🎉 Seed data imported successfully!');
  console.log(`   • Users inserted:    ${insertedUsers}`);
  console.log(`   • Rooms inserted:    ${insertedRooms}`);
  console.log(`   • Bookings inserted: ${insertedBookings}`);

  await mongoose.disconnect();
};

seed()
  .then(() => process.exit(0))
  .catch(async error => {
    console.error('❌ Seed import failed:', error);
    try {
      await mongoose.disconnect();
    } catch (_) {
      // ignore
    }
    process.exit(1);
  });
