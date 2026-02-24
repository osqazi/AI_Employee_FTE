#!/usr/bin/env node
/**
 * Twitter/X Live Post Test - Bearer Token v2 API
 * Uses Bearer Token with Twitter API v2
 * 
 * Usage: node test_twitter_v2.js
 */

import axios from 'axios';
import fs from 'fs';

// Read .env file directly
const envContent = fs.readFileSync('D:\\Projects\\hackathon\\ai-assist-fte\\.env', 'utf-8');

const TWITTER_BEARER_TOKEN = envContent.split('\n').find(line => line.startsWith('TWITTER_BEARER_TOKEN='))?.split('=')[1].trim();
const TWITTER_ACCESS_TOKEN = envContent.split('\n').find(line => line.startsWith('TWITTER_ACCESS_TOKEN='))?.split('=')[1].trim();

console.log('='.repeat(60));
console.log('TWITTER/X LIVE POST TEST - API v2');
console.log('='.repeat(60));

console.log('\n📋 Configuration:');
console.log('   Bearer Token:', TWITTER_BEARER_TOKEN ? TWITTER_BEARER_TOKEN.substring(0, 30) + '...' : 'NOT SET');
console.log('   Access Token:', TWITTER_ACCESS_TOKEN ? TWITTER_ACCESS_TOKEN.substring(0, 30) + '...' : 'NOT SET');

if (!TWITTER_BEARER_TOKEN) {
    console.log('\n❌ ERROR: Bearer Token not configured!');
    process.exit(1);
}

async function testTwitter() {
    try {
        // Step 1: Get user info to verify token works
        console.log('\n🔍 Step 1: Verifying token...');
        
        const meResponse = await axios.get(
            'https://api.twitter.com/2/users/me',
            {
                headers: {
                    'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
                }
            }
        );
        
        console.log('✅ Token valid!');
        console.log('   User:', meResponse.data.data.name);
        console.log('   Username:', meResponse.data.data.username);
        console.log('   User ID:', meResponse.data.data.id);
        
        const userId = meResponse.data.data.id;
        
        // Step 2: Post tweet
        console.log('\n🐦 Step 2: Posting tweet...');
        
        const tweetText = '🧪 Gold Tier Live Test - Twitter API v2 - Personal AI Employee Hackathon 0 #Hackathon0 #AI #Automation';
        
        const tweetResponse = await axios.post(
            'https://api.twitter.com/2/tweets',
            { text: tweetText },
            {
                headers: {
                    'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const tweetId = tweetResponse.data.data.id;
        console.log('\n✅ Tweet posted!');
        console.log('   Tweet ID:', tweetId);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TWITTER/X LIVE TEST PASSED!');
        console.log('='.repeat(60));
        console.log('\n✅ Tweet successfully published to Twitter/X');
        console.log('   Tweet ID:', tweetId);
        console.log('   URL: https://twitter.com/status/' + tweetId);
        console.log('\n📱 Check your Twitter profile to verify');
        console.log('='.repeat(60));
        
        return { success: true, tweetId };
        
    } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.errors?.[0]?.message || error.message;
        
        console.log('\n❌ ERROR:', message);
        
        if (status === 401) {
            console.log('\n🔐 Token invalid or expired');
        } else if (status === 403) {
            console.log('\n🔒 Forbidden');
            console.log('\n📋 To fix:');
            console.log('   1. Go to https://developer.twitter.com/en/portal/dashboard');
            console.log('   2. Select your app');
            console.log('   3. Settings → App permissions → "Read and Write"');
            console.log('   4. Save and regenerate Bearer Token');
            console.log('   5. Update .env');
        }
        
        return { success: false, error: message };
    }
}

testTwitter().then(result => process.exit(result.success ? 0 : 1));
