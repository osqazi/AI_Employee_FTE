#!/usr/bin/env node
/**
 * WhatsApp Automated Message Test
 * Sends a test message automatically using saved session
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=+923353221004
 *   set TEST_MESSAGE="Gold Tier Live Test"
 *   node test_whatsapp_automated.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const STORAGE_STATE_PATH = path.join(SESSION_PATH, 'storage_state.json');
const TEST_PHONE = process.env.TEST_WHATSAPP_PHONE || '+923353221004';
const TEST_MESSAGE = process.env.TEST_MESSAGE || '🧪 Gold Tier Live Test - WhatsApp - Automated Message';

console.log('='.repeat(60));
console.log('WHATSAPP AUTOMATED MESSAGE TEST');
console.log('='.repeat(60));

// Check if session exists
if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.log('\n❌ ERROR: Session file not found!');
    console.log('   node auth_save_session.js');
    process.exit(1);
}

console.log('\n✅ Session loaded');
console.log('\n📱 Test phone:', TEST_PHONE);
console.log('💬 Test message:', TEST_MESSAGE);
console.log('\nStarting in 3 seconds...');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 3000));

async function sendAutomatedMessage() {
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
        
        console.log('\n📱 Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
        
        // Wait for page to load
        console.log('⏳ Waiting for WhatsApp to load...');
        await page.waitForTimeout(5000);
        
        // Check if logged in
        const qrCode = await page.$('div[data-testid="qr-code"]');
        if (qrCode) {
            console.log('\n❌ ERROR: Not logged in! QR code visible.');
            console.log('   Please run: node auth_save_session.js');
            return { success: false, error: 'Not logged in' };
        }
        
        console.log('✅ Logged in successfully');
        
        // Wait for chat list to load
        console.log('⏳ Waiting for chat list...');
        await page.waitForTimeout(3000);
        
        // Step 1: Click on search box
        console.log('\n🔍 Step 1: Clicking search box...');
        const searchBox = await page.$('div[role="searchbox"]');
        if (!searchBox) {
            console.log('❌ ERROR: Search box not found');
            return { success: false, error: 'Search box not found' };
        }
        await searchBox.click();
        await page.waitForTimeout(1000);
        console.log('✅ Search box clicked');
        
        // Step 2: Type phone number
        console.log(`\n📞 Step 2: Typing phone number: ${TEST_PHONE}`);
        await page.keyboard.type(TEST_PHONE);
        await page.waitForTimeout(2000);
        console.log('✅ Phone number typed');
        
        // Step 3: Wait for contact to appear and click it
        console.log('\n👤 Step 3: Waiting for contact to appear...');
        await page.waitForTimeout(2000);
        
        // Find and click the contact
        const contactSelector = `span[title*="${TEST_PHONE}"]`;
        const contact = await page.$(contactSelector);
        
        if (!contact) {
            console.log('⚠️  Contact not found by exact match, trying partial...');
            // Try to find any span with the phone number
            const spans = await page.$$('span');
            let foundContact = null;
            for (const span of spans) {
                const text = await span.textContent();
                if (text && text.includes(TEST_PHONE)) {
                    foundContact = span;
                    break;
                }
            }
            
            if (foundContact) {
                console.log('✅ Contact found by partial match');
                await foundContact.click();
            } else {
                console.log('❌ ERROR: Contact not found');
                console.log('   Please check if the phone number exists in your contacts');
                return { success: false, error: 'Contact not found' };
            }
        } else {
            await contact.click();
            console.log('✅ Contact clicked');
        }
        
        // Wait for chat to open
        console.log('\n⏳ Waiting for chat to open...');
        await page.waitForTimeout(2000);
        
        // Step 4: Type message
        console.log('\n✏️  Step 4: Typing message...');
        const messageBox = await page.$('div[contenteditable="true"][data-tab="10"]');
        if (!messageBox) {
            console.log('❌ ERROR: Message box not found');
            return { success: false, error: 'Message box not found' };
        }
        
        await messageBox.click();
        await page.keyboard.type(TEST_MESSAGE);
        await page.waitForTimeout(1000);
        console.log('✅ Message typed');
        
        // Step 5: Send message
        console.log('\n📤 Step 5: Sending message...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        console.log('✅ Message sent');
        
        // Step 6: Verify message was sent
        console.log('\n✓ Step 6: Verifying message was sent...');
        await page.waitForTimeout(2000);
        
        // Check for sent message indicators (checkmarks)
        const sentIndicator = await page.$('[data-testid="msg-time"]');
        const checkmarks = await page.$('[data-icon="msg-check"]');
        
        if (sentIndicator || checkmarks) {
            console.log('✅ Message delivery confirmed!');
            console.log('\n' + '='.repeat(60));
            console.log('🎉 SUCCESS! AUTOMATED WHATSAPP MESSAGE SENT!');
            console.log('='.repeat(60));
            console.log(`\n📱 To: ${TEST_PHONE}`);
            console.log(`💬 Message: ${TEST_MESSAGE}`);
            console.log('\n✅ WhatsApp MCP integration is 100% OPERATIONAL!');
            console.log('='.repeat(60));
            
            // Take screenshot as proof
            const screenshotPath = path.join(SESSION_PATH, 'whatsapp_message_sent.png');
            await page.screenshot({ path: screenshotPath });
            console.log('\n📸 Screenshot saved to:', screenshotPath);
            
            return { 
                success: true, 
                message: 'Message sent successfully',
                phone: TEST_PHONE,
                screenshot: screenshotPath
            };
        } else {
            console.log('⚠️  Could not confirm message delivery');
            console.log('   Please check browser manually');
            return { success: false, error: 'Could not confirm delivery' };
        }
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
        console.log('\nStack:', error.stack);
        return { success: false, error: error.message };
    } finally {
        if (browser) {
            console.log('\n🔒 Closing browser...');
            await browser.close();
        }
    }
}

// Run the automated test
sendAutomatedMessage().then(result => {
    if (result.success) {
        console.log('\n✅ TEST PASSED!');
        process.exit(0);
    } else {
        console.log('\n❌ TEST FAILED:', result.error);
        process.exit(1);
    }
});
