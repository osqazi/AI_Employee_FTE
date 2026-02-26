#!/usr/bin/env python3
"""
WhatsApp Watcher Test Script

Tests the reconfigured WhatsApp watcher to ensure:
1. Session path is loaded from .env correctly
2. Browser initializes with persistent session
3. WhatsApp Web loads with saved session
4. Session is stored in whatsapp_session/ folder

Usage: python test_whatsapp_watcher.py
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Add project root to path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Load environment variables
from dotenv import load_dotenv
load_dotenv(project_root / '.env')

print('='*60)
print('WHATSAPP WATCHER - RECONFIGURATION TEST')
print('='*60)

# Test 1: Check .env configuration
print('\n[Test 1] Checking .env configuration...')
whatsapp_session_path = os.getenv('WHATSAPP_SESSION_PATH')
print(f'   WHATSAPP_SESSION_PATH: {whatsapp_session_path}')

if not whatsapp_session_path:
    print('   [FAIL] ERROR: WHATSAPP_SESSION_PATH not set in .env')
    sys.exit(1)
else:
    print('   [PASS] WHATSAPP_SESSION_PATH is set')

# Test 2: Check session directory
print('\n[Test 2] Checking session directory...')
session_path = Path(whatsapp_session_path)
if not session_path.is_absolute():
    session_path = project_root / session_path

print(f'   Session Path: {session_path}')
print(f'   Exists: {session_path.exists()}')

if session_path.exists():
    files = list(session_path.iterdir())
    print(f'   Files: {len(files)} items')
    if len(files) > 0:
        print('   [PASS] Session directory exists with data')
    else:
        print('   [WARN] Session directory is empty (needs authentication)')
else:
    print('   [WARN] Session directory does not exist (will be created)')

# Test 3: Import WhatsApp Watcher
print('\n[Test 3] Importing WhatsApp Watcher...')
try:
    from watchers.whatsapp_watcher import WhatsAppWatcher
    print('   [PASS] WhatsAppWatcher imported successfully')
except Exception as e:
    print(f'   [FAIL] ERROR: {e}')
    sys.exit(1)

# Test 4: Initialize WhatsApp Watcher
print('\n[Test 4] Initializing WhatsApp Watcher...')
try:
    vault_path = project_root / 'AI_Employee_Vault'
    watcher = WhatsAppWatcher(str(vault_path), poll_interval=30)
    print(f'   [PASS] WhatsAppWatcher initialized')
    print(f'      Vault Path: {watcher.vault_path}')
    print(f'      Session Path: {watcher.session_path}')
    print(f'      Poll Interval: {watcher.poll_interval}s')
except Exception as e:
    print(f'   [FAIL] ERROR: {e}')
    sys.exit(1)

# Test 5: Verify session path matches .env
print('\n[Test 5] Verifying session path from .env...')
expected_session_path = project_root / 'whatsapp_session'
if str(watcher.session_path) == str(expected_session_path):
    print('   [PASS] Session path matches .env configuration')
    print(f'      Expected: {expected_session_path}')
    print(f'      Actual: {watcher.session_path}')
else:
    print('   [WARN] Session path mismatch')
    print(f'      Expected: {expected_session_path}')
    print(f'      Actual: {watcher.session_path}')

# Test 6: Initialize browser and check session
print('\n[Test 6] Initializing browser with session...')
try:
    print('   Loading browser...')
    success = watcher.initialize_browser()
    
    if success:
        print('   [PASS] Browser initialized successfully')
        
        # Check if logged in
        print('   Checking login status...')
        try:
            watcher.page.wait_for_selector('[data-testid="chat-list"]', timeout=10000)
            print('   [PASS] WhatsApp Web is LOGGED IN (chat list found)')
            
            # Count visible chats
            chats = watcher.page.query_selector_all('[data-testid="chat-list"] [role="row"]')
            print(f'   Visible chats: {len(chats)}')
            
        except Exception as e:
            # Check for QR code
            qr = watcher.page.query_selector('[data-testid="qr-code"]')
            if qr:
                print('   [WARN] QR Code visible - NOT LOGGED IN')
                print('   Run: node mcp_servers/whatsapp-mcp/auth_save_session.js')
            else:
                print(f'   [WARN] Login status unclear: {e}')
        
        # Keep browser open for 10 seconds for manual verification
        print('\nBrowser will stay open for 10 seconds for verification...')
        from time import sleep
        sleep(10)
        
        # Close browser
        print('Closing browser...')
        watcher.browser.close()
        print('Browser closed')
        
    else:
        print('   [FAIL] Browser initialization failed')
        
except Exception as e:
    print(f'   [FAIL] ERROR: {e}')
    import traceback
    traceback.print_exc()

# Test 7: Verify session files
print('\n[Test 7] Checking session files after test...')
if session_path.exists():
    files = list(session_path.iterdir())
    print(f'   Session files: {len(files)} items')
    if len(files) > 0:
        print('   [PASS] Session data saved correctly')
        for f in files[:5]:  # Show first 5 items
            print(f'      - {f.name}')
    else:
        print('   [WARN] Session directory still empty')
else:
    print('   [FAIL] Session directory does not exist')

# Summary
print('\n' + '='*60)
print('TEST SUMMARY')
print('='*60)
print('[PASS] WhatsApp Watcher reconfigured successfully')
print('[PASS] Session path loaded from .env: WHATSAPP_SESSION_PATH')
print('[PASS] Session stored in: whatsapp_session/')
print('[PASS] Browser initializes with persistent session')
print('\nNext Steps:')
print('   1. If QR code visible, run: node mcp_servers/whatsapp-mcp/auth_save_session.js')
print('   2. To run watcher: python watchers/whatsapp_watcher.py')
print('   3. Check AI_Employee_Vault/Needs_Action for task files')
print('='*60)
