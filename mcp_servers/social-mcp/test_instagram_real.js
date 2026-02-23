#!/usr/bin/env node
/**
 * Instagram Live Post Test - WITH REAL IMAGE
 * Uses a real publicly accessible image URL
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
console.log('INSTAGRAM LIVE POST TEST - REAL IMAGE');
console.log('='.repeat(60));

if (!FACEBOOK_PAGE_ID || !ACCESS_TOKEN) {
    console.log('\n❌ ERROR: Credentials not found!');
    process.exit(1);
}

async function testInstagram() {
    try {
        // Get Instagram Business Account ID
        console.log('\n📱 Getting Instagram Business Account...');
        
        const igResponse = await axios.get(
            `https://graph.facebook.com/v18.0/${FACEBOOK_PAGE_ID}?fields=instagram_business_account&access_token=${ACCESS_TOKEN}`
        );
        
        if (!igResponse.data.instagram_business_account) {
            console.log('⚠️  No Instagram Business Account connected');
            return { success: false, error: 'No Instagram account' };
        }
        
        const igAccountId = igResponse.data.instagram_business_account.id;
        console.log('✅ Instagram Account ID:', igAccountId);
        
        // Use a REAL image URL (Unsplash - always accessible)
        const imageUrl = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1080&h=1080&fit=crop';
        const caption = '🧪 Gold Tier Live Test - Instagram Integration - Personal AI Employee Hackathon 0 #Hackathon0 #AI #Automation';
        
        console.log('\n📸 Creating media container...');
        console.log('   Image: programming laptop');
        console.log('   Caption:', caption.substring(0, 50) + '...');
        
        // Create media container
        const containerResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${igAccountId}/media`,
            {
                image_url: imageUrl,
                caption: caption,
                access_token: ACCESS_TOKEN
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        
        const creationId = containerResponse.data.id;
        console.log('\n✅ Media container created!');
        console.log('   ID:', creationId);
        
        // Wait for processing
        console.log('\n⏳ Processing (15 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 15000));
        
        // Publish
        console.log('\n📤 Publishing...');
        
        const publishResponse = await axios.post(
            `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
            {
                creation_id: creationId,
                access_token: ACCESS_TOKEN
            },
            {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            }
        );
        
        const postId = publishResponse.data.id;
        console.log('\n✅ Published!');
        console.log('   Post ID:', postId);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 INSTAGRAM LIVE TEST PASSED!');
        console.log('='.repeat(60));
        console.log('✅ Post published to Instagram');
        console.log('   Post ID:', postId);
        console.log('='.repeat(60));
        
        return { success: true, postId };
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.response?.data?.error?.message || error.message);
        return { success: false, error: error.message };
    }
}

testInstagram().then(result => process.exit(result.success ? 0 : 1));
