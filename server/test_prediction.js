import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './server.js';
import User from './models/User.js';

dotenv.config();

const runTests = async () => {
  console.log('\n==================================================');
  console.log('       RUNNING BACKEND FORECASTING INTEGRITY TESTS');
  console.log('==================================================\n');

  try {
    // 1. Fetch distinct user roles from seeded databases
    const investigator = await User.findOne({ role: 'Investigator', isActive: true });
    const supervisor = await User.findOne({ role: 'Supervisor', isActive: true });

    if (!investigator || !supervisor) {
      throw new Error('Verification requires both Investigator and Supervisor seeded users.');
    }
    console.log(`Investigator Context: ${investigator.name} (${investigator.email})`);
    console.log(`Supervisor Context: ${supervisor.name} (${supervisor.email})`);

    // --- TEST 1: RBAC ACCESS DENIED FOR INVESTIGATOR ---
    console.log('\n[Test 1] POST /api/v1/auth/login (Investigator)');
    const loginInvRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: investigator.email, password: 'Password@123' });
    const invToken = loginInvRes.body.data.token;

    console.log('GET /api/v1/prediction/overview (Should block Investigator with 403)');
    const overviewInvRes = await request(app)
      .get('/api/v1/prediction/overview')
      .set('Authorization', `Bearer ${invToken}`);

    if (overviewInvRes.status === 403) {
      console.log('   ✅ PASS: RBAC successfully blocked Investigator access.');
    } else {
      console.error('   ❌ FAIL: Investigator should be blocked with 403. Received:', overviewInvRes.status, overviewInvRes.body);
      process.exit(1);
    }

    // --- TEST 2: RBAC ACCESS GRANTED FOR SUPERVISOR ---
    console.log('\n[Test 2] POST /api/v1/auth/login (Supervisor)');
    const loginSupRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: supervisor.email, password: 'Password@123' });
    const supToken = loginSupRes.body.data.token;

    console.log('GET /api/v1/prediction/overview (Should grant Supervisor access with 200)');
    const overviewSupRes = await request(app)
      .get('/api/v1/prediction/overview')
      .set('Authorization', `Bearer ${supToken}`);

    if (overviewSupRes.status === 200 && overviewSupRes.body.data.forecastConfidence) {
      console.log('   ✅ PASS: RBAC granted Supervisor access. Overview loaded:', overviewSupRes.body.data);
    } else {
      console.error('   ❌ FAIL: Supervisor access error. Received:', overviewSupRes.status, overviewSupRes.body);
      process.exit(1);
    }

    // --- TEST 3: CRIME TRENDS FORECAST ---
    console.log('\n[Test 3] GET /api/v1/prediction/trends');
    const trendsRes = await request(app)
      .get('/api/v1/prediction/trends')
      .set('Authorization', `Bearer ${supToken}`);

    if (
      trendsRes.status === 200 &&
      trendsRes.body.data.historical.length > 0 &&
      trendsRes.body.data.forecast.length === 6
    ) {
      console.log(`   ✅ PASS: Forecast generated. History months count: ${trendsRes.body.data.historical.length}, Projected future months: 6.`);
    } else {
      console.error('   ❌ FAIL: Trends forecasting failed. Received:', trendsRes.status, trendsRes.body);
      process.exit(1);
    }

    // --- TEST 4: PROJECTED HOTSPOTS ---
    console.log('\n[Test 4] GET /api/v1/prediction/hotspots');
    const hotspotsRes = await request(app)
      .get('/api/v1/prediction/hotspots')
      .set('Authorization', `Bearer ${supToken}`);

    if (
      hotspotsRes.status === 200 &&
      hotspotsRes.body.data.length > 0 &&
      hotspotsRes.body.data[0].predictedRisk
    ) {
      console.log(`   ✅ PASS: Projected hotspots resolved: [${hotspotsRes.body.data.map(h => `${h.locationName}: ${h.predictedRisk}`).join(', ')}]`);
    } else {
      console.error('   ❌ FAIL: Hotspots predictions error. Received:', hotspotsRes.status, hotspotsRes.body);
      process.exit(1);
    }

    // --- TEST 5: WARNING ALERTS ---
    console.log('\n[Test 5] GET /api/v1/prediction/alerts');
    const alertsRes = await request(app)
      .get('/api/v1/prediction/alerts')
      .set('Authorization', `Bearer ${supToken}`);

    if (alertsRes.status === 200 && alertsRes.body.data.length > 0) {
      console.log(`   ✅ PASS: Proactive Warning alerts generated: [${alertsRes.body.data.map(a => a.type).join(', ')}]`);
    } else {
      console.error('   ❌ FAIL: Alerts generation failed. Received:', alertsRes.status, alertsRes.body);
      process.exit(1);
    }

    // --- TEST 6: CHATBOT FORECASTING ROUTING ---
    console.log('\n[Test 6] Chatbot Query - "What crimes are expected to increase next month?"');
    const sessionRes = await request(app)
      .post('/api/v1/chat/conversations')
      .set('Authorization', `Bearer ${supToken}`)
      .send({ title: 'Forecasting Testing Thread' });
    const convId = sessionRes.body.data.conversation._id;

    const chatRes = await request(app)
      .post(`/api/v1/chat/conversations/${convId}/message`)
      .set('Authorization', `Bearer ${supToken}`)
      .send({ message: 'What crimes are expected to increase next month?' });

    if (
      chatRes.status === 200 &&
      chatRes.body.data.userMessage.metadata.intent === 'Prediction'
    ) {
      console.log('   ✅ PASS: Chatbot routed query to Prediction successfully.');
      console.log(`   - AI Answer: "${chatRes.body.data.assistantMessage.content.slice(0, 180)}..."`);
    } else {
      console.error('   ❌ FAIL: Chatbot routing forecasting failed. Received:', chatRes.status, chatRes.body);
      process.exit(1);
    }

    console.log('\n==================================================');
    console.log('   🎉 SUCCESS: ALL FORECASTING TESTS PASSED       ');
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
