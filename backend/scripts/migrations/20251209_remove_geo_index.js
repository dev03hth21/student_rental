/**
 * Migration: Remove 2dsphere index on location field
 * 
 * Problem: The Room schema uses { lat, lng } format but a 2dsphere index
 * was previously created expecting GeoJSON format. This causes
 * "Can't extract geo keys" error when saving rooms.
 * 
 * Solution: Drop the problematic index.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/student-rental';

async function migrate() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('rooms');

    // List all indexes
    console.log('\nCurrent indexes on rooms collection:');
    const indexes = await collection.indexes();
    indexes.forEach((idx, i) => {
      console.log(`  ${i + 1}. ${idx.name}:`, JSON.stringify(idx.key));
    });

    // Find and drop any 2dsphere indexes on location
    const geoIndexes = indexes.filter(idx => {
      const keyStr = JSON.stringify(idx.key);
      return keyStr.includes('2dsphere') || keyStr.includes('location');
    });

    if (geoIndexes.length === 0) {
      console.log('\nNo geo indexes found on location field.');
    } else {
      console.log(`\nFound ${geoIndexes.length} geo index(es) to remove:`);
      
      for (const idx of geoIndexes) {
        if (idx.name === '_id_') continue; // Don't drop _id index
        
        console.log(`  Dropping index: ${idx.name}`);
        try {
          await collection.dropIndex(idx.name);
          console.log(`  ✓ Dropped ${idx.name}`);
        } catch (err) {
          console.log(`  ✗ Failed to drop ${idx.name}: ${err.message}`);
        }
      }
    }

    // Verify final indexes
    console.log('\nFinal indexes on rooms collection:');
    const finalIndexes = await collection.indexes();
    finalIndexes.forEach((idx, i) => {
      console.log(`  ${i + 1}. ${idx.name}:`, JSON.stringify(idx.key));
    });

    console.log('\n✓ Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrate();
