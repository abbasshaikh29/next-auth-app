#!/usr/bin/env node

/**
 * Test script to verify Razorpay credentials
 * Run this script to test if your Razorpay API credentials are working
 */

import https from 'https';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '.env.production')
  : path.join(__dirname, '.env.development');

dotenv.config({ path: envPath });

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

console.log('🔍 Testing Razorpay Credentials...\n');

// Check if credentials are set
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('❌ Error: Razorpay credentials not found in environment variables');
  console.error('Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your .env file');
  process.exit(1);
}

// Check for dummy credentials
if (RAZORPAY_KEY_SECRET === 'thiIsADummyKeySecret123' || 
    RAZORPAY_KEY_SECRET.includes('dummy') || 
    RAZORPAY_KEY_SECRET.includes('placeholder')) {
  console.error('❌ Error: You are using dummy/placeholder credentials');
  console.error('Please replace with your actual Razorpay API credentials from dashboard.razorpay.com');
  process.exit(1);
}

console.log('✅ Environment variables found:');
console.log(`   RAZORPAY_KEY_ID: ${RAZORPAY_KEY_ID}`);
console.log(`   RAZORPAY_KEY_SECRET: ${'*'.repeat(RAZORPAY_KEY_SECRET.length)}`);
console.log('');

// Test API call
const testCredentials = () => {
  return new Promise((resolve, reject) => {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    
    const postData = JSON.stringify({
      amount: 100, // 1 rupee in paise
      currency: 'INR',
      receipt: 'test_receipt_' + Date.now(),
      notes: {
        test: 'credential_verification'
      }
    });

    const options = {
      hostname: 'api.razorpay.com',
      port: 443,
      path: '/v1/orders',
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ SUCCESS: Razorpay credentials are valid!');
            console.log('📋 Test order created:');
            console.log(`   Order ID: ${response.id}`);
            console.log(`   Amount: ₹${response.amount / 100}`);
            console.log(`   Currency: ${response.currency}`);
            console.log(`   Status: ${response.status}`);
            resolve(response);
          } else {
            console.error('❌ FAILED: Razorpay API returned an error');
            console.error(`   Status: ${res.statusCode} ${res.statusMessage}`);
            console.error(`   Error: ${response.error?.description || 'Unknown error'}`);
            
            if (res.statusCode === 401) {
              console.error('\n💡 Authentication failed. Please check:');
              console.error('   1. Your RAZORPAY_KEY_ID is correct');
              console.error('   2. Your RAZORPAY_KEY_SECRET is correct');
              console.error('   3. You\'re using the right environment (test/live)');
              console.error('   4. Your credentials are from dashboard.razorpay.com');
            }
            
            reject(new Error(`API Error: ${response.error?.description || 'Unknown error'}`));
          }
        } catch (parseError) {
          console.error('❌ FAILED: Could not parse API response');
          console.error('Raw response:', data);
          reject(parseError);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ FAILED: Network error');
      console.error(error.message);
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

// Run the test
console.log('🚀 Testing API connection...\n');

testCredentials()
  .then(() => {
    console.log('\n🎉 All tests passed! Your Razorpay integration should work now.');
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error.message);
    console.error('\n📖 Next steps:');
    console.error('   1. Get your actual Razorpay credentials from dashboard.razorpay.com');
    console.error('   2. Update your .env.development file with the real credentials');
    console.error('   3. Run this test script again');
    process.exit(1);
  });
