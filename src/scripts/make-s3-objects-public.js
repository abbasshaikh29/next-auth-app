// Script to make existing S3 objects publicly readable
// Run with: node src/scripts/make-s3-objects-public.js

require('dotenv').config({ path: '.env.local' });
const { S3Client, ListObjectsV2Command, PutObjectAclCommand } = require('@aws-sdk/client-s3');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_BUCKET || '';

// Function to make an object public
async function makeObjectPublic(key) {
  try {
    const command = new PutObjectAclCommand({
      Bucket: bucketName,
      Key: key,
      ACL: 'public-read',
    });
    
    await s3Client.send(command);
    console.log(`Made public: ${key}`);
    return true;
  } catch (error) {
    console.error(`Error making object public: ${key}`, error);
    return false;
  }
}

// Function to list objects in a folder
async function listObjects(prefix = '') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
    });
    
    const response = await s3Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing objects:', error);
    return [];
  }
}

// Main function to make all objects public
async function makeAllObjectsPublic(prefix = '') {
  console.log(`Making all objects public in bucket: ${bucketName} with prefix: ${prefix || 'all'}`);
  
  // List all objects
  const objects = await listObjects(prefix);
  console.log(`Found ${objects.length} objects`);
  
  // Make each object public
  let successCount = 0;
  for (const object of objects) {
    const success = await makeObjectPublic(object.Key);
    if (success) successCount++;
  }
  
  console.log(`Made ${successCount} of ${objects.length} objects public`);
}

// Run the script with an optional prefix
const prefix = process.argv[2] || '';
makeAllObjectsPublic(prefix)
  .then(() => console.log('Done!'))
  .catch(error => console.error('Script failed:', error));
