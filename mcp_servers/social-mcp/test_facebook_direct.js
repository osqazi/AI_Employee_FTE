#!/usr/bin/env node
/**
 * Facebook Live Post Test - DIRECT TOKEN READ
 * Reads token directly from .env file
 */

import axios from 'axios';
import fs from 'fs';

// Read .env file directly
const envContent = fs.readFileSync('D:\\Projects\\hackathon\\ai-assist-fte\\.env', 'utf-8');
const tokenLine = envContent.split('\n').find(line => line.startsWith('FACEBOOK_ACCESS_TOKEN='));
const pageIdLine = envContent.split('\n').find(line => line.startsWith('FACEBOOK_PAGE_ID='));

const FACEBOOK_ACCESS_TOKEN = tokenLine ? tokenLine.split('=')[1].trim() : '';
const FACEBOOK_PAGE_ID = pageIdLine ? pageIdLine.split('=')[1].trim() : '';

console.log('='.repeat(60));
console.log('FACEBOOK LIVE POST TEST - DIRECT READ');
console.log('='.repeat(60));

console.log('\n📋 Configuration:');
console.log('   Page ID:', FACEBOOK_PAGE_ID);
console.log('   Token starts with:', FACEBOOK_ACCESS_TOKEN.substring(0, 30) + '...');

if (!FACEBOOK_PAGE_ID || !FACEBOOK_ACCESS_TOKEN) {
    console.log('\n❌ ERROR: Credentials not found!');
    process.exit(1);
}

console.log('\n📱 Posting to Facebook...\n');

async function postToFacebook() {
    try {
        const message = '🧪 Gold Tier Live Test - Facebook - ' + new Date().toISOString();
        
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
        console.log('✅ Post successful!');
        console.log('   Post ID:', postId);
        console.log('\n🎉 FACEBOOK LIVE TEST PASSED!');
        console.log('='.repeat(60));
        
        return { success: true, postId };
        
    } catch (error) {
        console.log('❌ ERROR:', error.response?.data?.error?.message || error.message);
        
        if (error.response?.status === 401) {
            console.log('\n🔐 Token invalid. Please get fresh token from:');
            console.log('https://developers.facebook.com/tools/explorer/');
        }
        
        return { success: false, error: error.message };
    }
}

postToFacebook().then(result => process.exit(result.success ? 0 : 1));
