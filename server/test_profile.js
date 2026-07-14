import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './server.js';
import User from './models/User.js';

dotenv.config();

const runTests = async () => {
  console.log('\n==================================================');
  console.log('       RUNNING BACKEND PROFILING INTEGRITY TESTS   ');
  console.log('==================================================\n');

  try {
    // 1. Obtain Investigator context
    const investigator = await User.findOne({ role: 'Investigator', isActive: true });
    if (!investigator) {
      throw new Error('Verification requires an active Investigator user.');
    }
    console.log(`Investigator Context: ${investigator.name} (${investigator.email})`);

    // 2. Fetch JWT auth token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: investigator.email, password: 'Password@123' });
    const token = loginRes.body.data.token;

    // --- TEST 1: GET REPEAT OFFENDERS ---
    console.log('\n[Test 1] GET /api/v1/profile/repeat-offenders');
    const repeatRes = await request(app)
      .get('/api/v1/profile/repeat-offenders')
      .set('Authorization', `Bearer ${token}`);

    if (repeatRes.status === 200 && repeatRes.body.data.length > 0) {
      console.log(`   ✅ PASS: Repeat offenders retrieved. Count: ${repeatRes.body.data.length}`);
      console.log(`   - Sample Suspect: ${repeatRes.body.data[0].name} (Risk: ${repeatRes.body.data[0].risk}, Score: ${repeatRes.body.data[0].score})`);
    } else {
      console.error('   ❌ FAIL: Repeat offenders roster query failed. Received:', repeatRes.status, repeatRes.body);
      process.exit(1);
    }

    const sampleOffenderId = repeatRes.body.data[0].id;

    // --- TEST 2: GET INDIVIDUAL OFFENDER PROFILE ---
    console.log(`\n[Test 2] GET /api/v1/profile/offender/${sampleOffenderId}`);
    const profileRes = await request(app)
      .get(`/api/v1/profile/offender/${sampleOffenderId}`)
      .set('Authorization', `Bearer ${token}`);

    if (profileRes.status === 200 && profileRes.body.data.criminal) {
      console.log('   ✅ PASS: Individual offender profile details compiled successfully.');
      console.log(`   - Name: ${profileRes.body.data.criminal.name}`);
      console.log(`   - Dynamic Risk Score: ${profileRes.body.data.risk.score}/100 (Level: ${profileRes.body.data.risk.level})`);
      console.log(`   - Preferred category: ${profileRes.body.data.preferences.preferredCategory}`);
      console.log(`   - Mapped Associates Count: ${profileRes.body.data.associates.length}`);
      console.log(`   - Criminal Timeline Length: ${profileRes.body.data.timeline.length} events`);
    } else {
      console.error('   ❌ FAIL: Offender profile fetch failed. Received:', profileRes.status, profileRes.body);
      process.exit(1);
    }

    const sampleFirId = profileRes.body.data.timeline[0].id;

    // --- TEST 3: GET BEHAVIOR PROFILE ---
    console.log(`\n[Test 3] GET /api/v1/profile/behavior/${sampleOffenderId}`);
    const behaviorRes = await request(app)
      .get(`/api/v1/profile/behavior/${sampleOffenderId}`)
      .set('Authorization', `Bearer ${token}`);

    if (behaviorRes.status === 200 && behaviorRes.body.data.classification) {
      console.log('   ✅ PASS: Suspect behavior analysis generated.');
      console.log(`   - Classification: ${behaviorRes.body.data.classification}`);
      console.log(`   - Spatial Focus: ${behaviorRes.body.data.spatialFocus}`);
    } else {
      console.error('   ❌ FAIL: Behavior analysis query failed. Received:', behaviorRes.status, behaviorRes.body);
      process.exit(1);
    }

    // --- TEST 4: GET INVESTIGATION SUMMARY & TIMELINE ---
    console.log(`\n[Test 4] GET /api/v1/profile/investigation-summary/${sampleFirId}`);
    const summaryRes = await request(app)
      .get(`/api/v1/profile/investigation-summary/${sampleFirId}`)
      .set('Authorization', `Bearer ${token}`);

    if (summaryRes.status === 200 && summaryRes.body.data.summary) {
      console.log('   ✅ PASS: Case investigation summary and timeline compiled.');
      console.log(`   - FIR: ${summaryRes.body.data.summary.firNumber}`);
      console.log(`   - Status: ${summaryRes.body.data.summary.status}`);
      console.log(`   - Timeline: ${summaryRes.body.data.timeline.length} events logged`);
    } else {
      console.error('   ❌ FAIL: Summary fetch failed. Received:', summaryRes.status, summaryRes.body);
      process.exit(1);
    }

    // --- TEST 5: GET ACTIONS & RECOMMENDATIONS ---
    console.log(`\n[Test 5] GET /api/v1/profile/investigation-recommendations/${sampleFirId}`);
    const recsRes = await request(app)
      .get(`/api/v1/profile/investigation-recommendations/${sampleFirId}`)
      .set('Authorization', `Bearer ${token}`);

    if (recsRes.status === 200 && recsRes.body.data.recommendations) {
      console.log('   ✅ PASS: Actions and recommendations compiled.');
      console.log(`   - Priority Level: ${recsRes.body.data.priority}`);
      console.log(`   - Recommendations Count: ${recsRes.body.data.recommendations.length}`);
    } else {
      console.error('   ❌ FAIL: Recommendations query failed. Received:', recsRes.status, recsRes.body);
      process.exit(1);
    }

    // --- TEST 6: GET SIMILAR CASE MATCHES ---
    console.log(`\n[Test 6] GET /api/v1/profile/similar-cases/${sampleFirId}`);
    const similarRes = await request(app)
      .get(`/api/v1/profile/similar-cases/${sampleFirId}`)
      .set('Authorization', `Bearer ${token}`);

    if (similarRes.status === 200) {
      console.log(`   ✅ PASS: Similar cases query matched. Matches count: ${similarRes.body.data.length}`);
      if (similarRes.body.data.length > 0) {
        console.log(`   - Top Match: ${similarRes.body.data[0].firNumber} (Similarity: ${Math.round(similarRes.body.data[0].similarityScore * 100)}%)`);
      }
    } else {
      console.error('   ❌ FAIL: Similar cases matching failed. Received:', similarRes.status, similarRes.body);
      process.exit(1);
    }

    // --- TEST 7: CHATBOT CO-ROUTING ---
    console.log('\n[Test 7] Chatbot Profiling Conversational Classification');
    const sessionRes = await request(app)
      .post('/api/v1/chat/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Decision Verification Thread' });
    const convId = sessionRes.body.data.conversation._id;

    // Send "Profile criminal Ramesh"
    const chatProfileRes = await request(app)
      .post(`/api/v1/chat/conversations/${convId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Profile criminal Ramesh' });

    if (chatProfileRes.status === 200 && chatProfileRes.body.data.userMessage.metadata.intent === 'Offender Profiling') {
      console.log('   ✅ PASS: "Profile criminal Ramesh" correctly classified as Offender Profiling.');
      console.log(`   - Response: "${chatProfileRes.body.data.assistantMessage.content.slice(0, 160)}..."`);
    } else {
      console.error('   ❌ FAIL: Chatbot profile routing failed. Received:', chatProfileRes.status, chatProfileRes.body);
      process.exit(1);
    }

    // Send "Suggest investigation leads"
    const chatLeadRes = await request(app)
      .post(`/api/v1/chat/conversations/${convId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({ message: 'Suggest investigation leads' });

    if (chatLeadRes.status === 200 && chatLeadRes.body.data.userMessage.metadata.intent === 'Investigator Decision Support') {
      console.log('   ✅ PASS: "Suggest investigation leads" correctly classified as Investigator Decision Support.');
      console.log(`   - Response: "${chatLeadRes.body.data.assistantMessage.content.slice(0, 160)}..."`);
    } else {
      console.error('   ❌ FAIL: Chatbot decision routing failed. Received:', chatLeadRes.status, chatLeadRes.body);
      process.exit(1);
    }

    console.log('\n==================================================');
    console.log('   🎉 SUCCESS: ALL PROFILING SYSTEM TESTS PASSED  ');
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
