#!/usr/bin/env node
/**
 * Social Media Live Test Script
 * 
 * Tests live posting to Facebook, Instagram, and Twitter/X.
 * Requires valid API credentials in .env file.
 * 
 * Usage: node test_social_media.js
 */

import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config({ path: '../../../.env', override: true });

// Get credentials from environment
const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

// Test post content
const TEST_POSTS = {
  facebook: {
    message: '🧪 Silver/Gold Tier Live Test - This is a test post from the Personal AI Employee project for Hackathon 0. #Hackathon0 #AIEmployee #TestPost'
  },
  instagram: {
    caption: '🧪 Gold Tier Live Test - Testing Instagram integration! #Hackathon0 #AIEmployee #TestPost #BusinessAutomation',
    image_url: 'https://via.placeholder.com/1080x1080.png?text=Gold+Tier+Test'
  },
  twitter: {
    text: '🧪 Gold Tier Live Test - Testing Twitter/X integration from Personal AI Employee! #Hackathon0 #AIEmployee #TestPost'
  }
};

async function testFacebookPost() {
  console.log('\n' + '='.repeat(60));
  console.log('FACEBOOK POST TEST');
  console.log('='.repeat(60));
  
  if (!FACEBOOK_PAGE_ID || !FACEBOOK_ACCESS_TOKEN) {
    console.log('⚠️  SKIPPED - Credentials not configured');
    console.log('   Required in .env:');
    console.log('   - FACEBOOK_PAGE_ID');
    console.log('   - FACEBOOK_ACCESS_TOKEN');
    return { status: 'SKIPPED', reason: 'No credentials' };
  }
  
  try {
    console.log('\n📱 Posting to Facebook...');
    console.log(`   Page ID: ${FACEBOOK_PAGE_ID}`);
    console.log(`   Message: ${TEST_POSTS.facebook.message.substring(0, 50)}...`);
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/feed`,
      {
        message: TEST_POSTS.facebook.message,
        access_token: FACEBOOK_ACCESS_TOKEN
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('\n✅ Facebook post successful!');
    console.log(`   Post ID: ${response.data.id}`);
    console.log(`   View at: https://facebook.com/${response.data.id}`);
    
    return { 
      status: 'PASS', 
      post_id: response.data.id,
      url: `https://facebook.com/${response.data.id}`
    };
    
  } catch (error) {
    console.log('\n❌ Facebook post failed!');
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    
    if (error.response?.data?.error?.code === 190) {
      console.log('\n🔐 Token expired or invalid');
      console.log('   Get new token from: https://developers.facebook.com/tools/explorer');
    }
    
    return { 
      status: 'FAIL', 
      error: error.response?.data?.error?.message || error.message 
    };
  }
}

async function testInstagramPost() {
  console.log('\n' + '='.repeat(60));
  console.log('INSTAGRAM POST TEST');
  console.log('='.repeat(60));
  
  if (!INSTAGRAM_USER_ID || !INSTAGRAM_ACCESS_TOKEN) {
    console.log('⚠️  SKIPPED - Credentials not configured');
    console.log('   Required in .env:');
    console.log('   - INSTAGRAM_USER_ID');
    console.log('   - INSTAGRAM_ACCESS_TOKEN');
    return { status: 'SKIPPED', reason: 'No credentials' };
  }
  
  try {
    console.log('\n📸 Creating Instagram media container...');
    console.log(`   User ID: ${INSTAGRAM_USER_ID}`);
    console.log(`   Image: ${TEST_POSTS.instagram.image_url}`);
    
    // Step 1: Create media container
    const containerResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_USER_ID}/media`,
      {
        image_url: TEST_POSTS.instagram.image_url,
        caption: TEST_POSTS.instagram.caption,
        access_token: INSTAGRAM_ACCESS_TOKEN
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const creationId = containerResponse.data.id;
    console.log(`✅ Media container created: ${creationId}`);
    
    // Wait a moment for media processing
    console.log('\n⏳ Waiting for media processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 2: Publish media
    console.log('\n📸 Publishing Instagram post...');
    const publishResponse = await axios.post(
      `https://graph.facebook.com/v18.0/${INSTAGRAM_USER_ID}/media_publish`,
      {
        creation_id: creationId,
        access_token: INSTAGRAM_ACCESS_TOKEN
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('\n✅ Instagram post successful!');
    console.log(`   Post ID: ${publishResponse.data.id}`);
    
    return { 
      status: 'PASS', 
      post_id: publishResponse.data.id 
    };
    
  } catch (error) {
    console.log('\n❌ Instagram post failed!');
    console.log(`   Error: ${error.response?.data?.error?.message || error.message}`);
    
    if (error.response?.data?.error?.code === 190) {
      console.log('\n🔐 Token expired or invalid');
      console.log('   Get new token from Facebook Developer Tools');
    }
    
    return { 
      status: 'FAIL', 
      error: error.response?.data?.error?.message || error.message 
    };
  }
}

