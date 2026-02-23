#!/usr/bin/env node
/**
 * WhatsApp Web Authentication Script
 * 
 * Authenticates with WhatsApp Web and saves session for future use.
 * 
 * Usage: node authenticate_whatsapp.js
 * 
 * Process:
 * 1. Browser opens WhatsApp Web
 * 2. QR code appears
 * 3. Scan QR with WhatsApp mobile app
 * 4. Session saved to whatsapp_session/
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SESSION_PATH = path.join(process.cwd(), 'whatsapp_session');

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP WEB AUTHENTICATION');
console.log('Gold Tier - Personal AI Employee');
console.log('='.repeat(60));

console.log('\n📱 This script will:');
console.log('   1. Open WhatsApp Web in browser');
console.log('   2. Display QR code');
console.log('   3. Wait for you to scan with WhatsApp mobile app');
console.log('   4. Save session for future use');

console.log('\n📋 Before you start:');
console.log('   - Have your phone with WhatsApp app ready');
console.log('   - Make sure you\'re logged into WhatsApp on your phone');
console.log('   - Keep the browser window open until authenticated');

console.log('\n' + '='.repeat(60));
console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
console.log('='.repeat(60));

// Wait 5 seconds before starting
await new Promise(resolve => setTimeout(resolve, 5000));

async function authenticate() {
  let browser;
  
  try {
    console.log('\n🚀 Launching browser...');
    
    browser = await chromium.launch({
      headless: false, // Must be visible for QR scanning
      args: ['--start-maximized']
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('\n📱 Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com', { waitUntil: 'networkidle' });
    
    console.log('\n' + '='.repeat(60));
    console.log('📲 SCAN QR CODE NOW!');
    console.log('='.repeat(60));
    console.log('\nOn your phone:');
    console.log('   1. Open WhatsApp');
    console.log('   2. Tap Menu (⋮) or Settings');
    console.log('   3. Tap "Linked Devices"');
    console.log('   4. Tap "Link a Device"');
    console.log('   5. Point camera at QR code on screen');
    console.log('\nWaiting for authentication...');
    console.log('(Timeout: 120 seconds)');
    console.log('='.repeat(60));
    
    // Wait for authentication (check for inbox)
    let authenticated = false;
    const maxWaitTime = 120000; // 2 minutes
    const checkInterval = 2000; // 2 seconds
    let elapsed = 0;
    
    while (elapsed < maxWaitTime) {
      await page.waitForTimeout(checkInterval);
      elapsed += checkInterval;
      
      // Check if logged in (inbox visible)
      const isInbox = await page.$('[data-testid="default-user"]');
      
      if (isInbox) {
        authenticated = true;
        console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
        console.log(`   Time: ${elapsed / 1000} seconds`);
        break;
      }
      
      // Show progress every 10 seconds
      if (elapsed % 10000 === 0) {
        console.log(`   Still waiting... ${elapsed / 1000}s / ${maxWaitTime / 1000}s`);
      }
    }
    
    if (authenticated) {
      // Save session
      console.log('\n💾 Saving session...');
      
      const storageState = await context.storageState();
      
      // Ensure directory exists
      if (!fs.existsSync(SESSION_PATH)) {
        fs.mkdirSync(SESSION_PATH, { recursive: true });
      }
      
      // Save session
      const sessionFile = path.join(SESSION_PATH, 'whatsapp_session.json');
      fs.writeFileSync(sessionFile, JSON.stringify(storageState, null, 2));
      
      console.log(`   Session saved to: ${sessionFile}`);
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ WHATSAPP AUTHENTICATION COMPLETE!');
      console.log('='.repeat(60));
      console.log('\n📋 Next Steps:');
      console.log('   1. Set test phone number:');
      console.log('      set TEST_WHATSAPP_PHONE=+1234567890');
      console.log('   2. Run live test:');
      console.log('      node test_whatsapp.js');
      console.log('='.repeat(60));
      
      return true;
    } else {
      console.log('\n❌ AUTHENTICATION TIMEOUT');
      console.log('   Please try again.');
      console.log('   Make sure you scanned the QR code correctly.');
      return false;
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    return false;
    
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
    }
  }
}

// Run authentication
authenticate().then(success => {
  process.exit(success ? 0 : 1);
});
