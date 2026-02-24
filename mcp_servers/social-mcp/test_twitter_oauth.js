#!/usr/bin/env node
/**
 * Twitter/X Live Post Test - OAuth 2.0
 * Uses OAuth 2.0 Client Credentials to get access token and post tweet
 * 
 * Usage: node test_twitter_oauth.js
 */

import axios from 'axios';
import fs from 'fs';

// Read .env file directly
const envContent = fs.readFileSync('D:\\Projects\\hackathon\\ai-assist-fte\\.env', 'utf-8');

const TWITTER_CLIENT_ID = envContent.split('\n').find(line => line.startsWith('TWITTER_CLIENT_ID='))?.split('=')[1].trim();
const TWITTER_CLIENT_SECRET = envContent.split('\n').find(line => line.startsWith('TWITTER_CLIENT_SECRET='))?.split('=')[1].trim();

console.log('='.repeat(60));
console.log('TWITTER/X LIVE POST TEST - OAuth 2.0');
console.log('='.repeat(60));

console.log('\n📋 Configuration:');
console.log('   Client ID:', TWITTER_CLIENT_ID ? TWITTER_CLIENT_ID.substring(0, 20) + '...' : 'NOT SET');
console.log('   Client Secret:', TWITTER_CLIENT_SECRET ? TWITTER_CLIENT_SECRET.substring(0, 20) + '...' : 'NOT SET');

if (!TWITTER_CLIENT_ID || !TWITTER_CLIENT_SECRET) {
    console.log('\n❌ ERROR: OAuth 2.0 credentials not configured!');
    process.exit(1);
}

console.log('\nStarting test...\n');

async function getAccessToken() {
    try {
        console.log('🔑 Step 1: Getting OAuth 2.0 access token...');
        
        // Encode client credentials
        const credentials = Buffer.from(`${TWITTER_CLIENT_ID}:${TWITTER_CLIENT_SECRET}`).toString('base64');
        
        // Get access token using client credentials flow
        const tokenResponse = await axios.post(
            'https://api.twitter.com/oauth2/token',
            'grant_type=client_credentials',
            {
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        const accessToken = tokenResponse.data.access_token;
        console.log('✅ Access token obtained!');
        console.log('   Token type:', tokenResponse.data.token_type);
        
        return accessToken;
        
    } catch (error) {
        console.log('❌ ERROR getting access token:', error.response?.data?.error || error.message);
        return null;
    }
}

async function postToTwitter(accessToken) {
    try {
        const tweetText = '🧪 Gold Tier Live Test - Twitter/X OAuth 2.0 - Personal AI Employee Hackathon 0 #Hackathon0 #AI #Automation';
        
        console.log('\n🐦 Step 2: Posting tweet...');
        console.log('   Tweet:', tweetText);
        
        // Post tweet using Twitter API v2
        const response = await axios.post(
            'https://api.twitter.com/2/tweets',
            { text: tweetText },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        
        const tweetId = response.data.data.id;
        console.log('\n✅ Tweet successful!');
        console.log('   Tweet ID:', tweetId);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TWITTER/X LIVE TEST PASSED!');
        console.log('='.repeat(60));
        console.log('\n✅ Tweet successfully published to Twitter/X');
        console.log('   Tweet ID:', tweetId);
        console.log('   URL: https://twitter.com/status/' + tweetId);
        console.log('\n📱 Check your Twitter profile to verify the tweet');
        console.log('='.repeat(60));
        
        return { success: true, tweetId };
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.response?.data?.errors?.[0]?.message || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n🔐 Token invalid or expired');
        } else if (error.response?.status === 403) {
            console.log('\n🔒 Forbidden - Check app permissions');
            console.log('   Ensure app has "Read and Write" permissions');
        }
        
        return { success: false, error: error.message };
    }
}

// Run the test
async function runTest() {
    const accessToken = await getAccessToken();
    
    if (!accessToken) {
        console.log('\n❌ Failed to get access token');
        process.exit(1);
    }
    
    const result = await postToTwitter(accessToken);
    process.exit(result.success ? 0 : 1);
}

runTest();
