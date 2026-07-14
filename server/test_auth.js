import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './server.js';
import User from './models/User.js';
import AuditLog from './models/AuditLog.js';

dotenv.config();

const runTests = async () => {
  console.log('\n==================================================');
  console.log('      RUNNING AUTHENTICATION INTEGRITY TESTS      ');
  console.log('==================================================\n');

  try {
    // 1. Fetch a valid active investigator user from the database
    const testUser = await User.findOne({ role: 'Investigator', isActive: true });
    if (!testUser) {
      throw new Error('No active Investigator user found to perform tests. Seed the database first.');
    }

    console.log(`Using Seeded Test User: ${testUser.name} (${testUser.email})`);

    // --- TEST 1: SUCCESSFUL LOGIN ---
    console.log('\n[Test 1] POST /api/v1/auth/login - Valid Credentials');
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'Password@123'
      });

    if (loginRes.status === 200 && loginRes.body.data.token) {
      console.log('✅ PASS: Status is 200, JWT token allocated.');
    } else {
      console.error('❌ FAIL: Expected 200 OK with token. Received:', loginRes.status, loginRes.body);
      process.exit(1);
    }
    
    const token = loginRes.body.data.token;

    // --- TEST 2: WRONG PASSWORD LOGIN ---
    console.log('\n[Test 2] POST /api/v1/auth/login - Incorrect Password');
    const wrongPasswordRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword@123'
      });

    if (wrongPasswordRes.status === 401) {
      console.log('✅ PASS: Returned 401 Unauthorized.');
      // Verify audit log creation
      const log = await AuditLog.findOne({ action: 'LOGIN_FAILED' }).sort({ timestamp: -1 });
      if (log && log.details.includes(testUser.email)) {
        console.log(`✅ PASS: LOGIN_FAILED audit log recorded: "${log.details}"`);
      } else {
        console.error('❌ FAIL: Audit log for failed login not found or details mismatch.');
      }
    } else {
      console.error('❌ FAIL: Expected 401. Received:', wrongPasswordRes.status);
      process.exit(1);
    }

    // --- TEST 3: DEACTIVATED USER LOGIN ---
    console.log('\n[Test 3] POST /api/v1/auth/login - Deactivated Account');
    // Deactivate user temporarily
    await User.updateOne({ _id: testUser._id }, { $set: { isActive: false } });
    
    const deactivatedRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: testUser.email,
        password: 'Password@123'
      });

    // Re-enable user immediately
    await User.updateOne({ _id: testUser._id }, { $set: { isActive: true } });

    if (deactivatedRes.status === 403) {
      console.log('✅ PASS: Returned 403 Forbidden.');
      const log = await AuditLog.findOne({ action: 'LOGIN_FAILED', details: /Deactivated/ }).sort({ timestamp: -1 });
      if (log) {
        console.log(`✅ PASS: LOGIN_FAILED audit log recorded: "${log.details}"`);
      } else {
        console.error('❌ FAIL: Audit log for deactivated account login not found.');
      }
    } else {
      console.error('❌ FAIL: Expected 403. Received:', deactivatedRes.status);
      process.exit(1);
    }

    // --- TEST 4: PROTECTED ROUTE ACCESS WITHOUT TOKEN ---
    console.log('\n[Test 4] GET /api/v1/auth/me - Missing Token');
    const missingTokenRes = await request(app)
      .get('/api/v1/auth/me');

    if (missingTokenRes.status === 401) {
      console.log('✅ PASS: Returned 401 Unauthorized.');
    } else {
      console.error('❌ FAIL: Expected 401. Received:', missingTokenRes.status);
      process.exit(1);
    }

    // --- TEST 5: PROTECTED ROUTE ACCESS WITH TOKEN ---
    console.log('\n[Test 5] GET /api/v1/auth/me - Valid JWT Token');
    const validTokenRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    if (validTokenRes.status === 200 && validTokenRes.body.data.user.email === testUser.email) {
      console.log(`✅ PASS: Current user verified: ${validTokenRes.body.data.user.name} (${validTokenRes.body.data.user.role})`);
    } else {
      console.error('❌ FAIL: Expected 200 OK with profile. Received:', validTokenRes.status, validTokenRes.body);
      process.exit(1);
    }

    // --- TEST 6: SECURE LOGOUT ---
    console.log('\n[Test 6] POST /api/v1/auth/logout - Valid JWT Token');
    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    if (logoutRes.status === 200) {
      console.log('✅ PASS: Returned 200 OK.');
      const log = await AuditLog.findOne({ action: 'LOGOUT', user: testUser._id }).sort({ timestamp: -1 });
      if (log) {
        console.log(`✅ PASS: LOGOUT audit log recorded: "${log.details}"`);
      } else {
        console.error('❌ FAIL: Audit log for user logout not found.');
      }
    } else {
      console.error('❌ FAIL: Expected 200. Received:', logoutRes.status);
      process.exit(1);
    }

    console.log('\n==================================================');
    console.log('     🎉 SUCCESS: ALL AUTHENTICATION TESTS PASSED    ');
    console.log('==================================================\n');

  } catch (error) {
    console.error('\n💥 TEST SYSTEM RUNTIME EXCEPTION:', error.message);
    process.exit(1);
  } finally {
    // Gracefully close database connection
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

runTests();
