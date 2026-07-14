import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './server.js';
import User from './models/User.js';
import FIR from './models/FIR.js';
import Criminal from './models/Criminal.js';
import Victim from './models/Victim.js';

dotenv.config();

const runTests = async () => {
  console.log('\n==================================================');
  console.log('    RUNNING CRIME INTELLIGENCE ENGINE INTEGRITY    ');
  console.log('==================================================\n');

  try {
    // 1. Retrieve active user profile
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

    // 3. Dynamically retrieve an active seeded FIR from database to test specific lookup
    const sampleFIR = await FIR.findOne({});
    const sampleFIRNum = sampleFIR ? sampleFIR.firNumber : 'FIR/KSP-BLR-01/2026/0001';
    console.log(`Sample seeded FIR number selected for lookup tests: "${sampleFIRNum}"`);

    // 4. Initialize conversation thread
    const createRes = await request(app)
      .post('/api/v1/chat/conversations')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Crime Intelligence Verification Thread' });
    const convId = createRes.body.data.conversation._id;
    console.log(`Initialized Test Thread ID: ${convId}\n`);

    // Helper method to dispatch queries
    const queryChat = async (prompt) => {
      console.log(`💬 Query: "${prompt}"`);
      // Sleep for 3 seconds to avoid triggering free-tier API rate limits
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const res = await request(app)
        .post(`/api/v1/chat/conversations/${convId}/message`)
        .set('Authorization', `Bearer ${token}`)
        .send({ message: prompt });
      
      if (res.status !== 200) {
        console.error(`❌ FAIL: Expected 200. Received ${res.status}:`, res.body);
        process.exit(1);
      }
      return res.body.data;
    };

    // --- TEST 1: ROBBERY CASES IN BENGALURU ---
    const t1 = await queryChat('Show robbery cases in Bengaluru');
    if (t1.userMessage.metadata.filters.crimeType === 'Robbery' && t1.userMessage.metadata.filters.city === 'Bengaluru') {
      console.log('   ✅ PASS: Classified & parsed filters correctly.');
      console.log(`   - AI Summary: "${t1.assistantMessage.metadata.summary}"`);
    } else {
      console.error('   ❌ FAIL: Incorrect parsing. Filters:', t1.userMessage.metadata.filters);
      process.exit(1);
    }

    // --- TEST 2: FIR DETAIL LOOKUP ---
    const t2 = await queryChat(`Show FIR ${sampleFIRNum}`);
    if (t2.userMessage.metadata.filters.firNumber === sampleFIRNum) {
      console.log('   ✅ PASS: Parsed and loaded sample FIR file.');
      console.log(`   - AI Summary: "${t2.assistantMessage.metadata.summary}"`);
    } else {
      console.error('   ❌ FAIL: Incorrect parsing. Filters:', t2.userMessage.metadata.filters);
      process.exit(1);
    }

    // --- TEST 3: REPEAT OFFENDERS ---
    const t3 = await queryChat('Find repeat offenders');
    if (t3.userMessage.metadata.intent === 'Criminal Search') {
      console.log('   ✅ PASS: Classified query as Criminal Search list.');
      console.log(`   - AI Summary: "${t3.assistantMessage.metadata.summary}"`);
    } else {
      console.error('   ❌ FAIL: Incorrect intent matching. Intent:', t3.userMessage.metadata.intent);
      process.exit(1);
    }

    // --- TEST 4: INVESTIGATION STATUS ---
    const t4 = await queryChat('Show investigation status');
    if (t4.userMessage.metadata.intent === 'Crime Search') {
      console.log('   ✅ PASS: Filtered active investigation files.');
      console.log(`   - AI Summary: "${t4.assistantMessage.metadata.summary}"`);
    } else {
      console.error('   ❌ FAIL: Incorrect intent matching. Intent:', t4.userMessage.metadata.intent);
      process.exit(1);
    }

    // --- TEST 5: CRIMINAL LOOKUP BY NAME ---
    const t5 = await queryChat('Find criminal Ramesh');
    if (t5.userMessage.metadata.filters.name === 'Ramesh' && t5.userMessage.metadata.filters.entity === 'Criminal') {
      console.log('   ✅ PASS: Suspect lookup parsed & completed.');
      console.log(`   - AI Summary: "${t5.assistantMessage.metadata.summary}"`);
    } else {
      console.error('   ❌ FAIL: Incorrect parsing. Filters:', t5.userMessage.metadata.filters);
      process.exit(1);
    }

    // --- TEST 6: VICTIM LOOKUP BY NAME ---
    const t6 = await queryChat('Find victim Rahul');
    if (t6.userMessage.metadata.filters.name === 'Rahul' && t6.userMessage.metadata.filters.entity === 'Victim') {
      console.log('   ✅ PASS: Victim lookup parsed & completed.');
      console.log(`   - AI Summary: "${t6.assistantMessage.metadata.summary}"`);
    } else {
      console.error('   ❌ FAIL: Incorrect parsing. Filters:', t6.userMessage.metadata.filters);
      process.exit(1);
    }

    // --- TEST 7: CYBER CRIMES CATEGORY SEARCH ---
    const t7 = await queryChat('Show cyber crimes');
    if (t7.userMessage.metadata.filters.crimeType === 'Cyber Crime') {
      console.log('   ✅ PASS: Category filter applied correctly.');
      console.log(`   - AI Summary: "${t7.assistantMessage.metadata.summary}"`);
    } else {
      console.error('   ❌ FAIL: Incorrect parsing. Filters:', t7.userMessage.metadata.filters);
      process.exit(1);
    }

    // --- TEST 8: EXECUTIVE CRIME SUMMARY ---
    const t8 = await queryChat('Generate crime summary');
    if (t8.userMessage.metadata.intent === 'Case Summary') {
      console.log('   ✅ PASS: Executive dashboard statistics generated.');
      console.log(`   - AI Summary: "${t8.assistantMessage.metadata.summary}"`);
      console.log(`   - Supporting Evidence: "${t8.assistantMessage.metadata.supportingEvidence}"`);
    } else {
      console.error('   ❌ FAIL: Incorrect intent. Intent:', t8.userMessage.metadata.intent);
      process.exit(1);
    }

    // --- TEST 9: BOUNDARY CHECK - ZERO MATCHING RECORDS ---
    const t9 = await queryChat('Find criminal Thanos');
    const ansLower = t9.assistantMessage.content.toLowerCase();
    if (ansLower.includes('no matching records were found')) {
      console.log('   ✅ PASS: Zero records boundary matches the polite response restriction.');
      console.log(`   - AI Answer: "${t9.assistantMessage.content}"`);
    } else {
      console.error('   ❌ FAIL: Expected polite error message for zero records. Received Answer:', t9.assistantMessage.content);
      process.exit(1);
    }

    console.log('\n==================================================');
    console.log('  🎉 SUCCESS: ALL ENGINE INTEGRITY TESTS PASSED    ');
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
