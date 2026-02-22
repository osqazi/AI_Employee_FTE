#!/usr/bin/env node
/**
 * Simple Facebook Post Test
 * Direct test without dotenv path issues
 */

import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env file directly from project root
const envPath = 'D:\\Projects\\hackathon\\ai-assist-fte\\.env';
console.log(`Reading .env from: ${envPath}`);

const envContent = fs.readFileSync(envPath, 'utf-8');

// Parse FACEBOOK credentials
let FACEBOOK_PAGE_ID = null;
let FACEBOOK_ACCESS_TOKEN = null;

envContent.split('\n').forEach(line => {
  if (line.startsWith('FACEBOOK_PAGE_ID=')) {
    FACEBOOK_PAGE_ID = line.split('=')[1].trim();
  }
  if (line.startsWith('FACEBOOK_ACCESS_TOKEN=')) {
    FACEBOOK_ACCESS_TOKEN = line.split('=')[1].trim();
  }
});

console.log('\n' + '='.repeat(60));
console.log('FACEBOOK LIVE POST TEST');
console.log('='.repeat(60));

if (!FACEBOOK_PAGE_ID || !FACEBOOK_ACCESS_TOKEN) {
  console.log('\n❌ ERROR: Facebook credentials not found in .env');
  console.log(`   FACEBOOK_PAGE_ID: ${FACEBOOK_PAGE_ID ? 'Set' : 'NOT SET'}`);
  console.log(`   FACEBOOK_ACCESS_TOKEN: ${FACEBOOK_ACCESS_TOKEN ? 'Set' : 'NOT SET'}`);
  process.exit(1);
}

console.log('\n✅ Credentials loaded:');
console.log(`   Page ID: ${FACEBOOK_PAGE_ID}`);
console.log(`   Token: ${FACEBOOK_ACCESS_TOKEN.substring(0, 20)}...`);

const TEST_MESSAGE = '🧪 Gold Tier Live Test - Facebook Integration - Personal AI Employee Hackathon 0 - ' + new Date().toISOString();

console.log('\n📱 Posting to Facebook...');
console.log(`   Message: ${TEST_MESSAGE.substring(0, 50)}...`);

async function postToFacebook() {
  try {
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/feed`,
      {
        message: TEST_MESSAGE,
        access_token: FACEBOOK_ACCESS_TOKEN
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ FACEBOOK POST SUCCESSFUL!');
    console.log('='.repeat(60));
    console.log(`   Post ID: ${response.data.id}`);
    console.log(`   View at: https://facebook.com/${response.data.id}`);
    console.log(`   Message: ${TEST_MESSAGE}`);
    console.log('='.repeat(60));
    
    return { success: true, post_id: response.data.id };
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ FACEBOOK POST FAILED!');
    console.log('='.repeat(60));
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    
    if (error.response?.data?.error?.code === 190) {
      console.log('\n🔐 Token expired or invalid');
      console.log('   Get new token from: https://developers.facebook.com/tools/explorer');
    }
    
    return { success: false, error: error.response?.data?.error?.message || error.message };
  }
}

postToFacebook().then(result => {
  process.exit(result.success ? 0 : 1);
});
