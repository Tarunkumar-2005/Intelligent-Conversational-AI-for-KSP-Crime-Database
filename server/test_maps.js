import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './server.js';
import User from './models/User.js';

dotenv.config();

const runTests = async () => {
  console.log('\n==================================================');
  console.log('       RUNNING BACKEND MAPS INTEGRITY TESTS       ');
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

    // --- TEST 1: GET OVERVIEW ---
    console.log('\n[Test 1] GET /api/v1/maps/overview');
    const overviewRes = await request(app)
      .get('/api/v1/maps/overview')
      .set('Authorization', `Bearer ${token}`);

    if (
      overviewRes.status === 200 &&
      overviewRes.body.data.totalIncidents === 300
    ) {
      console.log('   ✅ PASS: Spatial overview compiled. Total geo-tagged cases: 300.');
    } else {
      console.error('   ❌ FAIL: Overview error. Received:', overviewRes.status, overviewRes.body);
      process.exit(1);
    }

    // --- TEST 2: GET HOTSPOTS ---
    console.log('\n[Test 2] GET /api/v1/maps/hotspots');
    const hotspotsRes = await request(app)
      .get('/api/v1/maps/hotspots')
      .set('Authorization', `Bearer ${token}`);

    if (
      hotspotsRes.status === 200 &&
      hotspotsRes.body.data.length > 0 &&
      Array.isArray(hotspotsRes.body.data[0].coordinates)
    ) {
      console.log(`   ✅ PASS: Hotspots calculated successfully. Coords array template: [${hotspotsRes.body.data[0].coordinates.join(', ')}]`);
    } else {
      console.error('   ❌ FAIL: Hotspots query error. Received:', hotspotsRes.status, hotspotsRes.body);
      process.exit(1);
    }

    // --- TEST 3: GET MARKERS ---
    console.log('\n[Test 3] GET /api/v1/maps/markers');
    const markersRes = await request(app)
      .get('/api/v1/maps/markers')
      .set('Authorization', `Bearer ${token}`);

    if (
      markersRes.status === 200 &&
      markersRes.body.data.length > 0 &&
      markersRes.body.data[0].firNumber
    ) {
      console.log(`   ✅ PASS: FIR Map Markers compiled. Total markers count: ${markersRes.body.data.length}`);
    } else {
      console.error('   ❌ FAIL: Markers query error. Received:', markersRes.status, markersRes.body);
      process.exit(1);
    }

    // --- TEST 4: DISTRICT DETAIL ENVELOPE ---
    console.log('\n[Test 4] GET /api/v1/maps/district/Bengaluru');
    const districtRes = await request(app)
      .get('/api/v1/maps/district/Bengaluru')
      .set('Authorization', `Bearer ${token}`);

    if (
      districtRes.status === 200 &&
      districtRes.body.data.overview.totalIncidents === 67
    ) {
      console.log(`   ✅ PASS: District specific detail compiled. Bengaluru Incidents: ${districtRes.body.data.overview.totalIncidents}`);
    } else {
      console.error('   ❌ FAIL: District overview error. Received:', districtRes.status, districtRes.body);
      process.exit(1);
    }

    // --- TEST 5: CHATBOT SPATIAL ROUTING ---
    console.log('\n[Test 5] Chatbot Query - "Show crime hotspots in Bengaluru"');
    const sessionRes = await request(app)
      .post('/api/v1/chat/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Maps Testing Thread' });
    const convId = sessionRes.body.data.conversation._id;

    const chatRes = await request(app)
      .post(`/api/v1/chat/conversations/${convId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Show crime hotspots in Bengaluru' });

    if (
      chatRes.status === 200 &&
      chatRes.body.data.userMessage.metadata.intent === 'Crime Hotspots'
    ) {
      console.log('   ✅ PASS: Chatbot routed geographic query to Crime Hotspots successfully.');
      console.log(`   - AI Answer: "${chatRes.body.data.assistantMessage.content.slice(0, 180)}..."`);
    } else {
      console.error('   ❌ FAIL: Chatbot routing query failed. Received:', chatRes.status, chatRes.body);
      process.exit(1);
    }

    console.log('\n==================================================');
    console.log('   🎉 SUCCESS: ALL MAPS INTEGRITY TESTS PASSED    ');
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
