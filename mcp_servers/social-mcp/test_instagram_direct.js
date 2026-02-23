#!/usr/bin/env node
/**
 * Instagram Live Post Test - DIRECT TOKEN READ
 * Reads token directly from .env file
 */

import axios from 'axios';
import fs from 'fs';

// Read .env file directly
const envContent = fs.readFileSync('D:\\Projects\\hackathon\\ai-assist-fte\\.env', 'utf-8');
const tokenLine = envContent.split('\n').find(line => line.startsWith('FACEBOOK_ACCESS_TOKEN='));
const pageIdLine = envContent.split('\n').find(line => line.startsWith('FACEBOOK_PAGE_ID='));

const ACCESS_TOKEN = tokenLine ? tokenLine.split('=')[1].trim() : '';
const FACEBOOK_PAGE_ID = pageIdLine ? pageIdLine.split('=')[1].trim() : '';

console.log('='.repeat(60));
console.log('INSTAGRAM LIVE POST TEST - DIRECT READ');
console.log('='.repeat(60));

console.log('\n📋 Configuration:');
console.log('   Facebook Page ID:', FACEBOOK_PAGE_ID);
console.log('   Token starts with:', ACCESS_TOKEN.substring(0, 30) + '...');

if (!FACEBOOK_PAGE_ID || !ACCESS_TOKEN) {
    console.log('\n❌ ERROR: Credentials not found!');
    process.exit(1);
}

async function testInstagram() {
    try {
        // First, get Instagram Business Account ID
        console.log('\n📱 Getting Instagram Business Account...');
        
        const igResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}?fields=instagram_business_account&access_token=${ACCESS_TOKEN}`
        );
        
        if (!igResponse.data.instagram_business_account) {
            console.log('⚠️  No Instagram Business Account connected');
            console.log('\n📋 To connect:');
            console.log('   1. Go to Facebook Page Settings');
            console.log('   2. Click "Instagram"');
            console.log('   3. Connect your Instagram Business account');
            return { success: false, error: 'No Instagram account connected' };
        }
        
        const igAccountId = igResponse.data.instagram_business_account.id;
        console.log('✅ Instagram Business Account found!');
        console.log('   Account ID:', igAccountId);
        
        // Test image and caption
        const imageUrl = 'https://via.placeholder.com/1080x1080.png?text=Gold+Tier+Test';
        const caption = '🧪 Gold Tier Live Test - Instagram - Personal AI Employee Hackathon 0';
        
        console.log('\n📸 Step 1: Creating media container...');
        console.log('   Image:', imageUrl);
        console.log('   Caption:', caption);
        
        // Create media container
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
        
        // Wait for processing
        console.log('\n⏳ Processing media (10 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Publish media
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
        console.log('\n📱 Check your Instagram to verify the post');
        console.log('='.repeat(60));
        
        return { success: true, postId };
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.response?.data?.error?.message || error.message);
        
        if (error.response?.data?.error?.code === 190) {
            console.log('\n🔐 Token expired/invalid');
            console.log('   Get new token from Facebook Developer Tools');
        }
        
        return { success: false, error: error.message };
    }
}

testInstagram().then(result => process.exit(result.success ? 0 : 1));
