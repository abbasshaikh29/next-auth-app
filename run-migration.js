// This is a simple wrapper script to run the migration
const { execSync } = require('child_process');

console.log('Starting migration from ImageKit to S3...');

try {
  // Use ts-node with proper configuration to run the migration script
  execSync('npx ts-node --project tsconfig.json src/scripts/migrate-images.ts', { 
    stdio: 'inherit' 
  });
  
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
