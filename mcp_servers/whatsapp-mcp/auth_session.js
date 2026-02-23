#!/usr/bin/env node
/**
 * WhatsApp Session Authentication
 * Silver Tier Approach - Simple & Working
 * 
 * This uses Playwright's persistent context exactly like Silver Tier
 * 
 * Usage: node auth_session.js
 */

import { chromium } from 'playwright';
import fs from 'fs';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP SESSION AUTHENTICATION');
console.log('Silver Tier Approach');
console.log('='.repeat(60));

// Check if session directory exists
if (fs.existsSync(SESSION_PATH)) {
  const files = fs.readdirSync(SESSION_PATH);
  console.log('\n📁 Session directory exists:', SESSION_PATH);
  console.log('   Files:', files.length);
  if (files.length > 0) {
    console.log('   ✅ Session files found - WhatsApp already authenticated!');
    console.log('\n📋 To test:');
    console.log('   set TEST_WHATSAPP_PHONE=+923353221004');
    console.log('   node test_whatsapp_manual.js');
    process.exit(0);
  }
} else {
  console.log('\n📁 Creating session directory...');
  fs.mkdirSync(SESSION_PATH, { recursive: true });
}

console.log('\n📱 Starting in 5 seconds...');
console.log('='.repeat(60));
console.log('\n📋 On your phone:');
console.log('   1. Open WhatsApp');
console.log('   2. Tap Menu (⋮) or Settings');
console.log('   3. Tap "Linked Devices"');
console.log('   4. Be ready to tap "Link a Device"');
console.log('\n⏳ Scan QR code when browser opens...');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 5000));

async function authenticate() {
  let browser;
  
  try {
    console.log('\n🚀 Launching browser with persistent session...');
    
    // Launch browser with persistent context (Silver Tier approach)
    browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized']
    });
    
    // Create persistent context - this saves session automatically
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
    
    console.log('\n' + '='.repeat(60));
    console.log('📲 SCAN QR CODE NOW!');
    console.log('='.repeat(60));
    console.log('\n⏳ Browser will stay open for 2 minutes...');
    console.log('   1. Tap "Link a Device" on phone');
    console.log('   2. Scan QR code on screen');
    console.log('   3. Wait for chat list to appear');
    console.log('   4. Session will auto-save');
    console.log('='.repeat(60));
    
    // Wait for authentication
    let authenticated = false;
    const maxWait = 120000;
    const interval = 2000;
    let elapsed = 0;
    
    while (elapsed < maxWait) {
      await page.waitForTimeout(interval);
      elapsed += interval;
      
      // Check multiple indicators of being logged in
      const chatList = await page.$('[data-testid="chat-list"]');
      const defaultUser = await page.$('[data-testid="default-user"]');
      const searchBar = await page.$('input[aria-label="Search or start new chat"]');
      const searchBox = await page.$('div[role="searchbox"]');
      const qrCode = await page.$('[data-testid="qr-code"]');
      
      // Multiple success indicators
      const isLoggedIn = chatList || defaultUser || searchBar || searchBox;
      const noQR = !qrCode;
      
      if (isLoggedIn && noQR) {
        authenticated = true;
        console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
        console.log(`   Time: ${elapsed / 1000} seconds`);
        console.log(`   Detected: ${chatList ? 'Chat List' : defaultUser ? 'Default User' : searchBar ? 'Search Bar' : 'Search Box'}`);
        console.log('\n💾 Session saved to:', SESSION_PATH);
        
        // Wait a bit more to ensure session fully saves
        await page.waitForTimeout(10000);
        
        console.log('\n' + '='.repeat(60));
        console.log('✅ WHATSAPP READY!');
        console.log('='.repeat(60));
        console.log('\n📋 To test:');
        console.log('   set TEST_WHATSAPP_PHONE=+923353221004');
        console.log('   node test_whatsapp_manual.js');
        console.log('='.repeat(60));
        
        break;
      }
      
      // Also check if QR disappeared (indicates successful auth)
      if (noQR && elapsed > 30000) {
        authenticated = true;
        console.log('\n✅ AUTHENTICATION SUCCESSFUL! (QR code disappeared)');
        console.log(`   Time: ${elapsed / 1000} seconds`);
        console.log('\n💾 Session saved to:', SESSION_PATH);
        await page.waitForTimeout(10000);
        break;
      }
      
      if (elapsed % 10000 === 0) {
        console.log(`   Waiting... ${elapsed/1000}s / ${maxWait/1000}s`);
        console.log(`   QR Code visible: ${qrCode ? 'Yes' : 'No'}`);
      }
    }
    
    if (!authenticated) {
      console.log('\n⏰ Timeout - Please try again');
      console.log('   Make sure to scan QR code promptly');
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
    }
  }
}

authenticate();
