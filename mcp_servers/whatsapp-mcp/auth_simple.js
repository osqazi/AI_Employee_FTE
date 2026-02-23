#!/usr/bin/env node
/**
 * WhatsApp Authentication - Simple Manual Approach
 * Just opens WhatsApp Web and lets you authenticate manually
 * Session is automatically saved by Chromium
 */

import { chromium } from 'playwright';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP AUTHENTICATION - MANUAL MODE');
console.log('Gold Tier - Personal AI Employee');
console.log('='.repeat(60));

console.log('\n📱 Instructions:');
console.log('   1. Browser will open WhatsApp Web');
console.log('   2. Scan QR code with your phone');
console.log('   3. Wait for chat list to appear');
console.log('   4. Close browser when done (session auto-saves)');

console.log('\n📋 On your phone:');
console.log('   • WhatsApp → Menu (⋮) → Linked Devices');
console.log('   • Tap "Link a Device"');
console.log('   • Scan QR code on screen');

console.log('\n' + '='.repeat(60));
console.log('Starting in 3 seconds...');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 3000));

async function authenticate() {
  let browser;
  
  try {
    console.log('\n🚀 Launching browser...');
    
    // Launch browser
    browser = await chromium.launch({
      headless: false,
      args: [
        '--start-maximized',
        '--disable-gpu',
        '--no-sandbox'
      ]
    });
    
    console.log('✅ Browser launched');
    
    // Create persistent context (this saves session automatically)
    console.log('\n📁 Session path:', SESSION_PATH);
    console.log('⏳ Creating persistent session...');
    
    const context = await browser.newContext({
      userDataDir: SESSION_PATH,
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    console.log('✅ Session context created');
    
    const page = await context.newPage();
    
    console.log('\n📱 Opening WhatsApp Web...');
    await page.goto('https://web.whatsapp.com', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    console.log('✅ WhatsApp Web loaded');
    
    console.log('\n' + '='.repeat(60));
    console.log('📲 SCAN THE QR CODE NOW!');
    console.log('='.repeat(60));
    console.log('\n⏳ Browser will stay open for 2 minutes...');
    console.log('   Scan QR code with your phone');
    console.log('   Wait for chat list to appear');
    console.log('   Browser will close automatically after 2 minutes');
    console.log('   (or press Ctrl+C to close early)');
    console.log('='.repeat(60));
    
    // Wait 2 minutes for user to authenticate
    await page.waitForTimeout(120000);
    
    console.log('\n\n✅ SESSION SHOULD BE SAVED!');
    console.log('\n📁 Session location:', SESSION_PATH);
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
    }
  }
}

authenticate();
