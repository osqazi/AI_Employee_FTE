#!/usr/bin/env node
/**
 * Facebook Live Post Test
 * Posts a test message to Facebook Page using Graph API
 * 
 * Usage: node test_facebook_live.js
 */

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: 'D:\\Projects\\hackathon\\ai-assist-fte\\.env' });

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

console.log('='.repeat(60));
console.log('FACEBOOK LIVE POST TEST');
console.log('='.repeat(60));

console.log('\n📋 Configuration:');
console.log('   Page ID:', FACEBOOK_PAGE_ID);
console.log('   Access Token:', FACEBOOK_ACCESS_TOKEN ? FACEBOOK_ACCESS_TOKEN.substring(0, 30) + '...' : 'NOT SET');

if (!FACEBOOK_PAGE_ID || !FACEBOOK_ACCESS_TOKEN) {
    console.log('\n❌ ERROR: Facebook credentials not configured!');
    process.exit(1);
}

console.log('\nStarting test...\n');

async function postToFacebook() {
    try {
        const message = '🧪 Gold Tier Live Test - Facebook Integration - Personal AI Employee Hackathon 0';
        
        console.log('📱 Posting to Facebook Page...');
        console.log('   Message:', message);
        
        const response = await axios.post(
            `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}/feed`,
            {
                message: message,
                access_token: FACEBOOK_ACCESS_TOKEN
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
        const postId = response.data.id;
        console.log('\n✅ Post successful!');
        console.log('   Post ID:', postId);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 FACEBOOK LIVE TEST PASSED!');
        console.log('='.repeat(60));
        console.log('\n✅ Post successfully published to Facebook');
        console.log('   Post ID:', postId);
        console.log('\n📱 Check your Facebook Page to verify the post');
        console.log('='.repeat(60));
        
        return { success: true, postId: postId };
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.response?.data?.error?.message || error.message);
        
        if (error.response?.data?.error?.code === 190) {
            console.log('\n🔐 Token expired or invalid');
            console.log('   Get new token from Facebook Developer Tools');
        }
        
        return { success: false, error: error.message };
    }
}

// Run the test
postToFacebook().then(result => {
    process.exit(result.success ? 0 : 1);
});
