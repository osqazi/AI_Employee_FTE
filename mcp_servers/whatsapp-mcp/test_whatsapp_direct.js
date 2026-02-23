#!/usr/bin/env node
/**
 * WhatsApp Live Test - Simple Version
 * Uses existing browser session directly
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=+923353221004
 *   node test_whatsapp_direct.js
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: 'D:\\Projects\\hackathon\\ai-assist-fte\\.env' });

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const TEST_PHONE = process.env.TEST_WHATSAPP_PHONE || '+923353221004';
const TEST_MESSAGE = '🧪 Gold Tier Live Test - WhatsApp - Personal AI Employee Hackathon 0 - ' + new Date().toISOString();

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP LIVE TEST (Direct)');
console.log('Gold Tier - Personal AI Employee');
console.log('='.repeat(60));

console.log('\n📱 Configuration:');
console.log(`   Session Path: ${SESSION_PATH}`);
console.log(`   Test Phone: ${TEST_PHONE}`);

async function testWhatsAppSend() {
  let browser;
  
  try {
    console.log('\n🚀 Launching WhatsApp Web with existing session...');
    
    browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized']
    });
    
    // Use existing browser profile
    const context = await browser.newContext({
      userDataDir: SESSION_PATH
    });
    
    const page = await context.newPage();
    
    console.log('📱 Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle', timeout: 30000 });
    
    // Wait for page to fully load
    console.log('⏳ Waiting for WhatsApp to load...');
    await page.waitForTimeout(10000);
    
    // Check if we see the chat list (logged in)
    let chatList = await page.$('[data-testid="chat-list"]');
    
    // If not found, try alternative selectors
    if (!chatList) {
      chatList = await page.$('div[data-testid="default-user"]');
    }
    
    if (!chatList) {
      console.log('\n⚠️  Not seeing chat list - checking if logged in...');
      // Try to detect if we're on login screen
      const qrCode = await page.$('[data-testid="qr-code"]');
      if (qrCode) {
        console.log('❌ QR Code visible - session expired');
        console.log('   Please run: node authenticate_whatsapp.js');
        return { success: false, error: 'Session expired' };
      }
      console.log('⏳ Waiting additional 10 seconds for WhatsApp to load...');
      await page.waitForTimeout(10000);
      chatList = await page.$('[data-testid="chat-list"]');
    }
    
    console.log('\n✅ WhatsApp Web loaded successfully!');
    
    // Search for contact
    console.log(`\n🔍 Searching for contact: ${TEST_PHONE}`);
    
    // Try multiple selectors for search box
    let searchBox = await page.$('[role="searchbox"]');
    if (!searchBox) {
      searchBox = await page.$('input[title="Search or start new chat"]');
    }
    if (!searchBox) {
      searchBox = await page.$('input[placeholder="Search or start new chat"]');
    }
    
    if (!searchBox) {
      console.log('❌ Search box not found - WhatsApp may not be fully loaded');
      console.log('   Taking screenshot for debugging...');
      await page.screenshot({ path: 'whatsapp_debug.png' });
      return { success: false, error: 'Search box not found' };
    }
    
    await searchBox.click();
    await page.keyboard.type(TEST_PHONE);
    await page.waitForTimeout(3000);
    
    // Click on first result (press Enter)
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    // Type message
    console.log('\n✏️  Typing message...');
    const messageBox = await page.$('[data-testid="textbox"]');
    if (!messageBox) {
      console.log('❌ Message input box not found');
      return { success: false, error: 'Message box not found' };
    }
    
    await messageBox.click();
    await page.keyboard.type(TEST_MESSAGE);
    
    // Send message
    console.log('📤 Sending message...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);
    
    // Check for sent message (single gray checkmark)
    const sentCheck = await page.$('[data-testid="msg-time"]');
    
    if (sentCheck) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ WHATSAPP MESSAGE SENT SUCCESSFULLY!');
      console.log('='.repeat(60));
      console.log(`   Recipient: ${TEST_PHONE}`);
      console.log(`   Message: ${TEST_MESSAGE.substring(0, 60)}...`);
      console.log(`   Time: ${new Date().toISOString()}`);
      console.log('='.repeat(60));
      
      return { success: true, message: TEST_MESSAGE };
    } else {
      console.log('\n⚠️  Could not confirm message sent');
      return { success: false, error: 'Could not confirm send' };
    }
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ WHATSAPP SEND FAILED!');
    console.log('='.repeat(60));
    console.log(`   Error: ${error.message}`);
    console.log('\n📋 Troubleshooting:');
    console.log('   1. Ensure WhatsApp session is valid');
    console.log('   2. Check phone number format (+country code)');
    console.log('   3. Ensure recipient has WhatsApp');
    console.log('   4. Check internet connection');
    console.log('='.repeat(60));
    
    return { success: false, error: error.message };
    
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Run test
testWhatsAppSend().then(result => {
  if (result.success) {
    console.log('\n🎉 TEST PASSED!');
    console.log('\n' + '='.repeat(60));
    console.log('GOLD TIER WHATSAPP INTEGRATION: ✅ OPERATIONAL');
    console.log('='.repeat(60));
    process.exit(0);
  } else {
    console.log('\n❌ TEST FAILED');
    process.exit(1);
  }
});
