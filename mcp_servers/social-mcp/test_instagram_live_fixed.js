#!/usr/bin/env node
/**
 * Instagram Live Post Test - FIXED
 * Uses correct Instagram Graph API with Facebook Page token
 * 
 * Usage: node test_instagram_live_fixed.js
 */

import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from correct path
dotenv.config({ path: 'D:\\Projects\\hackathon\\ai-assist-fte\\.env' });

const FACEBOOK_PAGE_ID = process.env.FACEBOOK_PAGE_ID;
const INSTAGRAM_USER_ID = process.env.INSTAGRAM_USER_ID;
const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN || process.env.INSTAGRAM_ACCESS_TOKEN;

console.log('='.repeat(60));
console.log('INSTAGRAM LIVE POST TEST - FIXED');
console.log('='.repeat(60));

console.log('\n📋 Configuration:');
console.log('   Facebook Page ID:', FACEBOOK_PAGE_ID);
console.log('   Instagram User ID:', INSTAGRAM_USER_ID);
console.log('   Access Token:', ACCESS_TOKEN ? ACCESS_TOKEN.substring(0, 30) + '...' : 'NOT SET');

if (!FACEBOOK_PAGE_ID || !INSTAGRAM_USER_ID || !ACCESS_TOKEN) {
    console.log('\n❌ ERROR: Credentials not configured!');
    process.exit(1);
}

console.log('\n🔍 Step 0: Verifying Instagram account connection...');

async function testInstagram() {
    try {
        // First, verify the Instagram account is connected to the Facebook Page
        console.log('\n📱 Checking Instagram Business Account...');
        
        const igResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}?fields=instagram_business_account&access_token=${ACCESS_TOKEN}`
        );
        
        if (igResponse.data.instagram_business_account) {
            const igAccountId = igResponse.data.instagram_business_account.id;
            console.log('✅ Instagram Business Account found!');
            console.log('   Instagram Account ID:', igAccountId);
            
            // Use the actual Instagram account ID
            return await postToInstagram(igAccountId);
        } else {
            console.log('⚠️  No Instagram Business Account connected to this Facebook Page');
            console.log('\n📋 To connect Instagram:');
            console.log('   1. Go to Facebook Page Settings');
            console.log('   2. Click "Instagram"');
            console.log('   3. Connect your Instagram Business account');
            return { success: false, error: 'No Instagram account connected' };
        }
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.response?.data?.error?.message || error.message);
        return { success: false, error: error.message };
    }
}

async function postToInstagram(igAccountId) {
    try {
        // Test image URL (publicly accessible)
        const imageUrl = 'https://via.placeholder.com/1080x1080.png?text=Gold+Tier+Test';
        const caption = '🧪 Gold Tier Live Test - Instagram Integration - Personal AI Employee Hackathon 0';
        
        console.log('\n📸 Step 1: Creating media container...');
        console.log('   Image URL:', imageUrl);
        console.log('   Caption:', caption);
        
        // Step 1: Create media container
        const containerResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${igAccountId}/media`,
            {
                image_url: imageUrl,
                caption: caption,
                access_token: ACCESS_TOKEN
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
            `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
            {
                creation_id: creationId,
                access_token: ACCESS_TOKEN
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
testInstagram().then(result => {
    process.exit(result.success ? 0 : 1);
});
