#!/usr/bin/env node
/**
 * WhatsApp Send Message - STEP BY STEP with Screenshots
 * Shows exactly what's happening at each step
 * 
 * Usage: node send_debug.js
 */

import { chromium } from 'playwright';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const TEST_PHONE = '+923353221004';
const TEST_MESSAGE = `Test ${new Date().toLocaleTimeString()}`;

console.log('='.repeat(60));
console.log('WHATSAPP SEND - DEBUG MODE');
console.log('='.repeat(60));

async function sendDebug() {
    let context;
    
    try {
        // Launch persistent browser
        context = await chromium.launchPersistentContext(SESSION_PATH, {
            headless: false,
            args: ['--start-maximized'],
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = context.pages()[0] || await context.newPage();
        
        // Step 1: Open WhatsApp
        console.log('\n[Step 1] Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
        await page.waitForTimeout(5000);
        
        // Screenshot
        await page.screenshot({ path: path.join(SESSION_PATH, 'step1_loaded.png') });
        console.log('   📸 Screenshot: step1_loaded.png');
        
        // Check login
        const qrCode = await page.$('div[data-testid="qr-code"]');
        if (qrCode) {
            console.log('   ❌ QR Code visible - NOT LOGGED IN');
            console.log('   Run: node auth_save_session.js');
            return { success: false };
        }
        console.log('   ✅ Logged in (no QR code)');
        
        // Step 2: Click search
        console.log('\n[Step 2] Activating search...');
        await page.keyboard.press('Control+f');
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(SESSION_PATH, 'step2_search.png') });
        console.log('   📸 Screenshot: step2_search.png');
        console.log('   ✅ Search activated');
        
        // Step 3: Type phone number
        console.log('\n[Step 3] Typing phone number...');
        await page.keyboard.type(TEST_PHONE);
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(SESSION_PATH, 'step3_phone.png') });
        console.log('   📸 Screenshot: step3_phone.png');
        console.log('   ✅ Phone typed');
        
        // Step 4: Select contact
        console.log('\n[Step 4] Selecting contact...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        await page.screenshot({ path: path.join(SESSION_PATH, 'step4_contact.png') });
        console.log('   📸 Screenshot: step4_contact.png');
        
        // Step 5: Find message box
        console.log('\n[Step 5] Finding message box...');
        const textBoxes = await page.$$('div[contenteditable="true"][data-tab="10"]');
        console.log('   Found', textBoxes.length, 'message boxes');
        
        if (textBoxes.length > 0) {
            await textBoxes[textBoxes.length - 1].click();
            await page.waitForTimeout(1000);
            console.log('   ✅ Message box clicked');
        } else {
            console.log('   ⚠️  Message box not found, trying generic...');
            const generic = await page.$$('div[contenteditable="true"]');
            if (generic.length > 0) {
                await generic[generic.length - 1].click();
                await page.waitForTimeout(1000);
                console.log('   ✅ Generic box clicked');
            }
        }
        
        // Step 6: Type message
        console.log('\n[Step 6] Typing message...');
        await page.keyboard.type(TEST_MESSAGE);
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SESSION_PATH, 'step6_typed.png') });
        console.log('   📸 Screenshot: step6_typed.png');
        console.log('   ✅ Message typed:', TEST_MESSAGE);
        
        // Step 7: Send
        console.log('\n[Step 7] Sending message...');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: path.join(SESSION_PATH, 'step7_sent.png') });
        console.log('   📸 Screenshot: step7_sent.png');
        console.log('   ✅ Enter pressed');
        
        // Check for sent message
        const msgTime = await page.$('[data-testid="msg-time"]');
        const checks = await page.$('[data-icon="msg-check"]');
        
        console.log('\n[Step 8] Verifying...');
        if (msgTime) {
            console.log('   ✅ Message time found - SENT!');
        } else if (checks) {
            console.log('   ✅ Checkmarks found - SENT!');
        } else {
            console.log('   ⚠️  Could not confirm, check screenshots');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('DONE! Check screenshots in:');
        console.log(SESSION_PATH);
        console.log('='.repeat(60));
        
        return { success: true };
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
        return { success: false, error: error.message };
    } finally {
        if (context) {
            await context.close();
        }
    }
}

sendDebug().then(r => process.exit(r.success ? 0 : 1));
