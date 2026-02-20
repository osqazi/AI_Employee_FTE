#!/usr/bin/env python3
"""
Gmail OAuth2 Manual Authentication
Run this once to authenticate and save the token
"""

import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

print('\n' + '='*60)
print('GMAIL OAUTH2 MANUAL AUTHENTICATION')
print('='*60)

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from googleapiclient.discovery import build
    import pickle
    
    SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']
    creds_path = Path('credentials/gmail_credentials.json')
    token_path = Path('gmail_token.pickle')
    
    print(f'\n[Step 1] Loading credentials from {creds_path}...')
    if not creds_path.exists():
        print(f'[FAIL] Credentials file not found: {creds_path}')
        sys.exit(1)
    print('[OK] Credentials loaded')
    
    print('\n[Step 2] Checking for existing token...')
    if token_path.exists():
        print('[INFO] Existing token found. Removing for fresh auth...')
        token_path.unlink()
    
    print('\n[Step 3] Starting OAuth2 flow...')
    print('[ACTION REQUIRED] Follow these steps:')
    print('1. A browser window will open (or copy the URL below)')
    print('2. Sign in with your Google account')
    print('3. Grant permissions to the app')
    print('4. You will be redirected to localhost:8080')
    print('5. The page may show an error - this is normal, just copy the URL')
    print('6. Paste the URL back here')
    print()
    
    flow = InstalledAppFlow.from_client_secrets_file(
        str(creds_path), SCOPES
    )
    
    # Try with port 8080
    print('Attempting authentication on port 8080...')
    try:
        creds = flow.run_local_server(port=8080, bind_addr='127.0.0.1', timeout_seconds=120)
        print('[OK] Authentication successful!')
    except Exception as e:
        print(f'[WARN] Port 8080 failed: {e}')
        print('Trying with default port...')
        creds = flow.run_local_server(timeout_seconds=120)
        print('[OK] Authentication successful!')
    
    print('\n[Step 4] Saving token...')
    with open(token_path, 'wb') as f:
        pickle.dump(creds, f)
    print(f'[OK] Token saved to {token_path}')
    
    print('\n[Step 5] Testing Gmail API access...')
    service = build('gmail', 'v1', credentials=creds)
    
    # Get profile
    profile = service.users().getProfile(userId='me').execute()
    print(f'[OK] Connected to: {profile["emailAddress"]}')
    
    # Get unread messages
    results = service.users().messages().list(
        userId='me',
        q='is:unread',
        maxResults=5
    ).execute()
    
    messages = results.get('messages', [])
    print(f'[OK] Found {len(messages)} unread message(s)')
    
    if messages:
        print(f'\nLatest {min(3, len(messages))} unread messages:')
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
    
    print('\n' + '='*60)
    print('[SUCCESS] Gmail OAuth2 Authentication Complete!')
    print('='*60)
    print('\nNext Steps:')
    print('1. Token saved - no need to authenticate again')
    print('2. Run: python tests/test_gmail_live.py')
    print('3. Gmail Watcher will use saved token')
    print('='*60 + '\n')
    
except Exception as e:
    print(f'\n[FAIL] Authentication failed: {e}')
    print('\nTroubleshooting:')
    print('1. Ensure http://localhost:8080 is added to Authorized redirect URIs')
    print('   in Google Cloud Console: https://console.cloud.google.com/apis/credentials')
    print('2. Ensure Gmail API is enabled in Google Cloud Console')
    print('3. Try again: python tests/test_gmail_auth_manual.py')
    sys.exit(1)
