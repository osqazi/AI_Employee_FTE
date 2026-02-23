#!/usr/bin/env node
/**
 * WhatsApp Authentication - IMPROVED DETECTION
 * Uses correct selectors for logged-in state
 * 
 * Usage: node auth_improved.js
 */

import { chromium } from 'playwright';
import fs from 'fs';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';

console.log('='.repeat(60));
console.log('WHATSAPP SESSION AUTHENTICATION - IMPROVED');
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
console.log('3. Tap "Link a Device"');
console.log('4. Scan QR code');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 3000));

async function authenticate() {
    let browser;
    
    try {
        console.log('\nLaunching Chromium browser...');
        
        browser = await chromium.launch({
            headless: false,
            args: ['--start-maximized', '--disable-gpu']
        });
        
        const context = await browser.newContext({
            userDataDir: SESSION_PATH,
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        });
        
        const page = await context.newPage();
        
        console.log('Opening WhatsApp Web...');
        await page.goto('https://web.whatsapp.com', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('\n' + '='.repeat(60));
        console.log('SCAN QR CODE NOW!');
        console.log('='.repeat(60));
        console.log('On your phone:');
        console.log('1. Open WhatsApp');
        console.log('2. Menu (⋮) → Linked Devices');
        console.log('3. Tap "Link a Device"');
        console.log('4. Scan QR code');
        console.log('\n⏳ Waiting 3 minutes...');
        console.log('='.repeat(60));
        
        // Wait for authentication - check for logged-in indicators
        let authenticated = false;
        const maxWait = 180000;
        const interval = 2000;
        let elapsed = 0;
        
        while (elapsed < maxWait) {
            await page.waitForTimeout(interval);
            elapsed += interval;
            
            // Check for logged-in indicators (different selectors)
            const appElement = await page.$('#app');
            const mainElement = await page.$('div[data-testid="main"]');
            const paneElement = await page.$('div[data-testid="default-pane"]');
            const contactList = await page.$('span[title]');
            const pageTitle = await page.title();
            
            // Check if we're past the login screen
            const isLoginPage = pageTitle.includes('WhatsApp') && await page.$('div[data-testid="qr-code"]');
            
            // Better detection: check if main app is loaded
            const isLoggedIn = appElement && mainElement;
            const hasContacts = contactList !== null;
            
            if (isLoggedIn && hasContacts && !authenticated) {
                authenticated = true;
                console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
                console.log(`Time: ${elapsed / 1000} seconds`);
                console.log('Detected: Main app loaded with contacts');
                console.log('\n💾 Session will be saved when browser closes...');
                
                // Wait to ensure session saves
                await page.waitForTimeout(10000);
            }
            
            if (elapsed % 30000 === 0) {
                console.log(`\nWaiting... ${elapsed/1000}s / ${maxWait/1000}s`);
                console.log(`Page title: ${pageTitle}`);
                console.log(`App element: ${appElement ? 'Found' : 'Not found'}`);
                console.log(`Main element: ${mainElement ? 'Found' : 'Not found'}`);
                console.log(`Contacts visible: ${hasContacts ? 'Yes' : 'No'}`);
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
                console.log('⚠️ Session directory still empty (session may be in browser cache)');
            }
        }
        
        console.log('\nTo test:');
        console.log('set TEST_WHATSAPP_PHONE=+923353221004');
        console.log('node test_whatsapp_manual.js');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    } finally {
        if (browser) {
            console.log('\nClosing browser...');
            await browser.close();
        }
    }
}

authenticate();
