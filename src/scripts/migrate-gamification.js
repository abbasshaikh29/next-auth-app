/**
 * Migration script to initialize gamification fields for existing users
 * Run this script once after deploying the gamification system
 */

/* eslint-disable @typescript-eslint/no-require-imports */
const { MongoClient } = require('mongodb');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database';

async function migrateGamificationFields() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Find users that don't have gamification fields
    const usersToUpdate = await usersCollection.find({
      $or: [
        { points: { $exists: false } },
        { level: { $exists: false } },
        { monthlyPoints: { $exists: false } },
        { lastPointsReset: { $exists: false } }
      ]
    }).toArray();
    
    console.log(`Found ${usersToUpdate.length} users to update`);
    
    if (usersToUpdate.length === 0) {
      console.log('No users need migration');
      return;
    }
    
    // Update users with default gamification values
    const updateResult = await usersCollection.updateMany(
      {
        $or: [
          { points: { $exists: false } },
          { level: { $exists: false } },
          { monthlyPoints: { $exists: false } },
          { lastPointsReset: { $exists: false } }
        ]
      },
      {
        $set: {
          points: 0,
          level: 1,
          monthlyPoints: 0,
          lastPointsReset: new Date()
        }
      }
    );
    
    console.log(`Updated ${updateResult.modifiedCount} users with gamification fields`);
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    
    await usersCollection.createIndex({ points: -1 });
    await usersCollection.createIndex({ monthlyPoints: -1 });
    await usersCollection.createIndex({ level: -1 });
    await usersCollection.createIndex({ community: 1, points: -1 });
    await usersCollection.createIndex({ community: 1, monthlyPoints: -1 });
    
    console.log('Indexes created successfully');
    
    // Create index for LevelConfig collection
    const levelConfigCollection = db.collection('levelconfigs');
    await levelConfigCollection.createIndex({ communityId: 1 }, { unique: true });
    
    console.log('LevelConfig indexes created successfully');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateGamificationFields()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateGamificationFields };
