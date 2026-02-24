#!/usr/bin/env node
/**
 * LinkedIn Live Post Test
 * Posts a test update to LinkedIn using LinkedIn API v2
 * 
 * Usage: node test_linkedin_live.js
 */

import axios from 'axios';
import fs from 'fs';

// Read .env file directly
const envContent = fs.readFileSync('D:\\Projects\\hackathon\\ai-assist-fte\\.env', 'utf-8');

const LINKEDIN_ACCESS_TOKEN = envContent.split('\n').find(line => line.startsWith('LINKEDIN_ACCESS_TOKEN='))?.split('=')[1].trim();
const LINKEDIN_PERSON_URN = envContent.split('\n').find(line => line.startsWith('LINKEDIN_PERSON_URN='))?.split('=')[1].trim();
const LINKEDIN_ORGANIZATION_ID = envContent.split('\n').find(line => line.startsWith('LINKEDIN_ORGANIZATION_ID='))?.split('=')[1].trim();

console.log('='.repeat(60));
console.log('LINKEDIN LIVE POST TEST');
console.log('='.repeat(60));

console.log('\n📋 Configuration:');
console.log('   Access Token:', LINKEDIN_ACCESS_TOKEN ? LINKEDIN_ACCESS_TOKEN.substring(0, 30) + '...' : 'NOT SET');
console.log('   Person URN:', LINKEDIN_PERSON_URN ? LINKEDIN_PERSON_URN : 'NOT SET');
console.log('   Organization ID:', LINKEDIN_ORGANIZATION_ID ? LINKEDIN_ORGANIZATION_ID : 'NOT SET');

if (!LINKEDIN_ACCESS_TOKEN) {
    console.log('\n❌ ERROR: LinkedIn credentials not configured!');
    console.log('\n📋 To get LinkedIn credentials:');
    console.log('   1. Go to https://www.linkedin.com/developers/apps');
    console.log('   2. Create or select your app');
    console.log('   3. Go to "Auth" tab to get Client ID and Secret');
    console.log('   4. Use OAuth 2.0 to get Access Token');
    console.log('   5. Update .env with credentials');
    process.exit(1);
}

console.log('\nStarting test...\n');

async function postToLinkedIn() {
    try {
        const postText = '🧪 Gold Tier Live Test - LinkedIn Integration - Personal AI Employee Hackathon 0 #Hackathon0 #AI #Automation #LinkedIn';
        
        // Determine author (use personal profile for testing)
        let author;
        if (LINKEDIN_PERSON_URN) {
            author = LINKEDIN_PERSON_URN;
            console.log('📝 Posting to Personal Profile...');
        } else if (LINKEDIN_ORGANIZATION_ID) {
            author = `urn:li:organization:${LINKEDIN_ORGANIZATION_ID}`;
            console.log('📝 Posting to Organization Page...');
        } else {
            author = 'urn:li:person:me';
            console.log('📝 Posting to Your Profile...');
        }
        
        console.log('   Author:', author);
        console.log('   Post:', postText);
        
        // Create LinkedIn post using API v2 (correct format)
        const response = await axios.post(
            'https://api.linkedin.com/v2/shares',
            {
                text: {
                    text: postText
                },
                owner: author
            },
            {
                headers: {
                    'Authorization': `Bearer ${LINKEDIN_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                    'X-Restli-Protocol-Version': '2.0.0'
                }
            }
        );
        
        const postId = response.data.id;
        console.log('\n✅ Post successful!');
        console.log('   Post ID:', postId);
        
        console.log('\n' + '='.repeat(60));
        console.log('🎉 LINKEDIN LIVE TEST PASSED!');
        console.log('='.repeat(60));
        console.log('\n✅ Post successfully published to LinkedIn');
        console.log('   Post ID:', postId);
        console.log('\n📱 Check your LinkedIn profile to verify the post');
        console.log('='.repeat(60));
        
        return { success: true, postId };
        
    } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;
        
        console.log('\n❌ ERROR:', message);
        
        if (status === 401) {
            console.log('\n🔐 Token invalid or expired');
            console.log('   Get new token from LinkedIn Developer Portal');
        } else if (status === 403) {
            console.log('\n🔒 Forbidden - Check app permissions');
            console.log('   Ensure app has w_member_social or w_organization_social permission');
        } else if (status === 400) {
            console.log('\n⚠️  Bad Request - Check API format');
            console.log('   LinkedIn API v2 requires specific format');
        }
        
        return { success: false, error: message };
    }
}

// Run the test
postToLinkedIn().then(result => {
    process.exit(result.success ? 0 : 1);
});
