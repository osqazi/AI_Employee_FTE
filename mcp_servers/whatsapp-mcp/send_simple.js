#!/usr/bin/env node
/**
 * WhatsApp Send Test - SIMPLIFIED & RELIABLE
 * Uses better focus management
 * 
 * Usage: node send_simple.js
 */

import { chromium } from 'playwright';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const TEST_PHONE = '923353221004';  // Without +
const TEST_MESSAGE = `Test ${new Date().toLocaleTimeString()}`;

console.log('='.repeat(60));
console.log('WHATSAPP SEND - SIMPLE & RELIABLE');
console.log('='.repeat(60));
console.log('To:', TEST_PHONE);
console.log('Message:', TEST_MESSAGE);
console.log('\nStarting...\n');

async function sendSimple() {
    let context;
    
    try {
        // Launch persistent browser
        context = await chromium.launchPersistentContext(SESSION_PATH, {
            headless: false,
            args: ['--start-maximized'],
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = context.pages()[0];
        
        // Open WhatsApp
        console.log('📱 Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);
        
        // Check login
        const qrCode = await page.$('div[data-testid="qr-code"]');
        if (qrCode) {
            console.log('❌ Not logged in! Run: node auth_save_session.js');
            return { success: false };
        }
        console.log('✅ Logged in\n');
        
        // STEP 1: Click on search box explicitly
        console.log('🔍 Step 1: Clicking search box...');
        
        // Try to find and click the search input
        const searchInput = await page.$('input[aria-label="Search or start new chat"]');
        if (searchInput) {
            await searchInput.click();
            console.log('   ✅ Search box clicked');
        } else {
            // Fallback: Click on the searchbox div
            const searchBox = await page.$('div[role="searchbox"]');
            if (searchBox) {
                await searchBox.click();
                console.log('   ✅ Searchbox div clicked');
            } else {
                // Last resort: keyboard shortcut
                await page.keyboard.press('Control+f');
                console.log('   ⌨️  Used Ctrl+F');
            }
        }
        await page.waitForTimeout(1000);
        
        // STEP 2: Clear and type phone number
        console.log('\n📞 Step 2: Typing phone number...');
        
        // Clear any existing text
        await page.keyboard.press('Control+a');
        await page.waitForTimeout(300);
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(300);
        
        // Type phone number character by character
        console.log('   Typing:', TEST_PHONE);
        for (let i = 0; i < TEST_PHONE.length; i++) {
            await page.keyboard.type(TEST_PHONE[i]);
            await page.waitForTimeout(100);  // Slow typing
        }
        await page.waitForTimeout(3000);
        
        // Take screenshot to verify
        const searchShot = path.join(SESSION_PATH, 'search_verify.png');
        await page.screenshot({ path: searchShot });
        console.log('   📸 Screenshot:', searchShot);
        console.log('   ✅ Phone number typed\n');
        
        // STEP 3: Select the first contact from search results
        console.log('👤 Step 3: Selecting contact...');
        
        // Wait for search results to appear
        await page.waitForTimeout(2000);
        
        // Try clicking the first search result
        const firstResult = await page.$('div[role="row"]:first-child');
        if (firstResult) {
            await firstResult.click();
            console.log('   ✅ First result clicked');
        } else {
            // Fallback: press Enter
            await page.keyboard.press('Enter');
            console.log('   ⌨️  Pressed Enter');
        }
        await page.waitForTimeout(5000);  // Wait for chat to load
        
        // Screenshot
        const chatShot = path.join(SESSION_PATH, 'chat_loaded.png');
        await page.screenshot({ path: chatShot });
        console.log('   📸 Screenshot:', chatShot);
        console.log('   ✅ Chat loaded\n');
        
        // STEP 4: Find and click message box
        console.log('✏️  Step 4: Finding message box...');
        
        // Wait for message box to be available
        await page.waitForTimeout(2000);
        
        // Look for message box in footer
        const textBox = await page.$('footer div[contenteditable="true"]');
        if (textBox) {
            await textBox.click();
            console.log('   ✅ Message box clicked');
        } else {
            // Try generic selector
            const generic = await page.$('div[contenteditable="true"][role="textbox"]');
            if (generic) {
                await generic.click();
                console.log('   ✅ Generic textbox clicked');
            } else {
                console.log('   ❌ Message box not found');
                return { success: false };
            }
        }
        await page.waitForTimeout(1000);
        
        // STEP 5: Clear and type message
        console.log('\n📝 Step 5: Typing message...');
        
        // Clear any text (important - search text might still be there)
        await page.keyboard.press('Control+a');
        await page.waitForTimeout(300);
        await page.keyboard.press('Backspace');
        await page.waitForTimeout(500);
        
        // Type message
        console.log('   Message:', TEST_MESSAGE);
        await page.keyboard.type(TEST_MESSAGE);
        await page.waitForTimeout(1000);
        
        // Screenshot before send
        const beforeShot = path.join(SESSION_PATH, 'before_send.png');
        await page.screenshot({ path: beforeShot });
        console.log('   📸 Screenshot:', beforeShot);
        
        // STEP 6: Send
        console.log('\n📤 Step 6: Sending message...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(8000);
        
        // Final screenshot
        const finalShot = path.join(SESSION_PATH, 'after_send.png');
        await page.screenshot({ path: finalShot });
        console.log('   📸 Screenshot:', finalShot);
        
        // Check for sent message
        const msgTime = await page.$('[data-testid="msg-time"]');
        const checks = await page.$('[data-icon="msg-check"]');
        
        console.log('\n' + '='.repeat(60));
        if (msgTime || checks) {
            console.log('✅ MESSAGE SENT SUCCESSFULLY!');
            console.log('   To:', TEST_PHONE);
            console.log('   Message:', TEST_MESSAGE);
            console.log('='.repeat(60));
            return { success: true };
        } else {
            console.log('⚠️  Check screenshot to verify:');
            console.log('   ' + finalShot);
            console.log('='.repeat(60));
            return { success: false };
        }
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
        return { success: false, error: error.message };
    } finally {
        if (context) {
            await context.close();
        }
    }
}

sendSimple().then(r => process.exit(r.success ? 0 : 1));
