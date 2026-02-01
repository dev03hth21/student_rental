/**
 * Migration: Add GeoJSON coordinates for geo queries
 * 
 * Run: node backend/scripts/migrations/addGeoCoordinates.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });

const Room = require('../../models/Room');

async function addGeoCoordinates() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/student-rental');
    console.log('✅ Connected to MongoDB\n');

    // Update Room schema to include GeoJSON coordinates
    console.log('📊 Updating rooms with GeoJSON coordinates...');
    
    const rooms = await Room.find({
      'location.lat': { $exists: true },
      'location.lng': { $exists: true },
    });

    console.log(`Found ${rooms.length} rooms with lat/lng\n`);

    let updated = 0;
    for (const room of rooms) {
      if (room.location.lat && room.location.lng) {
        // Add coordinates field in GeoJSON format
        await Room.updateOne(
          { _id: room._id },
          {
            $set: {
              'location.type': 'Point',
              'location.coordinates': [room.location.lng, room.location.lat] // [lng, lat]
            }
          }
        );
        updated++;
        
        if (updated % 10 === 0) {
          console.log(`Updated ${updated} rooms...`);
        }
      }
    }

    console.log(`\n✅ Updated ${updated} rooms with GeoJSON coordinates`);

    // Create 2dsphere index
    console.log('\n📍 Creating 2dsphere index...');
    await Room.collection.createIndex({ 'location.coordinates': '2dsphere' });
    console.log('✅ Index created');

    await mongoose.disconnect();
    console.log('\n✅ Migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addGeoCoordinates();
