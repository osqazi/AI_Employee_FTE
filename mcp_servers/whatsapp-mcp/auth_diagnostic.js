#!/usr/bin/env node
/**
 * WhatsApp Authentication - DIAGNOSTIC VERSION
 * Shows what's actually on the page and takes screenshots
 * 
 * Usage: node auth_diagnostic.js
 */

import { chromium } from 'playwright';
import fs from 'fs';

const SESSION_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\whatsapp_session';
const SCREENSHOT_PATH = 'D:\\Projects\\hackathon\\ai-assist-fte\\mcp_servers\\whatsapp-mcp\\whatsapp_debug.png';

console.log('='.repeat(60));
console.log('WHATSAPP AUTHENTICATION - DIAGNOSTIC');
console.log('='.repeat(60));

// Ensure session directory exists
if (!fs.existsSync(SESSION_PATH)) {
    console.log('\nCreating session directory...');
    fs.mkdirSync(SESSION_PATH, { recursive: true });
}

console.log('\nSession path:', SESSION_PATH);
console.log('\nStarting in 5 seconds...');
console.log('='.repeat(60));
console.log('This will:');
console.log('1. Open WhatsApp Web');
console.log('2. Take a screenshot of what is shown');
console.log('3. Save screenshot to: whatsapp_debug.png');
console.log('4. Keep browser open for manual inspection');
console.log('='.repeat(60));

await new Promise(resolve => setTimeout(resolve, 5000));

async function authenticate() {
    let browser;
    
    try {
        console.log('\nLaunching Chromium browser...');
        
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
        
        const context = await browser.newContext({
            userDataDir: SESSION_PATH,
            viewport: { width: 1920, height: 1080 },
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false
        });
        
        console.log('Context created');
        
        const page = await context.newPage();
        
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        });
        
        console.log('Opening WhatsApp Web...');
        
        // Navigate and wait for load
        await page.goto('https://web.whatsapp.com', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        console.log('Page loaded');
        
        // Get page title
        const title = await page.title();
        console.log('\nPage title:', title);
        
        // Get page URL
        const url = page.url();
        console.log('Page URL:', url);
        
        // Take screenshot
        console.log('\nTaking screenshot...');
        await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
        console.log('Screenshot saved to:', SCREENSHOT_PATH);
        
        // Check for various elements
        console.log('\nChecking for elements...');
        
        const qrCode = await page.$('[data-testid="qr-code"]');
        console.log('QR Code element:', qrCode ? 'FOUND' : 'NOT FOUND');
        
        const chatList = await page.$('[data-testid="chat-list"]');
        console.log('Chat List element:', chatList ? 'FOUND' : 'NOT FOUND');
        
        const defaultUser = await page.$('[data-testid="default-user"]');
        console.log('Default User element:', defaultUser ? 'FOUND' : 'NOT FOUND');
        
        // Check for error messages
        const errorElement = await page.$('div[data-testid="error-container"]');
        console.log('Error element:', errorElement ? 'FOUND' : 'NOT FOUND');
        
        // Get all h1, h2, h3 text (usually contains error messages)
        const headings = await page.$$eval('h1, h2, h3, .title', els => els.map(e => e.textContent));
        if (headings.length > 0) {
            console.log('\nHeadings found:');
            headings.forEach(h => console.log(' -', h.trim()));
        }
        
        // Get all paragraph text
        const paragraphs = await page.$$eval('p, span, div', els => {
            return els
                .filter(e => e.textContent && e.textContent.trim().length > 0)
                .map(e => e.textContent.trim())
                .slice(0, 20); // First 20 text elements
        });
        
        if (paragraphs.length > 0) {
            console.log('\nText content found:');
            paragraphs.forEach(p => {
                if (p.length < 200) { // Only show short text
                    console.log(' -', p);
                }
            });
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('BROWSER WILL STAY OPEN FOR MANUAL INSPECTION');
        console.log('='.repeat(60));
        console.log('\nPlease check:');
        console.log('1. What is shown in the browser?');
        console.log('2. Is there an error message?');
        console.log('3. Is QR code visible?');
        console.log('4. Screenshot saved to: whatsapp_debug.png');
        console.log('\nPress Ctrl+C to close browser');
        console.log('='.repeat(60));
        
        // Keep browser open indefinitely
        await new Promise(() => {});
        
    } catch (error) {
        console.log('\n❌ ERROR:', error.message);
        console.log('\nStack:', error.stack);
    } finally {
        if (browser) {
            console.log('\nClosing browser...');
            await browser.close();
        }
    }
}

authenticate();
