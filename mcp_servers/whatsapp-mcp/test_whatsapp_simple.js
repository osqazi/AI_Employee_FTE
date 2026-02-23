#!/usr/bin/env node
/**
 * WhatsApp Live Test Script
 * Uses session from .env WHATSAPP_SESSION_PATH
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=+1234567890
 *   node test_whatsapp_simple.js
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load .env from project root
const envPath = 'D:\\Projects\\hackathon\\ai-assist-fte\\.env';
dotenv.config({ path: envPath, override: true });

// Configuration - use absolute path from .env or default to project root
const SESSION_PATH = process.env.WHATSAPP_SESSION_PATH 
  ? path.resolve('D:\\Projects\\hackathon\\ai-assist-fte', process.env.WHATSAPP_SESSION_PATH.replace('./', ''))
  : 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const TEST_PHONE = process.env.TEST_WHATSAPP_PHONE || '';
const TEST_MESSAGE = '🧪 Gold Tier Live Test - WhatsApp - Personal AI Employee Hackathon 0 - ' + new Date().toISOString();

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP LIVE TEST');
console.log('Gold Tier - Personal AI Employee');
console.log('='.repeat(60));

console.log('\n📱 Configuration:');
console.log(`   Session Path: ${SESSION_PATH}`);
console.log(`   Session Status: ${fs.existsSync(SESSION_PATH) ? '✅ EXISTS' : '❌ NOT FOUND'}`);
console.log(`   Test Phone: ${TEST_PHONE || '❌ NOT CONFIGURED'}`);

if (!fs.existsSync(SESSION_PATH)) {
  console.log('\n❌ ERROR: WhatsApp session not found at:', SESSION_PATH);
  console.log('\nRun authentication first:');
  console.log('   node authenticate_whatsapp.js');
  process.exit(1);
}

if (!TEST_PHONE) {
  console.log('\n❌ ERROR: Test phone not configured');
  console.log('\nSet test phone:');
  console.log('   set TEST_WHATSAPP_PHONE=+1234567890');
  process.exit(1);
}

async function testWhatsAppSend() {
  let browser;
  
  try {
    console.log('\n🚀 Launching WhatsApp Web with saved session...');
    
    browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized']
    });
    
    // Use the session directory as user data dir
    const context = await browser.newContext({
      userDataDir: SESSION_PATH
    });
    
    const page = await context.newPage();
    
    console.log('📱 Navigating to WhatsApp Web...');
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    // Check if logged in
    const isInbox = await page.$('[data-testid="default-user"]');
    
    if (!isInbox) {
      console.log('\n❌ NOT LOGGED IN');
      console.log('   Session may have expired or path is incorrect.');
      console.log('   Please re-authenticate:');
      console.log('   node authenticate_whatsapp.js');
      return { success: false, error: 'Not logged in' };
    }
    
    console.log('\n✅ WhatsApp Web loaded successfully!');
    
    // Search for contact
    console.log(`\n🔍 Searching for contact: ${TEST_PHONE}`);
    
    const searchBox = await page.$('[role="searchbox"]');
    if (!searchBox) {
      throw new Error('Search box not found');
    }
    
    await searchBox.click();
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
    
    // Verify message sent
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
