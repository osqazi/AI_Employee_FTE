#!/usr/bin/env node
/**
 * WhatsApp Automated Message - FIXED VIEWPORT
 * Uses proper viewport and zoom to fit entire WhatsApp Web interface
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=923353221004
 *   node test_whatsapp_automated_fixed.js
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const STORAGE_STATE_PATH = path.join(SESSION_PATH, 'storage_state.json');
const TEST_PHONE = (process.env.TEST_WHATSAPP_PHONE || '923353221004').replace('+', '');
const TEST_MESSAGE = process.env.TEST_MESSAGE || '🧪 Gold Tier Live Test - WhatsApp - Automated';

console.log('='.repeat(60));
console.log('WHATSAPP AUTOMATED - FIXED VIEWPORT');
console.log('='.repeat(60));

if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.log('\n❌ Session not found! Run: node auth_save_session.js');
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
            args: [
                '--start-maximized',
                '--disable-gpu',
                '--window-size=1920,1080'
            ]
        });
        
        // Create context with LARGER viewport to fit entire WhatsApp Web
        const context = await browser.newContext({
            storageState: STORAGE_STATE_PATH,
            viewport: { width: 1920, height: 1080 },  // Full HD
            deviceScaleFactor: 1,  // No scaling
            isMobile: false,
            hasTouch: false,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        const page = await context.newPage();
        
        // Set zoom to 75% to fit more content
        await page.setViewportSize({ width: 1920, height: 1080 });
        
        console.log('📱 Opening WhatsApp Web with click-to-chat...');
        const whatsappUrl = `https://web.whatsapp.com/send?phone=${TEST_PHONE}&text=${encodeURIComponent(TEST_MESSAGE)}`;
        
        await page.goto(whatsappUrl, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for page to load (8 seconds)...');
        await page.waitForTimeout(8000);
        
        // Take screenshot to see layout
        const screenshot1 = path.join(SESSION_PATH, 'auto_viewport_loaded.png');
        await page.screenshot({ path: screenshot1 });
        console.log('📸 Screenshot:', screenshot1);
        
        // Check if logged in
        const qrCode = await page.$('div[data-testid="qr-code"]');
        if (qrCode) {
            console.log('❌ Not logged in!');
            return { success: false };
        }
        
        console.log('✅ Logged in');
        
        // Wait for chat to be ready
        await page.waitForTimeout(3000);
        
        // Try to find send button with better selectors
        console.log('\n📤 Finding send button...');
        
        const sendSelectors = [
            'button[data-testid="compose-btn-send"]',
            'button[aria-label="Send"]',
            'button[type="button"] > span[data-icon="send"]',
            'span[data-icon="send"]',
            'button:last-child'
        ];
        
        let sendButton = null;
        for (const selector of sendSelectors) {
            sendButton = await page.$(selector);
            if (sendButton) {
                console.log(`✅ Send button found: ${selector}`);
                break;
            }
        }
        
        if (sendButton) {
            console.log('📤 Clicking send button...');
            await sendButton.click();
            await page.waitForTimeout(5000);
        } else {
            console.log('⌨️  Send button not found, trying Enter key...');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(5000);
        }
        
        // Wait for message to send
        console.log('\n⏳ Waiting for message delivery...');
        await page.waitForTimeout(5000);
        
        // Take final screenshot
        const screenshot2 = path.join(SESSION_PATH, 'auto_viewport_sent.png');
        await page.screenshot({ path: screenshot2 });
        console.log('📸 Final screenshot:', screenshot2);
        
        // Verify message was sent
        const msgTime = await page.$('[data-testid="msg-time"]');
        const checkmarks = await page.$('[data-icon="msg-check"]');
        const doubleCheck = await page.$('[data-icon="msg-doublecheck"]');
        
        if (msgTime || checkmarks || doubleCheck) {
            console.log('\n✅ Message sent successfully!');
            console.log('\n🎉 WHATSAPP AUTOMATED TEST PASSED!');
            console.log('📸 Proof:', screenshot2);
            return { success: true };
        } else {
            console.log('⚠️  Could not confirm delivery');
            console.log('📸 Check screenshot:', screenshot2);
            return { success: false };
        }
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
        console.log('Stack:', error.stack);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

sendAutomatedMessage().then(result => {
    process.exit(result.success ? 0 : 1);
});
