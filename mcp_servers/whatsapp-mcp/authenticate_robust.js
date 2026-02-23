#!/usr/bin/env node
/**
 * WhatsApp Web Authentication - Robust Version
 * 
 * Authenticates with WhatsApp Web and saves session for future use.
 * 
 * Usage: node authenticate_robust.js
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

// Use absolute path to project root
const PROJECT_ROOT = 'D:\\Projects\\hackathon\\ai-assist-fte';
const SESSION_PATH = path.join(PROJECT_ROOT, 'whatsapp_session');

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP WEB AUTHENTICATION (Robust)');
console.log('Gold Tier - Personal AI Employee');
console.log('='.repeat(60));

console.log('\n📋 This script will:');
console.log('   1. Open WhatsApp Web in browser');
console.log('   2. Display QR code');
console.log('   3. Wait for you to scan with WhatsApp mobile app');
console.log('   4. Save session for future use');

console.log('\n📱 Before you start:');
console.log('   - Have your phone with WhatsApp app ready');
console.log('   - Make sure you\'re logged into WhatsApp on your phone');
console.log('   - Keep the browser window open until authenticated');

console.log('\n' + '='.repeat(60));
console.log('Starting in 3 seconds...');
console.log('='.repeat(60));

// Wait 3 seconds before starting
await new Promise(resolve => setTimeout(resolve, 3000));

async function authenticate() {
  let browser;
  
  try {
    console.log('\n🚀 Launching browser...');
    
    browser = await chromium.launch({
      headless: false, // Must be visible for QR scanning
      args: ['--start-maximized', '--disable-gpu']
    });
    
    const context = await browser.newContext({
      userDataDir: SESSION_PATH,
      viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    console.log('\n📱 Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
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
      
      // Check if logged in (multiple indicators)
      const chatList = await page.$('[data-testid="chat-list"]');
      const defaultUser = await page.$('[data-testid="default-user"]');
      const searchBar = await page.$('input[aria-label="Search or start new chat"]');
      const pageTitle = await page.title();
      
      // Also check if we're past the login screen
      const qrCode = await page.$('[data-testid="qr-code"]');
      
      if ((chatList || defaultUser || searchBar) && !qrCode) {
        authenticated = true;
        console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
        console.log(`   Time: ${elapsed / 1000} seconds`);
        console.log(`   Detected: ${chatList ? 'Chat List' : defaultUser ? 'Default User' : 'Search Bar'}`);
        break;
      }
      
      // If QR code disappeared, we're likely logged in
      if (!qrCode && elapsed > 30000) {
        authenticated = true;
        console.log('\n✅ AUTHENTICATION SUCCESSFUL! (QR code disappeared)');
        console.log(`   Time: ${elapsed / 1000} seconds`);
        break;
      }
      
      // Show progress every 10 seconds
      if (elapsed % 10000 === 0) {
        console.log(`   Still waiting... ${elapsed / 1000}s / ${maxWaitTime / 1000}s`);
      }
    }
    
    if (authenticated) {
      // Wait a bit for session to fully save
      console.log('\n💾 Saving session...');
      await page.waitForTimeout(5000);
      
      console.log(`   Session saved to: ${SESSION_PATH}`);
      
      console.log('\n' + '='.repeat(60));
      console.log('✅ WHATSAPP AUTHENTICATION COMPLETE!');
      console.log('='.repeat(60));
      console.log('\n📋 Next Steps:');
      console.log('   1. Set test phone number:');
      console.log('      set TEST_WHATSAPP_PHONE=+923353221004');
      console.log('   2. Run live test:');
      console.log('      node test_whatsapp_fixed.js');
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
    console.log('\n📋 Troubleshooting:');
    console.log('   - Make sure you have internet connection');
    console.log('   - Try closing other browser windows');
    console.log('   - Make sure QR code is visible and scan again');
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
