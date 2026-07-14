import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './server.js';
import User from './models/User.js';

dotenv.config();

const runTests = async () => {
  console.log('\n==================================================');
  console.log('       RUNNING BACKEND ANALYTICS INTEGRITY TESTS   ');
  console.log('==================================================\n');

  try {
    // 1. Fetch active officer credentials
    const officers = await User.find({ isActive: true }).limit(1);
    if (officers.length === 0) {
      throw new Error('No active officers seeded in database.');
    }
    const [officer] = officers;
    console.log(`Officer Context: ${officer.name} (${officer.email})`);

    // 2. Perform authentication login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: officer.email, password: 'Password@123' });
    const token = loginRes.body.data.token;

    // --- TEST 1: GET OVERVIEW STATS ---
    console.log('\n[Test 1] GET /api/v1/analytics/overview - Unfiltered');
    const overviewRes = await request(app)
      .get('/api/v1/analytics/overview')
      .set('Authorization', `Bearer ${token}`);

    if (
      overviewRes.status === 200 &&
      overviewRes.body.data.totalFIRs === 300 &&
      overviewRes.body.data.policeStations === 8
    ) {
      console.log('   ✅ PASS: Overview metrics mapped. FIRs=300, Stations=8.');
    } else {
      console.error('   ❌ FAIL: Expected 200 with 300 FIRs. Received:', overviewRes.status, overviewRes.body);
      process.exit(1);
    }

    // --- TEST 2: GET OVERVIEW STATS WITH DISTRICT FILTER ---
    console.log('\n[Test 2] GET /api/v1/analytics/overview?district=Bengaluru');
    const overviewFiltered = await request(app)
      .get('/api/v1/analytics/overview?district=Bengaluru')
      .set('Authorization', `Bearer ${token}`);

    if (
      overviewFiltered.status === 200 &&
      overviewFiltered.body.data.totalFIRs < 300 &&
      overviewFiltered.body.data.totalFIRs > 0
    ) {
      console.log(`   ✅ PASS: District filter active. Bengaluru FIRs: ${overviewFiltered.body.data.totalFIRs}`);
    } else {
      console.error('   ❌ FAIL: District filter error. Received:', overviewFiltered.status, overviewFiltered.body);
      process.exit(1);
    }

    // --- TEST 3: CRIME TRENDS ---
    console.log('\n[Test 3] GET /api/v1/analytics/crime-trends');
    const trendsRes = await request(app)
      .get('/api/v1/analytics/crime-trends')
      .set('Authorization', `Bearer ${token}`);

    if (trendsRes.status === 200 && trendsRes.body.data.length > 0) {
      console.log(`   ✅ PASS: Crime trends generated. Month counts: ${trendsRes.body.data.length}`);
    } else {
      console.error('   ❌ FAIL: Trends error. Received:', trendsRes.status, trendsRes.body);
      process.exit(1);
    }

    // --- TEST 4: DISTRICT COMPARISONS ---
    console.log('\n[Test 4] GET /api/v1/analytics/districts');
    const distRes = await request(app)
      .get('/api/v1/analytics/districts')
      .set('Authorization', `Bearer ${token}`);

    if (distRes.status === 200 && distRes.body.data.length > 0) {
      console.log(`   ✅ PASS: Districts list complete: [${distRes.body.data.map(d => `${d.district}: ${d.count}`).join(', ')}]`);
    } else {
      console.error('   ❌ FAIL: District stats error. Received:', distRes.status, distRes.body);
      process.exit(1);
    }

    // --- TEST 5: CHATBOT INTEGRATION - TRENDS ---
    console.log('\n[Test 5] Chatbot Query - "Show crime trends"');
    // Start session first
    const sessionRes = await request(app)
      .post('/api/v1/chat/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Analytics Testing Thread' });
    const convId = sessionRes.body.data.conversation._id;

    const chatTrends = await request(app)
      .post(`/api/v1/chat/conversations/${convId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Show crime trends' });

    if (
      chatTrends.status === 200 &&
      chatTrends.body.data.userMessage.metadata.intent === 'Analytics' &&
      chatTrends.body.data.assistantMessage.metadata.summary
    ) {
      console.log('   ✅ PASS: Chatbot routed trends query successfully.');
      console.log(`   - AI Summary: "${chatTrends.body.data.assistantMessage.metadata.summary}"`);
    } else {
      console.error('   ❌ FAIL: Chatbot trends routing failed. Received:', chatTrends.status, chatTrends.body);
      process.exit(1);
    }

    // --- TEST 6: CHATBOT INTEGRATION - DISTRICT TIE-BREAKER ---
    console.log('\n[Test 6] Chatbot Query - "Which district has the highest robbery cases?"');
    const chatDist = await request(app)
      .post(`/api/v1/chat/conversations/${convId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Which district has the highest robbery cases?' });

    if (
      chatDist.status === 200 &&
      chatDist.body.data.userMessage.metadata.intent === 'Analytics' &&
      chatDist.body.data.userMessage.metadata.filters.crimeType === 'Robbery'
    ) {
      console.log('   ✅ PASS: Chatbot parsed "Robbery" category filter and compiled district breakdowns.');
      console.log(`   - AI Summary: "${chatDist.body.data.assistantMessage.metadata.summary}"`);
    } else {
      console.error('   ❌ FAIL: Chatbot district filter failed. Received:', chatDist.status, chatDist.body);
      process.exit(1);
    }

    console.log('\n==================================================');
    console.log('   🎉 SUCCESS: ALL ANALYTICS INTEGRITY TESTS PASSED ');
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
