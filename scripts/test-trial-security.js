/**
 * Test script to verify trial security implementation
 * Run with: node scripts/test-trial-security.js
 */

const { dbconnect } = require('../src/lib/db');
const { checkTrialEligibility, activateTrial } = require('../src/lib/trial-service');
const { TrialHistory } = require('../src/models/TrialHistory');
const { Community } = require('../src/models/Community');
const { User } = require('../src/models/User');

async function runTests() {
  console.log('🧪 Starting Trial Security Tests...\n');
  
  try {
    await dbconnect();
    console.log('✅ Database connected\n');
    
    // Test 1: Check trial eligibility for new user
    console.log('Test 1: New user trial eligibility');
    const testUserId = 'test-user-' + Date.now();
    const testCommunityId = 'test-community-' + Date.now();
    
    const eligibility1 = await checkTrialEligibility(testUserId, 'community', testCommunityId);
    console.log('New user eligibility:', eligibility1);
    console.log(eligibility1.eligible ? '✅ PASS' : '❌ FAIL');
    console.log('');
    
    // Test 2: Activate trial for user
    console.log('Test 2: Trial activation');
    const activation = await activateTrial(testUserId, 'community', testCommunityId, '127.0.0.1', 'test-agent');
    console.log('Trial activation result:', activation);
    console.log(activation.success ? '✅ PASS' : '❌ FAIL');
    console.log('');
    
    // Test 3: Check eligibility after trial used
    console.log('Test 3: Eligibility after trial used');
    const eligibility2 = await checkTrialEligibility(testUserId, 'community', testCommunityId);
    console.log('Used trial eligibility:', eligibility2);
    console.log(!eligibility2.eligible ? '✅ PASS' : '❌ FAIL');
    console.log('');
    
    // Test 4: Attempt second trial activation (should fail)
    console.log('Test 4: Second trial activation attempt');
    const activation2 = await activateTrial(testUserId, 'community', testCommunityId, '127.0.0.1', 'test-agent');
    console.log('Second activation result:', activation2);
    console.log(!activation2.success ? '✅ PASS' : '❌ FAIL');
    console.log('');
    
    // Test 5: Check trial history record
    console.log('Test 5: Trial history verification');
    const trialHistory = await TrialHistory.findOne({ userId: testUserId });
    console.log('Trial history found:', !!trialHistory);
    console.log(trialHistory ? '✅ PASS' : '❌ FAIL');
    console.log('');
    
    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    await TrialHistory.deleteMany({ userId: testUserId });
    console.log('✅ Cleanup complete\n');
    
    console.log('🎉 All tests completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    process.exit(0);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
