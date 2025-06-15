#!/usr/bin/env node

/**
 * Quick test script to verify the payment system fix
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function testPaymentSystem() {
  console.log('🧪 Testing Payment System Fix...\n');

  try {
    // Test 1: Check if plans exist
    console.log('1️⃣ Checking existing plans...');
    const plansResponse = await fetch(`${BASE_URL}/api/community-subscription-plans`);
    const plansData = await plansResponse.json();
    
    if (plansResponse.ok) {
      console.log(`   ✅ Plans API working: ${plansData.plans?.length || 0} plans found`);
      
      if (plansData.plans?.length > 0) {
        console.log('   📋 Available plans:');
        plansData.plans.forEach(plan => {
          console.log(`      - ${plan.name}: ₹${plan.amount/100}/${plan.interval} (${plan.razorpayPlanId})`);
        });
      } else {
        console.log('   ⚠️  No plans found - this is likely the issue');
      }
    } else {
      console.log(`   ❌ Plans API error: ${plansData.error}`);
    }

    // Test 2: Check admin initialize endpoint
    console.log('\n2️⃣ Testing admin initialize endpoint...');
    const initResponse = await fetch(`${BASE_URL}/api/admin/initialize-plans`);
    const initData = await initResponse.json();
    
    if (initResponse.ok) {
      console.log(`   ✅ Initialize API working: ${initData.count || 0} plans available`);
    } else {
      console.log(`   ❌ Initialize API error: ${initData.error}`);
    }

    // Test 3: Check ensure-default endpoint
    console.log('\n3️⃣ Testing ensure-default endpoint...');
    const ensureResponse = await fetch(`${BASE_URL}/api/community-subscription-plans/ensure-default`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const ensureData = await ensureResponse.json();
    
    if (ensureResponse.ok) {
      console.log(`   ✅ Ensure-default API working: ${ensureData.message}`);
      if (ensureData.plans) {
        console.log(`   📋 Plans after ensure-default: ${ensureData.plans.length}`);
      }
    } else {
      console.log(`   ❌ Ensure-default API error: ${ensureData.error}`);
    }

    console.log('\n🎯 Test Summary:');
    console.log('   - If you see "No plans found", run the initialize script');
    console.log('   - If APIs are working, the payment system should be fixed');
    console.log('   - Check Razorpay dashboard to verify plans are created there too');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
if (require.main === module) {
  testPaymentSystem();
}

module.exports = { testPaymentSystem };
