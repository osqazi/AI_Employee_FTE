#!/usr/bin/env node
/**
 * WhatsApp Automated Message Test - IMPROVED SELECTORS
 * Sends a test message automatically using saved session
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=+923353221004
 *   node test_whatsapp_auto_v2.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const STORAGE_STATE_PATH = path.join(SESSION_PATH, 'storage_state.json');
const TEST_PHONE = process.env.TEST_WHATSAPP_PHONE || '+923353221004';
const TEST_MESSAGE = process.env.TEST_MESSAGE || '🧪 Gold Tier Live Test - WhatsApp - Automated';

console.log('='.repeat(60));
console.log('WHATSAPP AUTOMATED MESSAGE TEST - V2');
console.log('='.repeat(60));

if (!fs.existsSync(STORAGE_STATE_PATH)) {
    console.log('\n❌ Session not found! Run: node auth_save_session.js');
    process.exit(1);
}

console.log('\n✅ Session loaded');
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
            storageState: STORAGE_STATE_PATH,
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        const page = await context.newPage();
        
        console.log('📱 Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);
        
        // Check if logged in
        const qrCode = await page.$('div[data-testid="qr-code"]');
        if (qrCode) {
            console.log('❌ Not logged in! Please run: node auth_save_session.js');
            return { success: false };
        }
        
        console.log('✅ Logged in');
        await page.waitForTimeout(3000);
        
        // Take screenshot to see what we're working with
        const debugScreenshot = path.join(SESSION_PATH, 'debug_before_search.png');
        await page.screenshot({ path: debugScreenshot });
        console.log('📸 Debug screenshot:', debugScreenshot);
        
        // Try multiple search box selectors
        console.log('\n🔍 Finding search box...');
        
        const searchSelectors = [
            'div[role="searchbox"]',
            'input[aria-label="Search or start new chat"]',
            'input[placeholder="Search or start new chat"]',
            'div[data-testid="search"]',
            'span[data-icon="search"]',
            'button[aria-label*="Search"]'
        ];
        
        let searchElement = null;
        let usedSelector = '';
        
        for (const selector of searchSelectors) {
            try {
                searchElement = await page.$(selector);
                if (searchElement) {
                    usedSelector = selector;
                    console.log(`✅ Found with: ${selector}`);
                    break;
                }
            } catch (e) {
                // Try next selector
            }
        }
        
        if (!searchElement) {
            console.log('❌ Search box not found with any selector');
            console.log('📸 Check screenshot:', debugScreenshot);
            
            // Try keyboard shortcut to focus search
            console.log('\n⌨️  Trying keyboard shortcut (Ctrl+F)...');
            await page.keyboard.press('Control+f');
            await page.waitForTimeout(1000);
        } else {
            await searchElement.click();
            await page.waitForTimeout(1000);
        }
        
        // Type phone number
        console.log(`\n📞 Typing: ${TEST_PHONE}`);
        await page.keyboard.type(TEST_PHONE);
        await page.waitForTimeout(3000);
        
        // Take screenshot after typing
        const afterTypeScreenshot = path.join(SESSION_PATH, 'debug_after_type.png');
        await page.screenshot({ path: afterTypeScreenshot });
        console.log('📸 After typing:', afterTypeScreenshot);
        
        // Find and click contact
        console.log('\n👤 Finding contact...');
        const spans = await page.$$('span');
        let clickedContact = false;
        
        for (const span of spans) {
            try {
                const text = await span.textContent();
                if (text && text.includes(TEST_PHONE)) {
                    await span.click();
                    console.log('✅ Contact clicked');
                    clickedContact = true;
                    break;
                }
            } catch (e) {
                // Continue to next span
            }
        }
        
        if (!clickedContact) {
            console.log('❌ Contact not found');
            console.log('📸 Check screenshot:', afterTypeScreenshot);
            return { success: false, error: 'Contact not found' };
        }
        
        await page.waitForTimeout(2000);
        
        // Type message
        console.log('\n✏️  Typing message...');
        const messageSelectors = [
            'div[contenteditable="true"][data-tab="10"]',
            'div[contenteditable="true"]',
            'div[data-testid="textbox"]',
            'div[role="textbox"]'
        ];
        
        let messageBox = null;
        for (const selector of messageSelectors) {
            messageBox = await page.$(selector);
            if (messageBox) {
                console.log(`✅ Message box found: ${selector}`);
                break;
            }
        }
        
        if (!messageBox) {
            console.log('❌ Message box not found');
            // Try direct keyboard input
            console.log('⌨️  Using direct keyboard input...');
            await page.keyboard.type(TEST_MESSAGE);
        } else {
            await messageBox.click();
            await page.keyboard.type(TEST_MESSAGE);
        }
        
        await page.waitForTimeout(1000);
        
        // Send message
        console.log('\n📤 Sending message...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
        
        // Verify
        const sentIndicator = await page.$('[data-testid="msg-time"]');
        const checkmarks = await page.$('[data-icon="msg-check"]');
        
        if (sentIndicator || checkmarks) {
            console.log('✅ Message sent successfully!');
            console.log('\n🎉 WHATSAPP AUTOMATED MESSAGE TEST PASSED!');
            
            const finalScreenshot = path.join(SESSION_PATH, 'message_sent_proof.png');
            await page.screenshot({ path: finalScreenshot });
            console.log('📸 Proof saved:', finalScreenshot);
            
            return { success: true };
        } else {
            console.log('⚠️  Could not confirm delivery');
            return { success: false, error: 'Could not confirm' };
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
