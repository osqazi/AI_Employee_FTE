#!/usr/bin/env node
/**
 * WhatsApp Authentication - WITH EXPLICIT SESSION SAVE
 * Saves session state explicitly before closing
 * 
 * Usage: node auth_save_session.js
 */

import { chromium } from 'playwright';
import fs from 'fs';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const STORAGE_STATE_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session\\storage_state.json';

console.log('='.repeat(60));
console.log('WHATSAPP SESSION AUTHENTICATION - WITH EXPLICIT SAVE');
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
    let context;
    
    try {
        console.log('\nLaunching Chromium browser...');
        
        browser = await chromium.launch({
            headless: false,
            args: ['--start-maximized', '--disable-gpu']
        });
        
        console.log('Creating persistent context...');
        
        context = await browser.newContext({
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
        
        // Wait for authentication
        let authenticated = false;
        const maxWait = 180000;
        const interval = 2000;
        let elapsed = 0;
        
        while (elapsed < maxWait) {
            await page.waitForTimeout(interval);
            elapsed += interval;
            
            // Check for logged-in indicators
            const appElement = await page.$('#app');
            const contactList = await page.$('span[title]');
            const pageTitle = await page.title();
            
            const isLoggedIn = appElement !== null;
            const hasContacts = contactList !== null;
            
            if (isLoggedIn && hasContacts && !authenticated) {
                authenticated = true;
                console.log('\n✅ AUTHENTICATION SUCCESSFUL!');
                console.log(`Time: ${elapsed / 1000} seconds`);
                console.log(`Page title: ${pageTitle}`);
                console.log('Detected: Main app loaded with contacts');
                
                // Save storage state explicitly
                console.log('\n💾 Saving session state...');
                try {
                    const storageState = await context.storageState();
                    fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2));
                    console.log('Session state saved to:', STORAGE_STATE_PATH);
                    
                    // Also save cookies separately for easier access
                    const cookiesPath = SESSION_PATH + '\\cookies.json';
                    fs.writeFileSync(cookiesPath, JSON.stringify(storageState.cookies, null, 2));
                    console.log('Cookies saved to:', cookiesPath);
                } catch (saveError) {
                    console.log('Warning: Could not save session state:', saveError.message);
                }
                
                // Wait to ensure session saves
                await page.waitForTimeout(15000);
            }
            
            if (elapsed % 30000 === 0) {
                console.log(`\nWaiting... ${elapsed/1000}s / ${maxWait/1000}s`);
                console.log(`Page title: ${pageTitle}`);
                console.log(`Logged in: ${isLoggedIn ? 'Yes' : 'No'}`);
                console.log(`Contacts visible: ${hasContacts ? 'Yes' : 'No'}`);
            }
        }
        
        console.log('\n\n✅ SESSION SAVED SUCCESSFULLY!');
        console.log('\nSession location:', SESSION_PATH);
        
        // Check if files were created
        if (fs.existsSync(SESSION_PATH)) {
            const files = fs.readdirSync(SESSION_PATH);
            console.log('Files in session:', files.length);
            if (files.length > 0) {
                console.log('✅ Session files created!');
                console.log('   Files:', files.join(', '));
            }
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('TO TEST WHATSAPP INTEGRATION:');
        console.log('='.repeat(60));
        console.log('set TEST_WHATSAPP_PHONE=+923353221004');
        console.log('node test_whatsapp_manual.js');
        console.log('='.repeat(60));
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
    } finally {
        if (context) {
            console.log('\nSaving final session state...');
            try {
                const storageState = await context.storageState();
                fs.writeFileSync(STORAGE_STATE_PATH, JSON.stringify(storageState, null, 2));
                console.log('Final session state saved');
            } catch (e) {
                console.log('Could not save final state:', e.message);
            }
        }
        
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
            console.log('Browser closed');
        }
    }
}

authenticate();
