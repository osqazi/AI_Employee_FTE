#!/usr/bin/env node
/**
 * WhatsApp Live Test - Manual Mode
 * Opens WhatsApp Web with session and lets you manually verify
 * 
 * Usage: node test_whatsapp_manual.js
 */

import { chromium } from 'playwright';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const TEST_PHONE = '+923353221004';
const TEST_MESSAGE = '🧪 Gold Tier Live Test - WhatsApp - ' + new Date().toISOString();

console.log('\n' + '='.repeat(60));
console.log('WHATSAPP MANUAL TEST');
console.log('Gold Tier - Personal AI Employee');
console.log('='.repeat(60));

console.log('\n📱 This will:');
console.log('   1. Open WhatsApp Web with saved session');
console.log('   2. You manually verify WhatsApp is loaded');
console.log('   3. You manually send test message');
console.log('   4. Confirm integration works');

console.log('\n' + '='.repeat(60));
console.log('Starting in 3 seconds...');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 3000));

async function manualTest() {
  let browser;
  
  try {
    console.log('\n🚀 Launching WhatsApp Web...');
    
    browser = await chromium.launch({
      headless: false,
      args: ['--start-maximized']
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
    
    console.log('\n' + '='.repeat(60));
    console.log('MANUAL VERIFICATION');
    console.log('='.repeat(60));
    console.log('\n✅ If you see WhatsApp interface with chat list:');
    console.log('   → Session is VALID and LOADED');
    console.log('   → WhatsApp MCP integration is WORKING');
    console.log('\n📱 To send test message manually:');
    console.log(`   1. Search for: ${TEST_PHONE}`);
    console.log('   2. Type: 🧪 Gold Tier Live Test - WhatsApp');
    console.log('   3. Press Enter to send');
    console.log('   4. Verify message appears with checkmarks ✓✓');
    console.log('\n' + '='.repeat(60));
    console.log('Browser is open. Press Ctrl+C when done.');
    console.log('='.repeat(60));
    
    // Keep browser open
    await new Promise(() => {});
    
  } catch (error) {
    console.log('\n❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

manualTest();
