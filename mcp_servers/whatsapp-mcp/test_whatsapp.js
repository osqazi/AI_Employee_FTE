#!/usr/bin/env node
/**
 * WhatsApp Live Test Script
 * 
 * Tests WhatsApp message sending via WhatsApp Web automation.
 * Requires WhatsApp Web session (QR code authentication).
 * 
 * Usage: node test_whatsapp.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

// Configuration
const SESSION_PATH = path.join(process.cwd(), 'whatsapp_session');
const TEST_PHONE = process.env.TEST_WHATSAPP_PHONE || ''; // Set your test phone number
const TEST_MESSAGE = '🧪 Gold Tier Live Test - WhatsApp Integration - Personal AI Employee Hackathon 0 - ' + new Date().toISOString();

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP LIVE TEST');
console.log('Gold Tier - Personal AI Employee');
console.log('='.repeat(60));

// Check if session exists
const sessionExists = fs.existsSync(SESSION_PATH);

console.log('\n📱 WhatsApp Web Session:');
console.log(`   Session Path: ${SESSION_PATH}`);
console.log(`   Session Status: ${sessionExists ? '✅ EXISTS' : '❌ NOT FOUND'}`);
console.log(`   Test Phone: ${TEST_PHONE || 'NOT CONFIGURED'}`);

if (!sessionExists) {
  console.log('\n⚠️  WHATSAPP SESSION NOT FOUND');
  console.log('\n📋 Setup Instructions:');
  console.log('   1. Run WhatsApp Web authentication first:');
  console.log('      node authenticate_whatsapp.js');
  console.log('   2. Scan QR code with your WhatsApp mobile app');
  console.log('   3. Session will be saved to:', SESSION_PATH);
  console.log('   4. Set TEST_WHATSAPP_PHONE environment variable:');
  console.log('      set TEST_WHATSAPP_PHONE=+1234567890');
  console.log('   5. Run this test again');
  
  console.log('\n' + '='.repeat(60));
  console.log('STATUS: ⏳ AWAITING WHATSAPP SESSION SETUP');
  console.log('='.repeat(60));
  process.exit(0);
}

if (!TEST_PHONE) {
  console.log('\n⚠️  TEST PHONE NOT CONFIGURED');
  console.log('\n📋 Set test phone number:');
  console.log('   set TEST_WHATSAPP_PHONE=+1234567890');
  console.log('\n   Use your own number or a test number.');
  
  console.log('\n' + '='.repeat(60));
  console.log('STATUS: ⏳ AWAITING TEST PHONE CONFIGURATION');
  console.log('='.repeat(60));
  process.exit(0);
}

async function testWhatsAppSend() {
  let browser;
  
  try {
    console.log('\n🚀 Starting WhatsApp Web...');
    
    // Launch browser with saved session
    browser = await chromium.launch({
      headless: false, // Show browser for debugging
      args: ['--start-maximized']
    });
    
    const context = await browser.newContext({
      storageState: SESSION_PATH
    });
    
    const page = await context.newPage();
    
    console.log('📱 Navigating to WhatsApp Web...');
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
    
    // Check if already logged in
    const isInbox = await page.$('[data-testid="default-user"]');
    
    if (!isInbox) {
      console.log('\n❌ NOT LOGGED IN');
      console.log('   Session may have expired.');
      console.log('   Please re-authenticate:');
      console.log('   node authenticate_whatsapp.js');
      
      // Wait for user to scan QR
      console.log('\n📱 Scan QR code with WhatsApp mobile app...');
      console.log('   (Waiting 60 seconds)');
      
      await page.waitForTimeout(60000);
    }
    
    console.log('\n✅ WhatsApp Web loaded');
    
    // Search for contact
    console.log(`\n🔍 Searching for contact: ${TEST_PHONE}`);
    
    // Click on search box
    await page.click('[role="searchbox"]');
    await page.keyboard.type(TEST_PHONE);
    await page.waitForTimeout(2000);
    
    // Click on first result
    await page.keyboard.press('Enter');
    await page.waitForTimeout(2000);
    
    // Type message
    console.log('\n✏️  Typing message...');
    const messageBox = await page.$('[data-testid="textbox"]');
    if (!messageBox) {
      throw new Error('Message input box not found');
    }
    
    await messageBox.click();
    await page.keyboard.type(TEST_MESSAGE);
    
    // Send message
    console.log('📤 Sending message...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    // Verify message sent (check for checkmarks)
    const sentIndicator = await page.$('[data-testid="msg-time"]');
    
    if (sentIndicator) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ WHATSAPP MESSAGE SENT SUCCESSFULLY!');
      console.log('='.repeat(60));
      console.log(`   Recipient: ${TEST_PHONE}`);
      console.log(`   Message: ${TEST_MESSAGE.substring(0, 50)}...`);
      console.log(`   Time: ${new Date().toISOString()}`);
      console.log('='.repeat(60));
      
      return { success: true, message: TEST_MESSAGE };
    } else {
      throw new Error('Message sent confirmation not found');
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
      await browser.close();
    }
  }
}

// Run test
testWhatsAppSend().then(result => {
  if (result.success) {
    console.log('\n🎉 TEST PASSED!');
    process.exit(0);
  } else {
    console.log('\n❌ TEST FAILED');
    process.exit(1);
  }
});
