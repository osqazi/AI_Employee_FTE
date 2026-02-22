#!/usr/bin/env node
/**
 * Facebook Credential Diagnostic
 * Checks what pages are accessible with the provided token
 */

import axios from 'axios';
import fs from 'fs';

// Read .env file
const envPath = 'D:\\Projects\\hackathon\\ai-assist-fte\\.env';
const envContent = fs.readFileSync(envPath, 'utf-8');

let FACEBOOK_ACCESS_TOKEN = null;

envContent.split('\n').forEach(line => {
  if (line.startsWith('FACEBOOK_ACCESS_TOKEN=')) {
    FACEBOOK_ACCESS_TOKEN = line.split('=')[1].trim();
  }
});

if (!FACEBOOK_ACCESS_TOKEN) {
  console.log('❌ FACEBOOK_ACCESS_TOKEN not found in .env');
  process.exit(1);
}

console.log('='.repeat(60));
console.log('FACEBOOK CREDENTIAL DIAGNOSTIC');
console.log('='.repeat(60));

async function diagnose() {
  try {
    // Step 1: Check token validity
    console.log('\n1. Checking token validity...');
    const meResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me',
      { params: { access_token: FACEBOOK_ACCESS_TOKEN } }
    );
    console.log(`   ✅ Token valid for: ${meResponse.data.name}`);
    
    // Step 2: Get user accounts/pages
    console.log('\n2. Getting your Facebook Pages...');
    const accountsResponse = await axios.get(
      'https://graph.facebook.com/v18.0/me/accounts',
      { params: { access_token: FACEBOOK_ACCESS_TOKEN } }
    );
    
    if (accountsResponse.data.data && accountsResponse.data.data.length > 0) {
      console.log(`   ✅ Found ${accountsResponse.data.data.length} Page(s):\n`);
      
      accountsResponse.data.data.forEach((page, index) => {
        console.log(`   Page ${index + 1}:`);
        console.log(`     Name: ${page.name}`);
        console.log(`     ID: ${page.id}`);
        console.log(`     Token: ${page.access_token ? page.access_token.substring(0, 30) + '...' : 'N/A'}`);
        console.log('');
      });
      
      console.log('='.repeat(60));
      console.log('RECOMMENDED ACTION:');
      console.log('='.repeat(60));
      console.log('Update .env with one of these Page IDs:');
      accountsResponse.data.data.forEach((page, index) => {
        console.log(`\n   # For ${page.name}`);
        console.log(`   FACEBOOK_PAGE_ID=${page.id}`);
      });
      
    } else {
      console.log('   ⚠️  No Pages found for this account');
      console.log('\n   You need to:');
      console.log('   1. Create a Facebook Page OR');
      console.log('   2. Grant this app access to your existing Page');
    }
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.response?.data?.error?.message || error.message}`);
    
    if (error.response?.data?.error?.code === 190) {
      console.log('\n   🔐 Token is invalid or expired');
      console.log('   Get new token from: https://developers.facebook.com/tools/explorer');
    }
  }
}

diagnose();
