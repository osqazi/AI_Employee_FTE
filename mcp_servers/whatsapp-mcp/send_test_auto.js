#!/usr/bin/env node
/**
 * Send WhatsApp Test Message - IMPROVED
 * Uses launchPersistentContext and better selectors
 * 
 * Usage: node send_test_auto.js
 */

import { chromium } from 'playwright';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const TEST_PHONE = '+923353221004';
const TEST_MESSAGE = `🧪 Auto Test - Gold Tier - ${new Date().toLocaleString()}`;

console.log('='.repeat(60));
console.log('SEND WHATSAPP TEST MESSAGE - AUTO');
console.log('='.repeat(60));
console.log('\nTo:', TEST_PHONE);
console.log('Message:', TEST_MESSAGE);
console.log('\nStarting...\n');

async function sendTest() {
    let context;
    
    try {
        // Launch with persistent context
        context = await chromium.launchPersistentContext(SESSION_PATH, {
            headless: false,
            args: ['--start-maximized', '--disable-gpu'],
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = context.pages()[0] || await context.newPage();
        
        console.log('📱 Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(8000);
        
        // Check login
        const qrCode = await page.$('div[data-testid="qr-code"]');
        if (qrCode) {
            console.log('❌ Not logged in! Run: node auth_save_session.js');
            return { success: false };
        }
        console.log('✅ Logged in');
        
        // Search for contact
        console.log('\n🔍 Searching for', TEST_PHONE);
        
        // Click on search box area first
        const searchBox = await page.$('div[role="searchbox"]');
        if (searchBox) {
            await searchBox.click();
            await page.waitForTimeout(1000);
            console.log('   ✅ Search box clicked');
        } else {
            // Use keyboard shortcut
            await page.keyboard.press('Control+f');
            await page.waitForTimeout(1000);
            console.log('   ✅ Search activated with Ctrl+F');
        }
        
        // Clear any existing text
        await page.keyboard.press('Control+a');
        await page.waitForTimeout(200);
        await page.keyboard.press('Delete');
        await page.waitForTimeout(200);
        
        // Type phone number SLOWLY
        console.log('   Typing phone number...');
        const phoneDigits = TEST_PHONE.replace('+', '').replace('-', '').replace(' ', '');
        for (const char of phoneDigits) {
            await page.keyboard.type(char);
            await page.waitForTimeout(50);
        }
        await page.waitForTimeout(3000);
        
        // Take screenshot to verify phone number typed
        const searchShot = path.join(SESSION_PATH, 'search_phone.png');
        await page.screenshot({ path: searchShot });
        console.log('   📸 Screenshot:', searchShot);
        console.log('   Typed:', phoneDigits);
        
        // Select contact
        console.log('👤 Selecting contact...');
        await page.waitForTimeout(2000);
        
        // Look for contact in search results
        const contactSelectors = [
            'span[title*="923353221004"]',
            'span:has-text("923353221004")',
            'div[role="row"]:has-text("923353221004")'
        ];
        
        let contactFound = false;
        for (const selector of contactSelectors) {
            const contact = await page.$(selector);
            if (contact) {
                await contact.click();
                console.log('   ✅ Contact clicked');
                contactFound = true;
                break;
            }
        }
        
        // If no contact found, just press Enter to select first result
        if (!contactFound) {
            console.log('   ⚠️  Contact not found by selector, pressing Enter...');
            await page.keyboard.press('Enter');
        }
        
        // Wait for chat to load
        console.log('   Waiting for chat to load...');
        await page.waitForTimeout(5000);
        
        // Screenshot
        const contactShot = path.join(SESSION_PATH, 'contact_selected.png');
        await page.screenshot({ path: contactShot });
        console.log('   📸 Screenshot:', contactShot);
        
        // Find message box
        console.log('✏️  Finding message box...');
        
        // Wait for chat interface to fully load
        await page.waitForTimeout(3000);
        
        // Look for message box in footer
        const messageBoxSelectors = [
            'footer div[contenteditable="true"]',
            'div[contenteditable="true"][data-tab="10"]',
            'div[role="textbox"][contenteditable="true"]'
        ];
        
        let textBox = null;
        for (const selector of messageBoxSelectors) {
            textBox = await page.$(selector);
            if (textBox) {
                console.log('   ✅ Found:', selector);
                break;
            }
        }
        
        // If still not found, try to find ANY contenteditable div
        if (!textBox) {
            console.log('   ⚠️  Standard selectors failed, trying generic...');
            const allEditable = await page.$$('div[contenteditable="true"]');
            if (allEditable.length > 0) {
                textBox = allEditable[allEditable.length - 1];
                console.log('   ✅ Found generic editable div');
            }
        }
        
        if (textBox) {
            // Click on the message box to ensure focus is on chat, not search
            await textBox.click();
            await page.waitForTimeout(2000);
            
            // Clear any existing text (in case search text is still there)
            await page.keyboard.press('Control+a');
            await page.waitForTimeout(200);
            await page.keyboard.press('Delete');
            await page.waitForTimeout(500);
            
            // Type message SLOWLY
            console.log('✏️  Typing message...');
            for (const char of TEST_MESSAGE) {
                await page.keyboard.type(char);
                await page.waitForTimeout(30);
            }
            await page.waitForTimeout(1000);
            
            console.log('📤 Sending...');
            await page.keyboard.press('Enter');
            await page.waitForTimeout(10000);
            
            // Screenshot
            const sentShot = path.join(SESSION_PATH, 'message_sent.png');
            await page.screenshot({ path: sentShot });
            console.log('   📸 Screenshot:', sentShot);
            
            // Check for sent message
            const msgTime = await page.$('[data-testid="msg-time"]');
            const checks = await page.$('[data-icon="msg-check"]');
            
            if (msgTime || checks) {
                console.log('\n✅ MESSAGE SENT SUCCESSFULLY!');
                console.log('   To:', TEST_PHONE);
                console.log('   Message:', TEST_MESSAGE);
                return { success: true };
            } else {
                console.log('\n⚠️  Sent but could not confirm delivery');
                console.log('   Check screenshot:', sentShot);
                return { success: false };
            }
        } else {
            console.log('❌ Message box not found');
            console.log('   Check screenshot: contact_selected.png');
            return { success: false };
        }
        
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        return { success: false, error: error.message };
    } finally {
        if (context) {
            await context.close();
        }
    }
}

sendTest().then(r => process.exit(r.success ? 0 : 1));
