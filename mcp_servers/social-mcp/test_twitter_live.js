#!/usr/bin/env node
/**
 * Twitter/X Live Post Test
 * Posts a test tweet using Twitter API v2
 * 
 * Usage: node test_twitter_live.js
 */

import axios from 'axios';
import fs from 'fs';

// Read .env file directly
const envContent = fs.readFileSync('D:\\Projects\\hackathon\\ai-assist-fte\\.env', 'utf-8');
const tokenLine = envContent.split('\n').find(line => line.startsWith('TWITTER_BEARER_TOKEN='));

const TWITTER_BEARER_TOKEN = tokenLine ? tokenLine.split('=')[1].trim() : '';

console.log('='.repeat(60));
console.log('TWITTER/X LIVE POST TEST');
console.log('='.repeat(60));

console.log('\n📋 Configuration:');
console.log('   Bearer Token:', TWITTER_BEARER_TOKEN ? TWITTER_BEARER_TOKEN.substring(0, 30) + '...' : 'NOT SET');

if (!TWITTER_BEARER_TOKEN) {
    console.log('\n❌ ERROR: Twitter credentials not configured!');
    process.exit(1);
}

console.log('\nStarting test...\n');

async function postToTwitter() {
    try {
        const tweetText = '🧪 Gold Tier Live Test - Twitter/X Integration - Personal AI Employee Hackathon 0 #Hackathon0 #AI #Automation';
        
        console.log('🐦 Posting to Twitter/X...');
        console.log('   Tweet:', tweetText);
        
        // Post tweet using Twitter API v2
        const response = await axios.post(
            'https://api.twitter.com/2/tweets',
            {
                text: tweetText
            },
            {
                headers: {
                    'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
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
            console.log('   Get new token from Twitter Developer Portal');
        } else if (error.response?.status === 403) {
            console.log('\n🔒 Forbidden - Check token permissions');
            console.log('   Ensure token has write permissions');
        }
        
        return { success: false, error: error.message };
    }
}

// Run the test
postToTwitter().then(result => {
    process.exit(result.success ? 0 : 1);
});
