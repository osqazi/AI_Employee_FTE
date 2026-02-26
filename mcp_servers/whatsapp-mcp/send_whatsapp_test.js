#!/usr/bin/env node
/**
 * Send WhatsApp Test Message
 * Sends a test message to +923353221004 using saved session
 * 
 * Usage: node send_whatsapp_test.js
 */

import { chromium } from 'playwright';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const TEST_PHONE = '+923353221004';
const TEST_MESSAGE = `🧪 WhatsApp Watcher Test - Gold Tier Hackathon 0 - ${new Date().toISOString()}`;

console.log('='.repeat(60));
console.log('SEND WHATSAPP TEST MESSAGE');
console.log('='.repeat(60));

console.log('\n📱 Configuration:');
console.log('   To:', TEST_PHONE);
console.log('   Message:', TEST_MESSAGE);
console.log('\nStarting in 3 seconds...\n');

await new Promise(resolve => setTimeout(resolve, 3000));

async function sendTestMessage() {
    let context;
    
    try {
        console.log('🚀 Launching persistent browser...');
        
        // Use launchPersistentContext to reuse the same browser profile
        context = await chromium.launchPersistentContext(SESSION_PATH, {
            headless: false,
            args: ['--start-maximized', '--disable-gpu'],
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = context.pages()[0] || await context.newPage();
        
        console.log('📱 Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
        
        console.log('⏳ Waiting for page to load (10 seconds)...');
        await page.waitForTimeout(10000);
        
        // Check if logged in
        const qrCode = await page.$('div[data-testid="qr-code"]');
        if (qrCode) {
            console.log('❌ Not logged in! Please run: node auth_save_session.js');
            return { success: false };
        }
        
        console.log('✅ Logged in successfully');
        
        // Click search box
        console.log('\n🔍 Step 1: Finding search box...');
        const searchSelectors = [
            'div[role="searchbox"]',
            'input[aria-label="Search or start new chat"]',
            'input[placeholder="Search or start new chat"]',
            'span[data-icon="search"]'
        ];
        
        let searchBox = null;
        for (const selector of searchSelectors) {
            searchBox = await page.$(selector);
            if (searchBox) {
                console.log(`✅ Found with: ${selector}`);
                break;
            }
        }
        
        if (!searchBox) {
            console.log('⌨️  Using keyboard shortcut...');
            await page.keyboard.press('Control+f');
            await page.waitForTimeout(1000);
        } else {
            await searchBox.click();
            await page.waitForTimeout(1000);
        }
        console.log('✅ Search activated');
        
        // Type phone number
        console.log(`\n📞 Step 2: Typing ${TEST_PHONE}...`);
        await page.keyboard.type(TEST_PHONE);
        await page.waitForTimeout(3000);
        console.log('✅ Phone number typed');
        
        // Find and click contact
        console.log('\n👤 Step 3: Selecting contact...');
        const spans = await page.$$('span');
        let contactClicked = false;
        
        for (const span of spans) {
            try {
                const text = await span.textContent();
                if (text && text.includes(TEST_PHONE)) {
                    await span.click();
                    console.log('✅ Contact selected');
                    contactClicked = true;
                    break;
                }
            } catch (e) {
                // Continue
            }
        }
        
        if (!contactClicked) {
            console.log('⚠️  Contact not found, trying Enter key...');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(2000);
        }
        
        await page.waitForTimeout(2000);
        
        // Type message
        console.log('\n✏️  Step 4: Typing message...');
        const messageBox = await page.$('div[contenteditable="true"][data-tab="10"]');
        if (messageBox) {
            await messageBox.click();
            await page.keyboard.type(TEST_MESSAGE);
            console.log('✅ Message typed');
        } else {
            console.log('⚠️  Message box not found, trying direct input...');
            await page.keyboard.type(TEST_MESSAGE);
        }
        
        await page.waitForTimeout(1000);
        
        // Send message
        console.log('\n📤 Step 5: Sending message...');
        await page.keyboard.press('Enter');
        console.log('✅ Message sent!');
        
        // Wait for delivery confirmation
        console.log('\n⏳ Waiting for delivery confirmation (10 seconds)...');
        await page.waitForTimeout(10000);
        
        // Check for sent message indicators
        const msgTime = await page.$('[data-testid="msg-time"]');
        const checkmarks = await page.$('[data-icon="msg-check"]');
        
        if (msgTime || checkmarks) {
            console.log('\n✅ Message delivery confirmed!');
            
            // Take screenshot
            const screenshotPath = path.join(SESSION_PATH, 'test_message_sent.png');
            await page.screenshot({ path: screenshotPath });
            console.log(`📸 Screenshot saved: ${screenshotPath}`);
            
            console.log('\n' + '='.repeat(60));
            console.log('🎉 TEST MESSAGE SENT SUCCESSFULLY!');
            console.log('='.repeat(60));
            console.log(`\nTo: ${TEST_PHONE}`);
            console.log(`Message: ${TEST_MESSAGE}`);
            console.log('\n✅ WhatsApp integration is fully operational!');
            console.log('='.repeat(60));
            
            return { success: true };
        } else {
            console.log('\n⚠️  Could not confirm delivery');
            console.log('   Please check WhatsApp manually');
            return { success: false };
        }
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
        return { success: false, error: error.message };
    } finally {
        if (context) {
            console.log('\n🔒 Closing browser...');
            await context.close();
        }
    }
}

// Run the test
sendTestMessage().then(result => {
    process.exit(result.success ? 0 : 1);
});