async function testTwitterPost() {
  console.log('\n' + '='.repeat(60));
  console.log('TWITTER/X POST TEST');
  console.log('='.repeat(60));
  
  if (!TWITTER_BEARER_TOKEN) {
    console.log('⚠️  SKIPPED - Credentials not configured');
    console.log('   Required in .env:');
    console.log('   - TWITTER_BEARER_TOKEN');
    return { status: 'SKIPPED', reason: 'No credentials' };
  }
  
  try {
    console.log('\n🐦 Posting to Twitter/X...');
    console.log(`   Text: ${TEST_POSTS.twitter.text.substring(0, 50)}...`);
    
    const response = await axios.post(
      'https://api.twitter.com/2/tweets',
      {
        text: TEST_POSTS.twitter.text
      },
      {
        headers: {
          'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('\n✅ Twitter post successful!');
    console.log(`   Tweet ID: ${response.data.data.id}`);
    console.log(`   View at: https://twitter.com/status/${response.data.data.id}`);
    
    return { 
      status: 'PASS', 
      post_id: response.data.data.id,
      url: `https://twitter.com/status/${response.data.data.id}`
    };
    
  } catch (error) {
    console.log('\n❌ Twitter post failed!');
    console.log(`   Error: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    
    if (error.response?.status === 401) {
      console.log('\n🔐 Authentication failed');
      console.log('   Check TWITTER_BEARER_TOKEN in .env');
      console.log('   Get token from: https://developer.twitter.com/en/portal/dashboard');
    }
    
    return { 
      status: 'FAIL', 
      error: error.response?.data?.errors?.[0]?.message || error.message 
    };
  }
}

async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  console.log('SOCIAL MEDIA LIVE TEST SUITE');
  console.log('Gold Tier - Personal AI Employee');
  console.log('='.repeat(60));
  
  const results = {
    facebook: await testFacebookPost(),
    instagram: await testInstagramPost(),
    twitter: await testTwitterPost()
  };
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  
  let passCount = 0;
  let skipCount = 0;
  let failCount = 0;
  
  for (const [platform, result] of Object.entries(results)) {
    const status = result.status === 'PASS' ? '✅ PASS' : 
                   result.status === 'SKIPPED' ? '⚠️  SKIPPED' : '❌ FAIL';
    console.log(`${platform.toUpperCase()}: ${status}`);
    
    if (result.status === 'PASS') passCount++;
    else if (result.status === 'SKIPPED') skipCount++;
    else failCount++;
  }
  
  console.log('\n' + '-'.repeat(60));
  console.log(`Total: ${passCount} PASS, ${skipCount} SKIPPED, ${failCount} FAIL`);
  console.log('='.repeat(60));
  
  if (passCount === 3) {
    console.log('\n🎉 ALL TESTS PASSED!');
    console.log('Social media integration is fully operational!');
  } else if (skipCount > 0) {
    console.log('\n⚠️  CREDENTIALS REQUIRED');
    console.log('\nTo enable live testing, add credentials to .env:');
    console.log('1. Facebook: FACEBOOK_PAGE_ID, FACEBOOK_ACCESS_TOKEN');
    console.log('2. Instagram: INSTAGRAM_USER_ID, INSTAGRAM_ACCESS_TOKEN');
    console.log('3. Twitter: TWITTER_BEARER_TOKEN');
    console.log('\nSee docs/social_media_setup.md for setup instructions.');
  }
  
  return results;
}

// Run all tests
runAllTests().then(results => {
  process.exit(0);
}).catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
