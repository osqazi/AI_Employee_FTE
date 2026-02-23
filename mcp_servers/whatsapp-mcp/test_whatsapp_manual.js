#!/usr/bin/env node
/**
 * WhatsApp Manual Test - LOADS SAVED SESSION
 * Uses storage_state.json to load saved session
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=+923353221004
 *   node test_whatsapp_manual.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const STORAGE_STATE_PATH = path.join(SESSION_PATH, 'storage_state.json');
const TEST_PHONE = process.env.TEST_WHATSAPP_PHONE || '+923353221004';

console.log('='.repeat(60));
console.log('WHATSAPP MANUAL TEST - LOADS SAVED SESSION');
console.log('='.repeat(60));

// Check if session exists
if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.log('\n❌ ERROR: Session file not found!');
    console.log('   Expected:', STORAGE_STATE_PATH);
    console.log('\n📋 Please authenticate first:');
    console.log('   node auth_save_session.js');
    process.exit(1);
}

console.log('\n✅ Session file found:', STORAGE_STATE_PATH);
console.log('\n📱 Test phone:', TEST_PHONE);
console.log('\nStarting in 3 seconds...');
console.log('='.repeat(60));
console.log('This will:');
console.log('1. Open WhatsApp Web with SAVED SESSION');
console.log('2. You should see your chat list immediately');
console.log('3. Manually send test message to verify');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 3000));

async function testWhatsApp() {
    let browser;
    
    try {
        console.log('\n🚀 Loading saved session...');
        
        // Load saved storage state
        const storageState = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
        
        console.log('✅ Session loaded');
        console.log('   Cookies:', storageState.cookies?.length || 0);
        console.log('   LocalStorage origins:', storageState.origins?.length || 0);
        
        // Launch browser with saved session
        browser = await chromium.launch({
            headless: false,
            args: ['--start-maximized', '--disable-gpu']
        });
        
        console.log('\n📱 Creating context with saved session...');
        
        const context = await browser.newContext({
            storageState: STORAGE_STATE_PATH,
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        });
        
        console.log('✅ Context created with saved cookies');
        
        const page = await context.newPage();
        
        console.log('\n📱 Opening WhatsApp Web...');
        
        // Navigate to WhatsApp Web
        await page.goto('https://web.whatsapp.com', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('✅ Page loaded');
        
        // Wait for page to stabilize
        await page.waitForTimeout(5000);
        
        // Check what's loaded
        const pageTitle = await page.title();
        console.log('\n📊 Page title:', pageTitle);
        
        // Check for logged-in indicators
        const appElement = await page.$('#app');
        const contactList = await page.$('span[title]');
        const qrCode = await page.$('div[data-testid="qr-code"]');
        
        console.log('\n🔍 Detection results:');
        console.log('   App element:', appElement ? 'FOUND' : 'NOT FOUND');
        console.log('   Contact list:', contactList ? 'FOUND' : 'NOT FOUND');
        console.log('   QR code:', qrCode ? 'VISIBLE (not logged in)' : 'NOT VISIBLE (logged in)');
        
        console.log('\n' + '='.repeat(60));
        
        if (appElement && contactList && !qrCode) {
            console.log('✅ SUCCESS! You are LOGGED IN!');
            console.log('\n📋 MANUAL TEST:');
            console.log('1. Look for your chat list on the left');
            console.log('2. Click the search box at top');
            console.log(`3. Type: ${TEST_PHONE}`);
            console.log('4. Select the contact');
            console.log('5. Type: 🧪 Gold Tier Live Test - WhatsApp');
            console.log('6. Press Enter to send');
            console.log('7. Verify message appears with checkmarks ✓✓');
        } else if (qrCode) {
            console.log('⚠️  QR CODE VISIBLE - Session may have expired');
            console.log('\n📋 To re-authenticate:');
            console.log('   node auth_save_session.js');
        } else {
            console.log('⚠️  Page loaded but detection unclear');
            console.log('   Please check browser manually');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('Browser is open. Press Ctrl+C when done.');
        console.log('='.repeat(60));
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
        console.log('\nStack:', error.stack);
    } finally {
        if (browser) {
            console.log('\n🔒 Closing browser...');
            await browser.close();
        }
    }
}

testWhatsApp();
