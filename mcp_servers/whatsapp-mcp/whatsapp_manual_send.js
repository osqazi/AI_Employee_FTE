#!/usr/bin/env node
/**
 * WhatsApp Manual Test - Send Message
 * Opens WhatsApp with session and helps you send a test message manually
 * 
 * Usage: node whatsapp_manual_send.js
 */

import { chromium } from 'playwright';
import path from 'path';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const TEST_PHONE = '+923353221004';
const TEST_MESSAGE = `🧪 WhatsApp Watcher Test - Gold Tier Hackathon 0`;

console.log('='.repeat(60));
console.log('WHATSAPP MANUAL SEND TEST');
console.log('='.repeat(60));

console.log('\n📱 This will:');
console.log('   1. Open WhatsApp Web with your saved session');
console.log('   2. You manually send a test message to:', TEST_PHONE);
console.log('   3. Verify WhatsApp Watcher can detect messages');
console.log('\nStarting in 3 seconds...\n');

await new Promise(resolve => setTimeout(resolve, 3000));

async function manualSend() {
    let context;
    
    try {
        console.log('🚀 Launching persistent browser...');
        
        // Use launchPersistentContext to reuse the same browser profile
        context = await chromium.launchPersistentContext(
            SESSION_PATH,
            {
                headless: false,
                args: ['--start-maximized', '--disable-gpu'],
                viewport: { width: 1920, height: 1080 }
            }
        );
        
        const page = context.pages()[0] || await context.newPage();
        
        console.log('📱 Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
        
        await page.waitForTimeout(5000);
        
        // Check login
        const qrCode = await page.$('div[data-testid="qr-code"]');
        if (qrCode) {
            console.log('❌ Not logged in! Run: node auth_save_session.js');
            return;
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ LOGGED IN SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\n📋 MANUAL TEST INSTRUCTIONS');
        console.log('='.repeat(60));
        console.log('\n1. Look at your chat list on the left');
        console.log('2. Click the search box (magnifying glass) at top');
        console.log(`3. Type: ${TEST_PHONE}`);
        console.log('4. Click on the contact when it appears');
        console.log('5. In the message box, type:');
        console.log(`   ${TEST_MESSAGE}`);
        console.log('6. Press Enter to send');
        console.log('7. Watch for checkmarks ✓✓ (message sent)');
        console.log('\n' + '='.repeat(60));
        console.log('Browser is open. Send the message, then:');
        console.log('Press Ctrl+C to close browser');
        console.log('='.repeat(60));
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    }
}

manualSend();
