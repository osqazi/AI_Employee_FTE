#!/usr/bin/env python3
"""
Gmail Watcher Live Test
Tests Gmail API authentication and watcher functionality
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_gmail_credentials():
    """Test Gmail API credentials and authentication"""
    print('\n' + '='*60)
    print('GMAIL WATCHER LIVE TEST')
    print('='*60)
    
    # Check credentials from .env
    client_id = os.getenv('GMAIL_CLIENT_ID')
    client_secret = os.getenv('GMAIL_CLIENT_SECRET')
    credentials_path = os.getenv('GMAIL_CREDENTIALS_PATH')
    
    print(f'\nCredentials loaded from .env:')
    print(f'  Client ID: {client_id[:20]}...' if client_id else '  Client ID: NOT SET')
    print(f'  Client Secret: {client_secret[:10]}...' if client_secret else '  Client Secret: NOT SET')
    print(f'  Credentials Path: {credentials_path}')
    
    # Check if credentials file exists
    creds_file = Path(credentials_path) if credentials_path else Path('credentials.json')
    if not creds_file.exists():
        print(f'\n[WARN] Credentials file not found at: {creds_file}')
        print('\nTo get Gmail API credentials:')
        print('1. Go to: https://console.cloud.google.com/apis/credentials')
        print('2. Create OAuth 2.0 Client ID (Desktop app)')
        print('3. Download the JSON file')
        print('4. Save it as: credentials.json in project root')
        print('\nFor now, testing with environment variables...')
        return False
    
    print(f'\n[OK] Credentials file found: {creds_file}')
    
    # Try to authenticate
    try:
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow
        from googleapiclient.discovery import build
        from google.auth.transport.requests import Request
        import pickle
        
        SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
        token_file = Path(__file__).parent.parent / 'gmail_token.pickle'
        
        creds = None
        if token_file.exists():
            with open(token_file, 'rb') as f:
                creds = pickle.load(f)
            print('[OK] Found existing token file')
        
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                print('[INFO] Refreshing expired token...')
                creds.refresh(Request())
            else:
                print('[INFO] Starting OAuth2 flow on port 8080...')
                print('[INFO] Browser will open - please sign in with your Google account')
                flow = InstalledAppFlow.from_client_secrets_file(
                    str(creds_file), SCOPES
                )
                # Explicitly use port 8080 to match .env configuration
                creds = flow.run_local_server(port=8080, bind_addr='127.0.0.1')
            
            # Save token
            with open(token_file, 'wb') as f:
                pickle.dump(creds, f)
            print('[OK] Token saved')
        
        # Build Gmail service
        service = build('gmail', 'v1', credentials=creds)
        print('[OK] Gmail API service created')
        
        # Test: Get unread important messages
        print('\nTesting Gmail API...')
        results = service.users().messages().list(
            userId='me',
            q='is:unread is:important',
            maxResults=5
        ).execute()
        
        messages = results.get('messages', [])
        print(f'[OK] Found {len(messages)} unread important message(s)')
        
        if messages:
            print(f'\nLatest {min(3, len(messages))} messages:')
            for msg in messages[:3]:
                message = service.users().messages().get(
                    userId='me',
                    id=msg['id'],
                    format='metadata',
                    metadataHeaders=['From', 'Subject', 'Date']
                ).execute()
                headers = {h['name']: h['value'] for h in message['payload']['headers']}
                print(f'  - From: {headers.get("From", "Unknown")}')
                print(f'    Subject: {headers.get("Subject", "No Subject")}')
                print()
        
        print('\n[PASS] Gmail API Test - SUCCESSFUL')
        return True
        
    except Exception as e:
        print(f'\n[FAIL] Gmail API Test - FAILED: {e}')
        print('\nTroubleshooting:')
        print('1. Ensure credentials.json is valid OAuth 2.0 Desktop app credentials')
        print('2. Ensure Gmail API is enabled in Google Cloud Console')
        print('3. Check that redirect URI matches: http://localhost:8080')
        return False

def test_gmail_watcher():
    """Test Gmail Watcher integration"""
    print('\n' + '='*60)
    print('GMAIL WATCHER INTEGRATION TEST')
    print('='*60)
    
    try:
        from watchers.gmail_watcher import GmailWatcher
        
        vault_path = Path(__file__).parent.parent / 'AI_Employee_Vault'
        # Use the correct credentials path from .env
        creds_path = Path('credentials/gmail_credentials.json')
        
        if not creds_path.exists():
            print(f'[SKIP] Credentials not found at {creds_path}')
            return False
        
        print(f'\nInitializing GmailWatcher...')
        print(f'  Vault: {vault_path}')
        print(f'  Credentials: {creds_path}')
        watcher = GmailWatcher(str(vault_path), str(creds_path), check_interval=120)
        
        print('[OK] GmailWatcher initialized')
        
        # Test authentication (should use saved token)
        print('\nTesting authentication...')
        if watcher.authenticate():
            print('[OK] Authentication successful (using saved token)')
        else:
            print('[FAIL] Authentication failed')
            return False
        
        # Test check for updates
        print('\nTesting message check...')
        messages = watcher.check_for_updates()
        print(f'[OK] Found {len(messages)} new message(s)')
        
        if messages:
            print(f'\nFirst message preview:')
            msg = messages[0]
            headers = {h['name']: h['value'] for h in msg['payload']['headers']}
            print(f'  From: {headers.get("From", "Unknown")}')
            print(f'  Subject: {headers.get("Subject", "No Subject")}')
            
            # Test create_action_file
            print('\nTesting task file creation...')
            task_file = watcher.create_action_file(msg)
            if task_file:
                print(f'[OK] Task file created: {task_file}')
                
                # Verify YAML frontmatter
                content = task_file.read_text()
                if 'source: gmail_watcher' in content:
                    print('[OK] YAML frontmatter correct')
                else:
                    print('[WARN] YAML frontmatter may be incorrect')
            else:
                print('[SKIP] Task file creation skipped (DEV_MODE or already processed)')
        
        print('\n[PASS] Gmail Watcher Integration Test - SUCCESSFUL')
        return True
        
    except ImportError as e:
        print(f'[SKIP] Gmail Watcher not available: {e}')
        return False
    except Exception as e:
        print(f'[FAIL] Gmail Watcher Test - FAILED: {e}')
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    results = {
        'Gmail_Credentials': False,
        'Gmail_Watcher': False
    }
    
    try:
        results['Gmail_Credentials'] = test_gmail_credentials()
    except Exception as e:
        print(f'\n[FAIL] Credentials Test Exception: {e}')
    
    try:
        results['Gmail_Watcher'] = test_gmail_watcher()
    except Exception as e:
        print(f'\n[FAIL] Watcher Test Exception: {e}')
    
    # Summary
    print('\n' + '='*60)
    print('TEST SUMMARY')
    print('='*60)
    for test, passed in results.items():
        status = '[PASS] PASSED' if passed else '[FAIL] FAILED'
        print(f'{test}: {status}')
    
    passed_count = sum(results.values())
    total_count = len(results)
    print(f'\nTotal: {passed_count}/{total_count} tests passed')
    print('='*60 + '\n')
    
    sys.exit(0 if passed_count == total_count else 1)
