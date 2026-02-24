#!/usr/bin/env node
/**
 * Twitter/X Token Diagnostic
 * Checks token validity and permissions
 */

import axios from 'axios';
import fs from 'fs';

// Read .env file directly
const envContent = fs.readFileSync('D:\\Projects\\hackathon\\ai-assist-fte\\.env', 'utf-8');
const tokenLine = envContent.split('\n').find(line => line.startsWith('TWITTER_BEARER_TOKEN='));
const TWITTER_BEARER_TOKEN = tokenLine ? tokenLine.split('=')[1].trim() : '';

console.log('='.repeat(60));
console.log('TWITTER/X TOKEN DIAGNOSTIC');
console.log('='.repeat(60));

if (!TWITTER_BEARER_TOKEN) {
    console.log('\n❌ ERROR: Token not found in .env');
    process.exit(1);
}

console.log('\n📋 Token:', TWITTER_BEARER_TOKEN.substring(0, 30) + '...');

async function checkToken() {
    try {
        // Test 1: Try to get user info (read permission)
        console.log('\n🔍 Test 1: Checking read permissions...');
        
        const meResponse = await axios.get(
            'https://api.twitter.com/2/users/me',
            {
                headers: {
                    'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`
                }
            }
        );
        
        console.log('✅ Read permission: WORKING');
        console.log('   User:', meResponse.data.data.name);
        console.log('   Username:', meResponse.data.data.username);
        
        // Test 2: Try to post a tweet (write permission)
        console.log('\n🔍 Test 2: Checking write permissions...');
        
        const tweetText = '🧪 Twitter permission test - ' + new Date().toISOString();
        
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
        
        console.log('✅ Write permission: WORKING');
        console.log('   Tweet ID:', tweetResponse.data.data.id);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TOKEN HAS BOTH READ AND WRITE PERMISSIONS!');
        console.log('='.repeat(60));
        
        return { success: true };
        
    } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.errors?.[0]?.message || error.message;
        
        console.log('\n❌ ERROR:', message);
        
        if (status === 401) {
            console.log('\n🔐 Token is invalid or expired');
            console.log('   Get new token from Twitter Developer Portal');
        } else if (status === 403) {
            console.log('\n🔒 Token lacks write permissions');
            console.log('\n📋 To fix:');
            console.log('   1. Go to https://developer.twitter.com/en/portal/dashboard');
            console.log('   2. Select your app');
            console.log('   3. Go to Settings');
            console.log('   4. Change App permissions to "Read and Write"');
            console.log('   5. Save and regenerate Bearer Token');
            console.log('   6. Update .env with new token');
        }
        
        return { success: false, error: message };
    }
}

checkToken().then(result => process.exit(result.success ? 0 : 1));
