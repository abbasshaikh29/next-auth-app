/**
 * Test script for AWS S3 integration
 * 
 * This script:
 * 1. Creates a simple test file
 * 2. Uploads it to S3
 * 3. Retrieves and displays the URL
 * 4. Tests if the file is accessible
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Initialize dotenv
dotenv.config({ path: '.env.local' });

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-southeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const bucketName = process.env.AWS_S3_BUCKET || '';

// Function to generate a test file
function generateTestFile(): string {
  const testFilePath = path.join(process.cwd(), 'test-file.txt');
  
  // Create a simple text file
  console.log('Creating a test file...');
  fs.writeFileSync(testFilePath, 'This is a test file for S3 upload');
  
  return testFilePath;
}

// Function to upload a file to S3
async function uploadToS3(filePath: string, key: string, contentType: string): Promise<string> {
  console.log(`Uploading ${filePath} to S3...`);
  
  const fileContent = fs.readFileSync(filePath);
  
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
    ContentType: contentType,
  };
  
  try {
    await s3Client.send(new PutObjectCommand(params));
    console.log('Upload successful');
    
    // Generate the URL
    let url;
    if (process.env.CLOUDFRONT_DOMAIN) {
      url = `https://${process.env.CLOUDFRONT_DOMAIN}/${key}`;
    } else if (process.env.NEXT_PUBLIC_S3_URL) {
      url = `${process.env.NEXT_PUBLIC_S3_URL}/${key}`;
    } else {
      url = `https://${bucketName}.s3.${process.env.AWS_REGION || 'ap-southeast-1'}.amazonaws.com/${key}`;
    }
    
    return url;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
}

// Function to test if a file URL is accessible
async function testFileAccess(url: string): Promise<boolean> {
  console.log(`Testing access to ${url}...`);
  
  try {
    const response = await axios.get(url);
    console.log(`File is accessible! Status: ${response.status}`);
    return true;
  } catch (error: any) {
    console.error(`Error accessing file: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
    }
    return false;
  }
}

// Main test function
async function testS3Integration() {
  console.log('Testing AWS S3 integration...');
  console.log('---------------------------');
  console.log(`AWS Region: ${process.env.AWS_REGION}`);
  console.log(`S3 Bucket: ${bucketName}`);
  console.log(`Public S3 URL: ${process.env.NEXT_PUBLIC_S3_URL || 'Not configured'}`);
  console.log('---------------------------');
  
  try {
    // Generate a test file
    const testFilePath = generateTestFile();
    
    // Generate a unique key for the test file
    const timestamp = Date.now();
    const key = `test/test-file-${timestamp}.txt`;
    
    // Upload the file to S3
    const fileUrl = await uploadToS3(testFilePath, key, 'text/plain');
    console.log(`File uploaded successfully. URL: ${fileUrl}`);
    
    // Test if the file is accessible
    const isAccessible = await testFileAccess(fileUrl);
    
    if (isAccessible) {
      console.log('✅ S3 integration test PASSED!');
      console.log(`The file is available at: ${fileUrl}`);
    } else {
      console.log('❌ S3 integration test FAILED!');
      console.log('The file was uploaded but is not publicly accessible.');
      console.log('This might be due to bucket permissions or CORS configuration.');
    }
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('Test file removed from local filesystem');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testS3Integration().catch(console.error);
