#!/usr/bin/env node
/**
 * WhatsApp Session Authentication - FIXED VERSION
 * Uses proper Chromium browser with desktop user agent
 * 
 * Usage: node auth_fixed.js
 */

import { chromium } from 'playwright';
import fs from 'fs';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';

console.log('='.repeat(60));
console.log('WHATSAPP SESSION AUTHENTICATION - FIXED');
console.log('='.repeat(60));

// Ensure session directory exists
if (!fs.existsSync(SESSION_PATH)) {
    console.log('\nCreating session directory...');
    fs.mkdirSync(SESSION_PATH, { recursive: true });
}

console.log('\nSession path:', SESSION_PATH);
console.log('\nStarting in 3 seconds...');
console.log('='.repeat(60));
console.log('HAVE YOUR PHONE READY:');
console.log('1. Open WhatsApp on phone');
console.log('2. Menu (⋮) → Linked Devices');
console.log('3. Be ready to tap "Link a Device"');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 3000));

async function authenticate() {
    let browser;
    
    try {
        console.log('\nLaunching Chromium browser...');
        
        // Launch Chromium with proper desktop settings
        browser = await chromium.launch({
            headless: false,
            args: [
                '--start-maximized',
                '--disable-gpu',
                '--no-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled'
            ]
        });
        
        console.log('Browser launched');
        
        // Create persistent context with desktop user agent
        const context = await browser.newContext({
            userDataDir: SESSION_PATH,
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false
        });
        
        console.log('Context created with desktop user agent');
        
        const page = await context.newPage();
        
        // Set proper headers to avoid mobile redirect
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        });
        
        console.log('Opening WhatsApp Web...');
        
        // Navigate to WhatsApp Web
        await page.goto('https://web.whatsapp.com', { 
            waitUntil: 'domcontentloaded',
            timeout: 30000 
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('QR CODE SHOULD BE VISIBLE NOW');
        console.log('='.repeat(60));
        console.log('\nOn your phone:');
        console.log('1. Open WhatsApp');
        console.log('2. Tap Menu (⋮) or Settings');
        console.log('3. Tap "Linked Devices"');
        console.log('4. Tap "Link a Device"');
        console.log('5. Point camera at QR code on screen');
        console.log('\n⏳ Browser will stay open for 3 minutes...');
        console.log('='.repeat(60));
        
        // Wait for authentication
        let authenticated = false;
        const maxWait = 180000; // 3 minutes
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
                console.log(`Time: ${elapsed / 1000} seconds`);
                console.log(`Detected: ${chatList ? 'Chat List' : defaultUser ? 'Default User' : 'Search Bar'}`);
                console.log('\n💾 Session will be saved when browser closes...');
            }
            
            if (elapsed % 30000 === 0) {
                console.log(`Waiting... ${elapsed/1000}s / ${maxWait/1000}s`);
                console.log(`QR visible: ${qrCode ? 'Yes' : 'No'}`);
                console.log(`Logged in: ${isLoggedIn ? 'Yes' : 'No'}`);
            }
        }
        
        console.log('\n\n✅ SESSION SHOULD BE SAVED!');
        console.log('\nSession location:', SESSION_PATH);
        
        // Check if files were created
        if (fs.existsSync(SESSION_PATH)) {
            const files = fs.readdirSync(SESSION_PATH);
            console.log('Files in session:', files.length);
            if (files.length > 0) {
                console.log('✅ Session files created!');
            } else {
                console.log('⚠️ Session directory still empty');
            }
        }
        
        console.log('\nTo test:');
        console.log('set TEST_WHATSAPP_PHONE=+923353221004');
        console.log('node test_whatsapp_manual.js');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
        console.log('\nTroubleshooting:');
        console.log('- Make sure you have internet connection');
        console.log('- Try closing other Chrome/Edge windows');
        console.log('- Make sure QR code is visible on screen');
        console.log('- If you see Safari upgrade message, the browser detection failed');
    } finally {
        if (browser) {
            console.log('\nClosing browser...');
            await browser.close();
            console.log('Browser closed');
        }
    }
}

authenticate();
