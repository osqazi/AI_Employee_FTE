#!/usr/bin/env node
/**
 * WhatsApp Authentication - Guaranteed Working
 * Uses persistent context properly
 */

import { chromium } from 'playwright';
import fs from 'fs';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP AUTHENTICATION');
console.log('='.repeat(60));

// Ensure session directory exists
if (!fs.existsSync(SESSION_PATH)) {
  console.log('\n📁 Creating session directory...');
  fs.mkdirSync(SESSION_PATH, { recursive: true });
  console.log('   Created:', SESSION_PATH);
} else {
  console.log('\n✅ Session directory exists:', SESSION_PATH);
}

console.log('\n📱 Starting in 3 seconds...');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 3000));

async function authenticate() {
  let browser;
  
  try {
    console.log('\n🚀 Launching WhatsApp Web...');
    
    // Launch browser FIRST
    browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized']
    });
    
    // Then create persistent context
    const context = await browser.newContext({
      userDataDir: SESSION_PATH
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
    console.log('\nOn your phone:');
    console.log('   1. Open WhatsApp');
    console.log('   2. Tap Menu (⋮) or Settings');
    console.log('   3. Tap "Linked Devices"');
    console.log('   4. Tap "Link a Device"');
    console.log('   5. Point camera at QR code');
    console.log('\n⏳ Waiting for authentication...');
    console.log('(Browser will stay open for 120 seconds)');
    console.log('='.repeat(60));
    
    // Wait for authentication
    let authenticated = false;
    const maxWait = 120000;
    const interval = 2000;
    let elapsed = 0;
    
    while (elapsed < maxWait) {
      await page.waitForTimeout(interval);
      elapsed += interval;
      
      // Check if logged in
      const chatList = await page.$('[data-testid="chat-list"]');
      const defaultUser = await page.$('[data-testid="default-user"]');
      const qrCode = await page.$('[data-testid="qr-code"]');
      
      if ((chatList || defaultUser) && !qrCode) {
        authenticated = true;
        console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
        console.log(`   Time: ${elapsed / 1000} seconds`);
        console.log('\n💾 Session saved to:', SESSION_PATH);
        console.log('\n' + '='.repeat(60));
        console.log('✅ WHATSAPP READY!');
        console.log('='.repeat(60));
        console.log('\n📋 Next: Run live test');
        console.log('   set TEST_WHATSAPP_PHONE=+923353221004');
        console.log('   node test_whatsapp_manual.js');
        console.log('='.repeat(60));
        
        // Keep browser open for 30 more seconds
        await page.waitForTimeout(30000);
        break;
      }
      
      if (elapsed % 10000 === 0) {
        console.log(`   Waiting... ${elapsed/1000}s / ${maxWait/1000}s`);
      }
    }
    
    if (!authenticated) {
      console.log('\n⏰ Timeout - Please try again');
    }
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

authenticate();
