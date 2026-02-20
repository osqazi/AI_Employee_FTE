#!/usr/bin/env python3
"""
Gmail Watcher Configuration Test
Verifies Gmail Watcher is properly configured without requiring OAuth flow
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

print('\n' + '='*60)
print('GMAIL WATCHER CONFIGURATION TEST')
print('='*60)

# Test 1: Check credentials file
print('\n[Test 1] Checking credentials file...')
creds_path = os.getenv('GMAIL_CREDENTIALS_PATH', 'credentials/gmail_credentials.json')
creds_file = Path(creds_path)

if creds_file.exists():
    print(f'[OK] Credentials file found: {creds_file}')
    
    # Verify JSON structure
    import json
    with open(creds_file) as f:
        creds = json.load(f)
    
    if 'web' in creds:
        print(f'[OK] Valid OAuth2 credentials structure')
        print(f'     Client ID: {creds["web"]["client_id"][:30]}...')
        print(f'     Project ID: {creds["web"]["project_id"]}')
        print(f'     Redirect URI: {creds["web"]["redirect_uris"]}')
    else:
        print('[FAIL] Invalid credentials structure')
        sys.exit(1)
else:
    print(f'[FAIL] Credentials file not found: {creds_file}')
    sys.exit(1)

# Test 2: Check .env configuration
print('\n[Test 2] Checking .env configuration...')
client_id = os.getenv('GMAIL_CLIENT_ID')
client_secret = os.getenv('GMAIL_CLIENT_SECRET')
redirect_uri = os.getenv('GMAIL_REDIRECT_URI')

if client_id:
    print(f'[OK] GMAIL_CLIENT_ID configured')
else:
    print(f'[FAIL] GMAIL_CLIENT_ID not set')
    sys.exit(1)

if client_secret:
    print(f'[OK] GMAIL_CLIENT_SECRET configured')
else:
    print(f'[FAIL] GMAIL_CLIENT_SECRET not set')
    sys.exit(1)

if redirect_uri:
    print(f'[OK] GMAIL_REDIRECT_URI: {redirect_uri}')
else:
    print(f'[FAIL] GMAIL_REDIRECT_URI not set')
    sys.exit(1)

# Test 3: Verify Gmail Watcher imports
print('\n[Test 3] Checking Gmail Watcher module...')
try:
    from watchers.gmail_watcher import GmailWatcher
    print('[OK] GmailWatcher module imports successfully')
except ImportError as e:
    print(f'[FAIL] Import error: {e}')
    sys.exit(1)

# Test 4: Verify BaseWatcher inheritance
print('\n[Test 4] Checking BaseWatcher inheritance...')
from watchers.base_watcher import BaseWatcher
if issubclass(GmailWatcher, BaseWatcher):
    print('[OK] GmailWatcher extends BaseWatcher')
else:
    print('[FAIL] GmailWatcher does not extend BaseWatcher')
    sys.exit(1)

# Test 5: Verify required methods
print('\n[Test 5] Checking required methods...')
required_methods = ['authenticate', 'check_for_updates', 'create_action_file', 'run']
for method in required_methods:
    if hasattr(GmailWatcher, method):
        print(f'[OK] Method {method}() exists')
    else:
        print(f'[FAIL] Method {method}() missing')
        sys.exit(1)

# Test 6: Verify port configuration
print('\n[Test 6] Checking OAuth2 port configuration...')
import inspect
source = inspect.getsource(GmailWatcher)
if 'port=8080' in source:
    print('[OK] OAuth2 configured to use port 8080')
else:
    print('[WARN] OAuth2 port not explicitly set to 8080')

# Test 7: Check vault structure
print('\n[Test 7] Checking vault structure...')
vault_path = Path(__file__).parent.parent / 'AI_Employee_Vault'
required_folders = ['Inbox', 'Needs_Action', 'Pending_Approval', 'Approved', 'Rejected', 'Done', 'Plans']
for folder in required_folders:
    folder_path = vault_path / folder
    if folder_path.exists():
        print(f'[OK] Folder exists: {folder}/')
    else:
        print(f'[WARN] Folder missing: {folder}/')

print('\n' + '='*60)
print('CONFIGURATION TEST SUMMARY')
print('='*60)
print('[PASS] Gmail Watcher is properly configured')
print('\nNext Steps:')
print('1. Add http://localhost:8080 to Authorized redirect URIs in Google Cloud Console')
print('2. Run: python tests/test_gmail_live.py')
print('3. Complete OAuth2 flow in browser')
print('4. Gmail Watcher will be ready for production use')
print('='*60 + '\n')
