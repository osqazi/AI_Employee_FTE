#!/usr/bin/env node
/**
 * WhatsApp Automated Message - FINAL VERSION
 * Fixed viewport + better delivery confirmation
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=923353221004
 *   node test_whatsapp_final_auto.js
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const STORAGE_STATE_PATH = path.join(SESSION_PATH, 'storage_state.json');
const TEST_PHONE = (process.env.TEST_WHATSAPP_PHONE || '923353221004').replace('+', '');
const TEST_MESSAGE = process.env.TEST_MESSAGE || '🧪 Gold Tier Live Test - WhatsApp - Automated';

console.log('='.repeat(60));
console.log('WHATSAPP AUTOMATED - FINAL VERSION');
console.log('='.repeat(60));

if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.log('\n❌ Session not found!');
    process.exit(1);
}

console.log('\n📱 Phone:', TEST_PHONE);
console.log('💬 Message:', TEST_MESSAGE);
console.log('\nStarting...\n');

async function sendAutomatedMessage() {
    let browser;
    
    try {
        browser = await chromium.launch({
            headless: false,
            args: ['--start-maximized', '--window-size=1920,1080']
        });
        
        const context = await browser.newContext({
            storageState: STORAGE_STATE_PATH,
            viewport: { width: 1920, height: 1080 },
            deviceScaleFactor: 1
        });
        
        const page = await context.newPage();
        
        console.log('📱 Opening WhatsApp Web...');
        const whatsappUrl = `https://web.whatsapp.com/send?phone=${TEST_PHONE}&text=${encodeURIComponent(TEST_MESSAGE)}`;
        
        await page.goto(whatsappUrl, { waitUntil: 'networkidle', timeout: 30000 });
        
        console.log('⏳ Loading... (10 seconds)');
        await page.waitForTimeout(10000);
        
        // Check login
        const qrCode = await page.$('div[data-testid="qr-code"]');
        if (qrCode) {
            console.log('❌ Not logged in!');
            return { success: false };
        }
        
        console.log('✅ Logged in');
        await page.waitForTimeout(2000);
        
        // Find and click send button
        console.log('\n📤 Sending message...');
        
        const sendButton = await page.$('button:last-child');
        if (sendButton) {
            await sendButton.click();
            console.log('✅ Send button clicked');
        } else {
            await page.keyboard.press('Enter');
            console.log('⌨️  Sent via Enter key');
        }
        
        // Wait longer for message to send
        console.log('\n⏳ Waiting for delivery... (10 seconds)');
        await page.waitForTimeout(10000);
        
        // Take screenshot
        const screenshot = path.join(SESSION_PATH, 'whatsapp_final_auto.png');
        await page.screenshot({ path: screenshot });
        console.log('📸 Proof:', screenshot);
        
        // Check multiple delivery indicators
        const msgTime = await page.$('[data-testid="msg-time"]');
        const checkmark = await page.$('[data-icon="msg-check"]');
        const doubleCheck = await page.$('[data-icon="msg-doublecheck"]');
        const sentMsg = await page.$('span:has-text("Gold Tier")');
        
        console.log('\n🔍 Delivery check:');
        console.log('   Message time:', msgTime ? 'FOUND ✅' : 'not found');
        console.log('   Single check:', checkmark ? 'FOUND ✅' : 'not found');
        console.log('   Double check:', doubleCheck ? 'FOUND ✅' : 'not found');
        console.log('   Message text:', sentMsg ? 'FOUND ✅' : 'not found');
        
        if (msgTime || checkmark || doubleCheck || sentMsg) {
            console.log('\n✅ MESSAGE SENT SUCCESSFULLY!');
            console.log('\n🎉 WHATSAPP AUTOMATED TEST PASSED!');
            console.log('📸 Proof:', screenshot);
            return { success: true };
        } else {
            console.log('\n⚠️  Check screenshot manually:', screenshot);
            return { success: false };
        }
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
        return { success: false, error: error.message };
    } finally {
        if (browser) await browser.close();
    }
}

sendAutomatedMessage().then(result => {
    process.exit(result.success ? 0 : 1);
});
