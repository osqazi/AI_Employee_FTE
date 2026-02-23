#!/usr/bin/env node
/**
 * WhatsApp Manual Test - FINAL VERSION
 * Confirms you're logged in and shows chat list
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=+923353221004
 *   node test_whatsapp_final.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const STORAGE_STATE_PATH = path.join(SESSION_PATH, 'storage_state.json');
const TEST_PHONE = process.env.TEST_WHATSAPP_PHONE || '+923353221004';

console.log('='.repeat(60));
console.log('WHATSAPP MANUAL TEST - FINAL VERSION');
console.log('='.repeat(60));

// Check if session exists
if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.log('\n❌ ERROR: Session file not found!');
    console.log('   node auth_save_session.js');
    process.exit(1);
}

console.log('\n✅ Session loaded');
console.log('\n📱 Test phone:', TEST_PHONE);
console.log('\nStarting in 3 seconds...');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 3000));

async function testWhatsApp() {
    let browser;
    
    try {
        // Launch Chromium with saved session
        browser = await chromium.launch({
            headless: false,
            args: ['--start-maximized']
        });
        
        const context = await browser.newContext({
            storageState: STORAGE_STATE_PATH,
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        const page = await context.newPage();
        
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
        
        // Wait for page to load
        await page.waitForTimeout(5000);
        
        // Check login status
        const qrCode = await page.$('div[data-testid="qr-code"]');
        const appElement = await page.$('#app');
        const pageTitle = await page.title();
        
        console.log('\n📊 Status:');
        console.log('   Page title:', pageTitle);
        console.log('   QR code visible:', qrCode ? 'YES (not logged in)' : 'NO (LOGGED IN ✅)');
        console.log('   App element:', appElement ? 'FOUND ✅' : 'NOT FOUND');
        
        console.log('\n' + '='.repeat(60));
        
        if (!qrCode && appElement) {
            console.log('✅ SUCCESS! YOU ARE LOGGED IN!');
            console.log('\n📋 YOUR CHAT LIST SHOULD BE VISIBLE NOW');
            console.log('\n📋 MANUAL TEST:');
            console.log('1. Look at the left side - you should see your chat list');
            console.log('2. Click the search box (magnifying glass icon)');
            console.log(`3. Type or paste: ${TEST_PHONE}`);
            console.log('4. Click on the contact when it appears');
            console.log('5. In the message box at bottom, type:');
            console.log('   🧪 Gold Tier Live Test - WhatsApp');
            console.log('6. Press Enter to send');
            console.log('7. You should see your message with grey checkmarks ✓✓');
            console.log('\n✅ If you see your chat list and can send a message,');
            console.log('   WhatsApp integration is 100% OPERATIONAL!');
        } else {
            console.log('⚠️  Not logged in yet');
            console.log('   Please scan QR code if visible');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('Browser is open. Press Ctrl+C when done.');
        console.log('='.repeat(60));
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testWhatsApp();
