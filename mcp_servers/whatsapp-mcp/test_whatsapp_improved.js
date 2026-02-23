#!/usr/bin/env node
/**
 * WhatsApp Live Test - Improved Detection
 * Better selectors and login detection
 * 
 * Usage: 
 *   set TEST_WHATSAPP_PHONE=+923353221004
 *   node test_whatsapp_improved.js
 */

import { chromium } from 'playwright';
import dotenv from 'dotenv';

// Load .env
dotenv.config({ path: 'D:\\Projects\\hackathon\\ai-assist-fte\\.env' });

// Use absolute path to session
const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const TEST_PHONE = process.env.TEST_WHATSAPP_PHONE || '+923353221004';
const TEST_MESSAGE = '🧪 Gold Tier Live Test - WhatsApp - Personal AI Employee Hackathon 0 - ' + new Date().toISOString();

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP LIVE TEST (Improved Detection)');
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
      args: ['--start-maximized', '--disable-gpu']
    });
    
    const context = await browser.newContext({
      userDataDir: SESSION_PATH,
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    console.log('📱 Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com', { 
      waitUntil: 'domcontentloaded', 
      timeout: 30000 
    });
    
    // Wait for WhatsApp to fully load with better detection
    console.log('⏳ Waiting for WhatsApp Web to load...');
    
    try {
      // Wait for any indicator that we're logged in
      await page.waitForFunction(() => {
        return document.querySelector('[data-testid="chat-list"]') ||
               document.querySelector('[data-testid="default-user"]') ||
               document.querySelector('input[aria-label="Search or start new chat"]');
      }, { timeout: 30000 });
      console.log('✅ WhatsApp Web loaded - user is logged in');
    } catch (e) {
      // Check for QR code (not logged in)
      const qrCode = await page.$('[data-testid="qr-code"]');
      if (qrCode) {
        console.log('❌ QR Code visible - session expired');
        console.log('   Please run: node authenticate_robust.js');
        return { success: false, error: 'Session expired' };
      }
      console.log('⚠️  Could not detect login state, but continuing...');
    }
    
    // Additional wait for UI to stabilize
    await page.waitForTimeout(5000);
    
    console.log('\n🔍 Searching for contact: ' + TEST_PHONE);
    
    // Try multiple selectors for search box
    let searchBox;
    const searchSelectors = [
      'div[role="searchbox"]',
      'input[aria-label="Search or start new chat"]',
      'input[title="Search or start new chat"]',
      'input[placeholder="Search or start new chat"]'
    ];
    
    for (const selector of searchSelectors) {
      try {
        searchBox = await page.$(selector);
        if (searchBox) {
          console.log(`   ✓ Found search box: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!searchBox) {
      console.log('   ⚠️  Search box not found, trying keyboard navigation...');
      // Try using keyboard shortcut to focus search
      await page.keyboard.press('Control+KeyF');
      await page.waitForTimeout(1000);
      await page.keyboard.type(TEST_PHONE);
    } else {
      await searchBox.click();
      await page.waitForTimeout(500);
      await page.keyboard.type(TEST_PHONE);
    }
    
    await page.waitForTimeout(3000);
    
    // Press Enter to select contact
    console.log('   Selecting contact...');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);
    
    // Type message
    console.log('\n✏️  Typing message...');
    
    // Find message input box
    let messageBox;
    const messageSelectors = [
      '[data-testid="textbox"]',
      'div[contenteditable="true"][data-tab="10"]',
      'div[role="textbox"][contenteditable="true"]'
    ];
    
    for (const selector of messageSelectors) {
      try {
        messageBox = await page.$(selector);
        if (messageBox) {
          console.log(`   ✓ Found message box: ${selector}`);
          break;
        }
      } catch (e) {
        // Try next selector
      }
    }
    
    if (!messageBox) {
      console.log('   ⚠️  Message box not found, trying direct input...');
      await page.keyboard.type(TEST_MESSAGE);
      await page.waitForTimeout(1000);
      await page.keyboard.press('Enter');
    } else {
      await messageBox.click();
      await page.waitForTimeout(500);
      await page.keyboard.type(TEST_MESSAGE);
      await page.waitForTimeout(1000);
      
      console.log('📤 Sending message...');
      await page.keyboard.press('Enter');
    }
    
    await page.waitForTimeout(5000);
    
    // Check for sent message
    const sentTime = await page.$('[data-testid="msg-time"]');
    const sentCheck = await page.$('[data-icon="checkmark"]');
    
    if (sentTime || sentCheck) {
      console.log('\n' + '='.repeat(60));
      console.log('✅ WHATSAPP MESSAGE SENT SUCCESSFULLY!');
      console.log('='.repeat(60));
      console.log(`   Recipient: ${TEST_PHONE}`);
      console.log(`   Message: ${TEST_MESSAGE.substring(0, 60)}...`);
      console.log(`   Time: ${new Date().toISOString()}`);
      console.log('='.repeat(60));
      
      await page.screenshot({ path: 'whatsapp_success.png' });
      console.log('📸 Screenshot saved: whatsapp_success.png');
      
      return { success: true, message: TEST_MESSAGE };
    } else {
      console.log('\n⚠️  Could not confirm message sent');
      await page.screenshot({ path: 'whatsapp_debug.png' });
      console.log('📸 Debug screenshot saved: whatsapp_debug.png');
      return { success: false, error: 'Could not confirm send' };
    }
    
  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('❌ WHATSAPP SEND FAILED!');
    console.log('='.repeat(60));
    console.log(`   Error: ${error.message}`);
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
