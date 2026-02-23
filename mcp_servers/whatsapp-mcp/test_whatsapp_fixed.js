#!/usr/bin/env node
/**
 * WhatsApp Manual Test - LOADS SAVED SESSION (FIXED)
 * Uses proper Chromium with Chrome user agent
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=+923353221004
 *   node test_whatsapp_fixed.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const STORAGE_STATE_PATH = path.join(SESSION_PATH, 'storage_state.json');
const TEST_PHONE = process.env.TEST_WHATSAPP_PHONE || '+923353221004';

console.log('='.repeat(60));
console.log('WHATSAPP MANUAL TEST - LOADS SAVED SESSION (FIXED)');
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
        
        // Launch Chromium browser (NOT Safari!)
        console.log('\n🌐 Launching Chromium browser...');
        
        browser = await chromium.launch({
            headless: false,
            args: [
                '--start-maximized',
                '--disable-gpu',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        
        console.log('✅ Chromium launched');
        
        // Create context with saved session AND proper Chrome user agent
        const context = await browser.newContext({
            storageState: STORAGE_STATE_PATH,
            viewport: { width: 1920, height: 1080 },
            // Use REAL Chrome user agent (not Safari!)
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            // Explicitly set device scale factor
            deviceScaleFactor: 1,
            // Explicitly set as desktop (not mobile)
            isMobile: false,
            hasTouch: false,
            // Set proper locale
            locale: 'en-US',
            timezoneId: 'America/New_York'
        });
        
        console.log('✅ Context created with Chrome user agent');
        
        const page = await context.newPage();
        
        // Set proper headers to avoid mobile/Safari redirect
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"'
        });
        
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
        const safariWarning = await page.$('text=Safari');
        
        console.log('\n🔍 Detection results:');
        console.log('   App element:', appElement ? 'FOUND' : 'NOT FOUND');
        console.log('   Contact list:', contactList ? 'FOUND' : 'NOT FOUND');
        console.log('   QR code:', qrCode ? 'VISIBLE (not logged in)' : 'NOT VISIBLE (logged in)');
        console.log('   Safari warning:', safariWarning ? 'VISIBLE (wrong browser detected)' : 'NOT VISIBLE (correct)');
        
        // Take screenshot for debugging
        const screenshotPath = path.join(SESSION_PATH, 'test_screenshot.png');
        await page.screenshot({ path: screenshotPath });
        console.log('\n📸 Screenshot saved to:', screenshotPath);
        
        console.log('\n' + '='.repeat(60));
        
        if (appElement && contactList && !qrCode && !safariWarning) {
            console.log('✅ SUCCESS! You are LOGGED IN!');
            console.log('\n📋 MANUAL TEST:');
            console.log('1. Look for your chat list on the left');
            console.log('2. Click the search box at top');
            console.log(`3. Type: ${TEST_PHONE}`);
            console.log('4. Select the contact');
            console.log('5. Type: 🧪 Gold Tier Live Test - WhatsApp');
            console.log('6. Press Enter to send');
            console.log('7. Verify message appears with checkmarks ✓✓');
        } else if (safariWarning) {
            console.log('⚠️  SAFARI WARNING VISIBLE');
            console.log('   Browser is being detected as Safari instead of Chrome');
            console.log('   This is a user agent issue');
        } else if (qrCode) {
            console.log('⚠️  QR CODE VISIBLE - Session may have expired');
            console.log('\n📋 To re-authenticate:');
            console.log('   node auth_save_session.js');
        } else {
            console.log('⚠️  Page loaded but detection unclear');
            console.log('   Please check browser manually');
            console.log('   Check screenshot:', screenshotPath);
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
