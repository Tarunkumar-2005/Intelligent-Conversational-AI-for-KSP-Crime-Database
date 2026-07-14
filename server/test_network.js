import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './server.js';
import User from './models/User.js';
import Criminal from './models/Criminal.js';
import FIR from './models/FIR.js';
import Vehicle from './models/Vehicle.js';
import PhoneNumber from './models/PhoneNumber.js';
import BankAccount from './models/BankAccount.js';

dotenv.config();

const runTests = async () => {
  console.log('\n==================================================');
  console.log('       RUNNING BACKEND NETWORK INTEGRITY TESTS     ');
  console.log('==================================================\n');

  try {
    // 1. Fetch active officer credentials
    const officers = await User.find({ isActive: true }).limit(1);
    if (officers.length === 0) {
      throw new Error('No active officers seeded in database.');
    }
    const [officer] = officers;
    console.log(`Officer Context: ${officer.name} (${officer.email})`);

    // 2. Fetch a dynamic criminal and vehicle from the database
    const dbCriminal = await Criminal.findOne();
    if (!dbCriminal) {
      throw new Error('No criminals found in the seeded database.');
    }
    console.log(`Target Test Criminal: ${dbCriminal.firstName} ${dbCriminal.lastName || ''}`);

    const dbVehicle = await Vehicle.findOne();
    if (!dbVehicle) {
      throw new Error('No vehicles found in the seeded database.');
    }
    console.log(`Target Test Vehicle: ${dbVehicle.vehicleNumber} (${dbVehicle.make} ${dbVehicle.model})`);

    // 3. Perform authentication login
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: officer.email, password: 'Password@123' });
    const token = loginRes.body.data.token;

    // --- TEST 1: SEARCH NODE ---
    console.log(`\n[Test 1] GET /api/v1/network/search?query=${dbCriminal.firstName}`);
    const searchRes = await request(app)
      .get(`/api/v1/network/search?query=${dbCriminal.firstName}`)
      .set('Authorization', `Bearer ${token}`);

    if (searchRes.status === 200 && searchRes.body.data.length > 0) {
      console.log(`   ✅ PASS: Found matching start nodes. First match: ${searchRes.body.data[0].label}`);
    } else {
      console.error('   ❌ FAIL: Search endpoint error. Received:', searchRes.status, searchRes.body);
      process.exit(1);
    }

    // --- TEST 2: CRIMINAL NEIGHBORHOOD ---
    const targetId = searchRes.body.data[0].id.split('-')[1];
    console.log(`\n[Test 2] GET /api/v1/network/criminal/${targetId}`);
    const crimRes = await request(app)
      .get(`/api/v1/network/criminal/${targetId}`)
      .set('Authorization', `Bearer ${token}`);

    if (
      crimRes.status === 200 &&
      crimRes.body.data.graph.nodes.length > 0
    ) {
      const nodeLabels = crimRes.body.data.graph.nodes.map(n => n.label);
      console.log('   ✅ PASS: Criminal neighborhood compiled successfully.');
      console.log(`   - Nodes: [${nodeLabels.join(', ')}]`);
    } else {
      console.error('   ❌ FAIL: Criminal neighborhood query error. Received:', crimRes.status, crimRes.body);
      process.exit(1);
    }

    // --- TEST 3: VEHICLE NEIGHBORHOOD ---
    console.log(`\n[Test 3] GET /api/v1/network/vehicle/${dbVehicle._id}`);
    const vehRes = await request(app)
      .get(`/api/v1/network/vehicle/${dbVehicle._id}`)
      .set('Authorization', `Bearer ${token}`);

    if (vehRes.status === 200 && vehRes.body.data.graph.nodes.length > 0) {
      console.log(`   ✅ PASS: Vehicle neighborhood found. Connected nodes count: ${vehRes.body.data.graph.nodes.length}`);
    } else {
      console.error('   ❌ FAIL: Vehicle neighborhood query error. Received:', vehRes.status, vehRes.body);
      process.exit(1);
    }

    // --- TEST 4: CHATBOT RELATIONSHIP ROUTING ---
    console.log(`\n[Test 4] Chatbot Query - "Show associates of ${dbCriminal.firstName}"`);
    const sessionRes = await request(app)
      .post('/api/v1/chat/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Network Testing Thread' });
    const convId = sessionRes.body.data.conversation._id;

    const chatAssoc = await request(app)
      .post(`/api/v1/chat/conversations/${convId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: `Show associates of ${dbCriminal.firstName}` });

    if (
      chatAssoc.status === 200 &&
      chatAssoc.body.data.userMessage.metadata.intent === 'Network Analysis'
    ) {
      console.log('   ✅ PASS: Chatbot classified "associates" query to Network Analysis successfully.');
      console.log(`   - AI Answer: "${chatAssoc.body.data.assistantMessage.content.slice(0, 180)}..."`);
    } else {
      console.error('   ❌ FAIL: Chatbot network query failed. Received:', chatAssoc.status, chatAssoc.body);
      process.exit(1);
    }

    // --- TEST 5: CHATBOT SHARED ASSET ROUTING ---
    console.log('\n[Test 5] Chatbot Query - "Find criminals using the same vehicle"');
    const chatShared = await request(app)
      .post(`/api/v1/chat/conversations/${convId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Find criminals using the same vehicle' });

    if (
      chatShared.status === 200 &&
      chatShared.body.data.userMessage.metadata.intent === 'Network Analysis'
    ) {
      console.log('   ✅ PASS: Chatbot routed shared assets query successfully.');
      console.log(`   - AI Answer: "${chatShared.body.data.assistantMessage.content.slice(0, 180)}..."`);
    } else {
      console.error('   ❌ FAIL: Chatbot shared assets query failed. Received:', chatShared.status, chatShared.body);
      process.exit(1);
    }

    console.log('\n==================================================');
    console.log('   🎉 SUCCESS: ALL NETWORK INTEGRITY TESTS PASSED  ');
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
