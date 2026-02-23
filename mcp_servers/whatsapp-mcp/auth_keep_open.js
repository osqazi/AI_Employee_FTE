#!/usr/bin/env node
/**
 * WhatsApp Session Authentication - KEEP BROWSER OPEN
 * Session will be saved to whatsapp_session folder
 * 
 * Usage: node auth_keep_open.js
 */

import { chromium } from 'playwright';
import fs from 'fs';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP SESSION AUTHENTICATION');
console.log('Browser will stay OPEN after login');
console.log('='.repeat(60));

// Ensure session directory exists
if (!fs.existsSync(SESSION_PATH)) {
  console.log('\n📁 Creating session directory...');
  fs.mkdirSync(SESSION_PATH, { recursive: true });
  console.log('   Created:', SESSION_PATH);
} else {
  const files = fs.readdirSync(SESSION_PATH);
  console.log('\n📁 Session directory:', SESSION_PATH);
  console.log('   Current files:', files.length);
}

console.log('\n📱 Starting in 3 seconds...');
console.log('='.repeat(60));
console.log('\n📋 On your phone:');
console.log('   1. Open WhatsApp');
console.log('   2. Tap Menu (⋮) or Settings');
console.log('   3. Tap "Linked Devices"');
console.log('   4. Be ready to tap "Link a Device"');
console.log('\n⏳ Scan QR code when browser opens...');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 3000));

async function authenticate() {
  let browser;
  
  try {
    console.log('\n🚀 Launching browser with persistent session...');
    
    // Launch browser
    browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized', '--disable-gpu']
    });
    
    console.log('✅ Browser launched');
    
    // Create persistent context - this saves session to disk
    console.log('\n📁 Session path:', SESSION_PATH);
    console.log('⏳ Creating persistent context...');
    
    const context = await browser.newContext({
      userDataDir: SESSION_PATH,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    console.log('✅ Context created');
    
    const page = await context.newPage();
    
    console.log('\n📱 Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('✅ WhatsApp Web loaded');
    
    console.log('\n' + '='.repeat(60));
    console.log('📲 SCAN QR CODE NOW!');
    console.log('='.repeat(60));
    console.log('\n⏳ Browser will stay OPEN for 5 minutes...');
    console.log('   1. Tap "Link a Device" on phone');
    console.log('   2. Scan QR code on screen');
    console.log('   3. Wait for chat list to appear');
    console.log('   4. Browser will close automatically after 5 minutes');
    console.log('   (Session will be saved to:', SESSION_PATH, ')');
    console.log('='.repeat(60));
    
    // Wait for authentication
    let authenticated = false;
    const maxWait = 300000; // 5 minutes
    const interval = 2000;
    let elapsed = 0;
    
    while (elapsed < maxWait) {
      await page.waitForTimeout(interval);
      elapsed += interval;
      
      // Check multiple indicators
      const chatList = await page.$('[data-testid="chat-list"]');
      const defaultUser = await page.$('[data-testid="default-user"]');
      const searchBar = await page.$('input[aria-label="Search or start new chat"]');
      const qrCode = await page.$('[data-testid="qr-code"]');
      
      const isLoggedIn = chatList || defaultUser || searchBar;
      const noQR = !qrCode;
      
      if (isLoggedIn && noQR && !authenticated) {
        authenticated = true;
        console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
        console.log(`   Time: ${elapsed / 1000} seconds`);
        console.log(`   Detected: ${chatList ? 'Chat List' : defaultUser ? 'Default User' : 'Search Bar'}`);
        console.log('\n💾 Session will be saved when browser closes...');
        console.log('   Browser will stay open for 5 minutes total');
        console.log('   (or press Ctrl+C to close early)');
      }
      
      if (elapsed % 30000 === 0 && authenticated) {
        console.log(`   Session active... ${elapsed/1000}s / ${maxWait/1000}s`);
      }
    }
    
    console.log('\n\n✅ SESSION SHOULD BE SAVED!');
    console.log('\n📁 Session location:', SESSION_PATH);
    
    // Check if files were created
    if (fs.existsSync(SESSION_PATH)) {
      const files = fs.readdirSync(SESSION_PATH);
      console.log('   Files in session:', files.length);
      if (files.length > 0) {
        console.log('   ✅ Session files created!');
      } else {
        console.log('   ⚠️  Session directory still empty');
      }
    }
    
    console.log('\n📋 To test:');
    console.log('   set TEST_WHATSAPP_PHONE=+923353221004');
    console.log('   node test_whatsapp_manual.js');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    console.log('\n📋 Troubleshooting:');
    console.log('   - Make sure you have internet connection');
    console.log('   - Try closing other Chrome/Edge windows');
    console.log('   - Make sure QR code is visible on screen');
  } finally {
    if (browser) {
      console.log('\n🔒 Closing browser...');
      await browser.close();
      console.log('✅ Browser closed');
    }
  }
}

authenticate();
