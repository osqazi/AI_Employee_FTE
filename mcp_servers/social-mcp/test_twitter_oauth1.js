#!/usr/bin/env node
/**
 * Twitter/X Live Post Test - OAuth 1.0a
 * Uses OAuth 1.0a tokens (access token + secret) to post tweet
 * 
 * Usage: node test_twitter_oauth1.js
 */

import axios from 'axios';
import fs from 'fs';
import crypto from 'crypto';

// Read .env file directly
const envContent = fs.readFileSync('D:\\Projects\\hackathon\\ai-assist-fte\\.env', 'utf-8');

const TWITTER_API_KEY = envContent.split('\n').find(line => line.startsWith('TWITTER_CONSUMER_KEY='))?.split('=')[1].trim();
const TWITTER_API_SECRET = envContent.split('\n').find(line => line.startsWith('TWITTER_CONSUMER_KEY_SECRET='))?.split('=')[1].trim();
const TWITTER_ACCESS_TOKEN = envContent.split('\n').find(line => line.startsWith('TWITTER_ACCESS_TOKEN='))?.split('=')[1].trim();
const TWITTER_ACCESS_TOKEN_SECRET = envContent.split('\n').find(line => line.startsWith('TWITTER_ACCESS_TOKEN_SECRET='))?.split('=')[1].trim();

console.log('='.repeat(60));
console.log('TWITTER/X LIVE POST TEST - OAuth 1.0a');
console.log('='.repeat(60));

console.log('\n📋 Configuration:');
console.log('   API Key:', TWITTER_API_KEY ? TWITTER_API_KEY.substring(0, 20) + '...' : 'NOT SET');
console.log('   Access Token:', TWITTER_ACCESS_TOKEN ? TWITTER_ACCESS_TOKEN.substring(0, 20) + '...' : 'NOT SET');

if (!TWITTER_ACCESS_TOKEN || !TWITTER_ACCESS_TOKEN_SECRET) {
    console.log('\n❌ ERROR: OAuth 1.0a credentials not configured!');
    console.log('   Need TWITTER_ACCESS_TOKEN and TWITTER_ACCESS_TOKEN_SECRET');
    process.exit(1);
}

console.log('\nStarting test...\n');

// Generate OAuth 1.0a signature
function generateOAuthSignature(method, url, params, consumerSecret, tokenSecret) {
    const normalizedParams = Object.keys(params)
        .sort()
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
    
    const baseString = `${method.toUpperCase()}&${encodeURIComponent(url)}&${encodeURIComponent(normalizedParams)}`;
    const signingKey = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
    
    return crypto.createHmac('sha1', signingKey).update(baseString).digest('base64');
}

async function postToTwitter() {
    try {
        const tweetText = '🧪 Gold Tier Live Test - Twitter OAuth 1.0a - Personal AI Employee Hackathon 0 #Hackathon0 #AI #Automation';
        const url = 'https://api.twitter.com/1.1/statuses/update.json';
        
        console.log('🐦 Posting tweet...');
        console.log('   Tweet:', tweetText);
        
        // OAuth 1.0a parameters
        const oauthParams = {
            oauth_consumer_key: TWITTER_API_KEY || 'placeholder',
            oauth_token: TWITTER_ACCESS_TOKEN,
            oauth_nonce: crypto.randomBytes(16).toString('hex'),
            oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
            oauth_signature_method: 'HMAC-SHA1',
            oauth_version: '1.0'
        };
        
        const postParams = {
            ...oauthParams,
            status: tweetText
        };
        
        // Generate signature
        const consumerSecret = TWITTER_API_SECRET || 'placeholder';
        const signature = generateOAuthSignature(
            'POST',
            url,
            postParams,
            consumerSecret,
            TWITTER_ACCESS_TOKEN_SECRET
        );
        
        oauthParams.oauth_signature = signature;
        
        // Build Authorization header
        const authHeader = 'OAuth ' + Object.keys(oauthParams)
            .sort()
            .map(key => `${encodeURIComponent(key)}="${encodeURIComponent(oauthParams[key])}"`)
            .join(', ');
        
        // Post tweet
        const response = await axios.post(
            url,
            `status=${encodeURIComponent(tweetText)}`,
            {
                headers: {
                    'Authorization': authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        const tweetId = response.data.id_str;
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
        console.log('\n❌ ERROR:', error.response?.data?.[0]?.message || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n🔐 Authentication failed');
            console.log('   Check API Key and Access Token');
        } else if (error.response?.status === 403) {
            console.log('\n🔒 Forbidden - Check app permissions');
            console.log('   Ensure app has "Read and Write" permissions');
        }
        
        return { success: false, error: error.message };
    }
}

// Run the test
postToTwitter().then(result => {
    process.exit(result.success ? 0 : 1);
});
