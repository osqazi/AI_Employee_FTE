#!/usr/bin/env node
/**
 * Instagram Live Post Test
 * Posts a test image to Instagram using Graph API
 * 
 * Usage: node test_instagram_live.js
 */

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: 'D:\\Projects\\hackathon\\ai-assist-fte\\.env' });

const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

console.log('='.repeat(60));
console.log('INSTAGRAM LIVE POST TEST');
console.log('='.repeat(60));

console.log('\n📋 Configuration:');
console.log('   Instagram User ID:', INSTAGRAM_USER_ID ? INSTAGRAM_USER_ID.substring(0, 10) + '...' : 'NOT SET');
console.log('   Access Token:', INSTAGRAM_ACCESS_TOKEN ? INSTAGRAM_ACCESS_TOKEN.substring(0, 20) + '...' : 'NOT SET');

if (!INSTAGRAM_USER_ID || !INSTAGRAM_ACCESS_TOKEN) {
    console.log('\n❌ ERROR: Instagram credentials not configured!');
    console.log('   Update .env with INSTAGRAM_USER_ID and INSTAGRAM_ACCESS_TOKEN');
    process.exit(1);
}

console.log('\nStarting test...\n');

async function postToInstagram() {
    try {
        // Test image URL (publicly accessible)
        const imageUrl = 'https://via.placeholder.com/1080x1080.png?text=Gold+Tier+Test';
        const caption = '🧪 Gold Tier Live Test - Instagram Integration - Personal AI Employee Hackathon 0';
        
        console.log('📸 Step 1: Creating media container...');
        console.log('   Image URL:', imageUrl);
        console.log('   Caption:', caption);
        
        // Step 1: Create media container
        const containerResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${INSTAGRAM_USER_ID}/media`,
            {
                image_url: imageUrl,
                caption: caption,
                access_token: INSTAGRAM_ACCESS_TOKEN
            },
            {
                headers: { 'Content-Type': 'application/json' }
            }
        );
        
        const creationId = containerResponse.data.id;
        console.log('\n✅ Media container created!');
        console.log('   Creation ID:', creationId);
        
        // Wait for media to process
        console.log('\n⏳ Waiting for media processing (10 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Step 2: Publish media
        console.log('\n📤 Step 2: Publishing media...');
        
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
        
        const postId = publishResponse.data.id;
        console.log('\n✅ Media published!');
        console.log('   Post ID:', postId);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 INSTAGRAM LIVE TEST PASSED!');
        console.log('='.repeat(60));
        console.log('\n✅ Post successfully published to Instagram');
        console.log('   Post ID:', postId);
        console.log('\n📱 Check your Instagram profile to verify the post');
        console.log('='.repeat(60));
        
        return { 
            success: true, 
            postId: postId,
            creationId: creationId
        };
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.response?.data?.error?.message || error.message);
        
        if (error.response?.data?.error?.code === 190) {
            console.log('\n🔐 Token expired or invalid');
            console.log('   Get new token from Facebook Developer Tools');
        }
        
        return { 
            success: false, 
            error: error.response?.data?.error?.message || error.message 
        };
    }
}

// Run the test
postToInstagram().then(result => {
    process.exit(result.success ? 0 : 1);
});
