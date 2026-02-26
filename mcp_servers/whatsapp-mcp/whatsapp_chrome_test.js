#!/usr/bin/env node
/**
 * WhatsApp Test - Using Chrome Browser Profile
 * Uses Chrome's user data directory for more stable session
 * 
 * Usage: node whatsapp_chrome_test.js
 */

const { chromium } = require('playwright');
const path = require('path');

// Use the same session path as auth_save_session.js
const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';

console.log('='.repeat(60));
console.log('WHATSAPP TEST - CHROME PROFILE');
console.log('='.repeat(60));

console.log('\n📱 This will:');
console.log('   1. Open Chrome with persistent profile');
console.log('   2. Load WhatsApp Web');
console.log('   3. Keep session persistent across runs');
console.log('\nStarting in 3 seconds...\n');

await new Promise(resolve => setTimeout(resolve, 3000));

async function testWhatsApp() {
    let context;
    
    try {
        console.log('🚀 Launching Chrome with persistent profile...');
        
        // Use launchPersistentContext with the same session path
        context = await chromium.launchPersistentContext(SESSION_PATH, {
            headless: false,
            args: ['--start-maximized', '--disable-gpu'],
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = context.pages()[0] || await context.newPage();
        
        console.log('📱 Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for page to load (10 seconds)...');
        await page.waitForTimeout(10000);
        
        // Check login status
        const qrCode = await page.$('div[data-testid="qr-code"]');
        const chatList = await page.$('[data-testid="chat-list"]');
        
        console.log('\n📊 Login Status:');
        console.log('   QR Code visible:', qrCode ? 'YES (scan to login)' : 'NO');
        console.log('   Chat list visible:', chatList ? 'YES (logged in)' : 'NO');
        
        if (qrCode && !chatList) {
            console.log('\n' + '='.repeat(60));
            console.log('📲 SCAN QR CODE TO LOGIN');
            console.log('='.repeat(60));
            console.log('\nOn your phone:');
            console.log('1. Open WhatsApp');
            console.log('2. Menu (⋮) → Linked Devices');
            console.log('3. Tap "Link a Device"');
            console.log('4. Scan QR code on screen');
            console.log('\n⏳ Browser will stay open for 2 minutes...');
            console.log('='.repeat(60));
            
            // Wait for login
            let loggedIn = false;
            for (let i = 0; i < 60; i++) {
                await page.waitForTimeout(2000);
                const newQrCode = await page.$('div[data-testid="qr-code"]');
                const newChatList = await page.$('[data-testid="chat-list"]');
                
                if (!newQrCode && newChatList) {
                    loggedIn = true;
                    console.log('\n✅ LOGGED IN SUCCESSFULLY!');
                    console.log('💾 Session saved to Chrome profile');
                    console.log('   Location:', CHROME_USER_DATA);
                    break;
                }
                
                if (i % 15 === 0) {
                    console.log(`   Waiting... ${(i*2)/60}s / 120s`);
                }
            }
            
            if (!loggedIn) {
                console.log('\n⏰ Timeout - Please try again');
            }
        } else if (chatList) {
            console.log('\n✅ ALREADY LOGGED IN!');
            console.log('💾 Using saved Chrome profile session');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('Browser is open. Press Ctrl+C when done.');
        console.log('='.repeat(60));
        
        // Keep browser open
        await new Promise(() => {});
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    } finally {
        if (context) {
            console.log('\n🔒 Closing browser...');
            await context.close();
        }
    }
}

testWhatsApp();
