#!/usr/bin/env node
/**
 * WhatsApp Automated Message - CLICK TO CHAT METHOD
 * Uses WhatsApp's click-to-chat URL for reliable automation
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=923353221004 (without +)
 *   node test_whatsapp_click_to_chat.js
 */

import { chromium } from 'playwright';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const TEST_PHONE = (process.env.TEST_WHATSAPP_PHONE || '923353221004').replace('+', '');
const TEST_MESSAGE = process.env.TEST_MESSAGE || '🧪 Gold Tier Live Test - WhatsApp - Automated';

console.log('='.repeat(60));
console.log('WHATSAPP AUTOMATED - CLICK TO CHAT METHOD');
console.log('='.repeat(60));

console.log('\n📱 Phone:', TEST_PHONE);
console.log('💬 Message:', TEST_MESSAGE);
console.log('\nStarting...\n');

async function sendAutomatedMessage() {
    let browser;
    
    try {
        browser = await chromium.launch({
            headless: false,
            args: ['--start-maximized']
        });
        
        const context = await browser.newContext({
            storageState: path.join(SESSION_PATH, 'storage_state.json'),
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = await context.newPage();
        
        // Use WhatsApp click-to-chat URL
        console.log('📱 Opening WhatsApp click-to-chat...');
        const whatsappUrl = `https://web.whatsapp.com/send?phone=${TEST_PHONE}&text=${encodeURIComponent(TEST_MESSAGE)}`;
        console.log('URL:', whatsappUrl);
        
        await page.goto(whatsappUrl, { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for page to load...');
        await page.waitForTimeout(8000);
        
        // Check if logged in
        const qrCode = await page.$('div[data-testid="qr-code"]');
        if (qrCode) {
            console.log('❌ Not logged in! Run: node auth_save_session.js');
            return { success: false };
        }
        
        console.log('✅ Page loaded and logged in');
        
        // Look for send button or message sent indicator
        console.log('\n📤 Looking for send button...');
        
        // Try to find and click send button
        const sendButton = await page.$('button[data-testid="compose-btn-send"]');
        
        if (sendButton) {
            console.log('✅ Send button found, clicking...');
            await sendButton.click();
            await page.waitForTimeout(3000);
        } else {
            console.log('⌨️  Send button not found, trying Enter key...');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(3000);
        }
        
        // Wait for message to be sent
        console.log('\n⏳ Waiting for message to send...');
        await page.waitForTimeout(5000);
        
        // Verify message was sent
        const msgTime = await page.$('[data-testid="msg-time"]');
        const checkmarks = await page.$('[data-icon="msg-check"]');
        
        if (msgTime || checkmarks) {
            console.log('\n✅ Message sent successfully!');
            console.log('\n🎉 WHATSAPP AUTOMATED TEST PASSED!');
            
            // Save screenshot
            const screenshotPath = path.join(SESSION_PATH, 'whatsapp_automated_sent.png');
            await page.screenshot({ path: screenshotPath });
            console.log('📸 Proof saved:', screenshotPath);
            
            return { success: true };
        } else {
            console.log('⚠️  Could not confirm delivery');
            
            // Save debug screenshot
            const debugPath = path.join(SESSION_PATH, 'whatsapp_debug.png');
            await page.screenshot({ path: debugPath });
            console.log('📸 Debug:', debugPath);
            
            return { success: false };
        }
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
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
