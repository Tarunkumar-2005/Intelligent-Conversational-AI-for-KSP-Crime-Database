import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './server.js';
import User from './models/User.js';

dotenv.config();

const runTests = async () => {
  console.log('\n==================================================');
  console.log('       RUNNING BACKEND REPORTS INTEGRITY TESTS     ');
  console.log('==================================================\n');

  try {
    // 1. Fetch distinct user roles from database
    const investigator = await User.findOne({ role: 'Investigator', isActive: true });
    const supervisor = await User.findOne({ role: 'Supervisor', isActive: true });

    if (!investigator || !supervisor) {
      throw new Error('Verification requires both Investigator and Supervisor seeded users.');
    }
    console.log(`Investigator Context: ${investigator.name} (${investigator.email})`);
    console.log(`Supervisor Context: ${supervisor.name} (${supervisor.email})`);

    // 2. Obtain JWT tokens
    const loginInvRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: investigator.email, password: 'Password@123' });
    const invToken = loginInvRes.body.data.token;

    const loginSupRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: supervisor.email, password: 'Password@123' });
    const supToken = loginSupRes.body.data.token;

    // --- TEST 1: RBAC LOGS BLOCK FOR INVESTIGATOR ---
    console.log('\n[Test 1] GET /api/v1/reports/log (Should block Investigator with 403)');
    const logsInvRes = await request(app)
      .get('/api/v1/reports/log')
      .set('Authorization', `Bearer ${invToken}`);

    if (logsInvRes.status === 403) {
      console.log('   ✅ PASS: RBAC successfully blocked Investigator logs retrieval.');
    } else {
      console.error('   ❌ FAIL: Investigator should be blocked with 403. Received:', logsInvRes.status, logsInvRes.body);
      process.exit(1);
    }

    // --- TEST 2: GET REPORTS TEMPLATES ---
    console.log('\n[Test 2] GET /api/v1/reports/templates');
    const templatesRes = await request(app)
      .get('/api/v1/reports/templates')
      .set('Authorization', `Bearer ${invToken}`);

    if (templatesRes.status === 200 && templatesRes.body.data.length === 3) {
      console.log(`   ✅ PASS: Templates retrieved. Configured count: ${templatesRes.body.data.length}`);
    } else {
      console.error('   ❌ FAIL: Templates query failed. Received:', templatesRes.status, templatesRes.body);
      process.exit(1);
    }

    // --- TEST 3: POST EXPORT AUDIT LOG ---
    console.log('\n[Test 3] POST /api/v1/reports/log (Submit export entry)');
    const logRes = await request(app)
      .post('/api/v1/reports/log')
      .set('Authorization', `Bearer ${supToken}`)
      .send({
        reportType: 'Test Case Dossier',
        targetId: 'FIR-TEST-MYS-01-2024'
      });

    if (logRes.status === 201 && logRes.body.data.action === 'REPORT_EXPORT') {
      console.log('   ✅ PASS: Export log entry created and audited successfully.');
    } else {
      console.error('   ❌ FAIL: Export logging failed. Received:', logRes.status, logRes.body);
      process.exit(1);
    }

    // --- TEST 4: GET AUDIT LOGS FOR SUPERVISOR ---
    console.log('\n[Test 4] GET /api/v1/reports/log (Supervisor access)');
    const logsSupRes = await request(app)
      .get('/api/v1/reports/log')
      .set('Authorization', `Bearer ${supToken}`);

    if (logsSupRes.status === 200 && logsSupRes.body.data.length > 0) {
      console.log(`   ✅ PASS: Supervisor retrieved audit log list. Count: ${logsSupRes.body.data.length}`);
    } else {
      console.error('   ❌ FAIL: Supervisor logs retrieval failed. Received:', logsSupRes.status, logsSupRes.body);
      process.exit(1);
    }

    // --- TEST 5: CHATBOT REPORTS INTERCEPT ---
    console.log('\n[Test 5] Chatbot Query - "Generate investigation report"');
    const sessionRes = await request(app)
      .post('/api/v1/chat/conversations')
      .set('Authorization', `Bearer ${supToken}`)
      .send({ title: 'Reporting Testing Thread' });
    const convId = sessionRes.body.data.conversation._id;

    const chatRes = await request(app)
      .post(`/api/v1/chat/conversations/${convId}/message`)
      .set('Authorization', `Bearer ${supToken}`)
      .send({ message: 'Generate investigation report' });

    if (
      chatRes.status === 200 &&
      chatRes.body.data.userMessage.metadata.intent === 'Report Generation'
    ) {
      console.log('   ✅ PASS: Chatbot routed query to Report Generation successfully.');
      console.log(`   - AI Answer: "${chatRes.body.data.assistantMessage.content.slice(0, 180)}..."`);
    } else {
      console.error('   ❌ FAIL: Chatbot routing report failed. Received:', chatRes.status, chatRes.body);
      process.exit(1);
    }

    console.log('\n==================================================');
    console.log('   🎉 SUCCESS: ALL REPORTS SYSTEM TESTS PASSED    ');
    console.log('==================================================\n');

  } catch (error) {
    console.error('\n💥 TEST SYSTEM RUNTIME EXCEPTION:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

runTests();
