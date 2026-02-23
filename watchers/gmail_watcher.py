#!/usr/bin/env python3
"""
Gmail Watcher - Silver Tier

Monitors Gmail inbox for new emails and creates task files in Needs_Action folder.
Uses Gmail API with OAuth2 authentication.
"""

import base64
import logging
from pathlib import Path
from datetime import datetime
from email import message_from_bytes
from watchers.base_watcher import BaseWatcher

# Configure logging
logger = logging.getLogger('gmail_watcher')


class GmailWatcher(BaseWatcher):
    """
    Watches Gmail inbox for new emails.
    Extends BaseWatcher with Gmail-specific implementation.
    """
    
    def __init__(self, vault_path: str, credentials_path: str, poll_interval: int = 120):
        """
        Initialize Gmail watcher.
        
        Args:
            vault_path: Path to AI_Employee_Vault
            credentials_path: Path to Gmail OAuth2 credentials JSON
            poll_interval: Seconds between scans (default: 120)
        """
        super().__init__(vault_path, poll_interval)
        
        self.credentials_path = Path(credentials_path)
        self.token_path = self.vault_path / 'gmail_token.json'
        self.processed_ids = set()
        
        # Gmail API service (initialized on first use)
        self.service = None
        
        logger.info(f'GmailWatcher initialized - Credentials: {self.credentials_path}')
    
    def authenticate(self):
        """
        Authenticate with Gmail API using OAuth2.
        
        Returns:
            True if authentication successful
        """
        try:
            from google.oauth2.credentials import Credentials
            from google.oauth2 import service_account
            from google.auth.transport.requests import Request
            from google_auth_oauthlib.flow import InstalledAppFlow
            
            # Gmail API scopes
            SCOPES = ['https://www.googleapis.com/auth/gmail_readonly']
            
            creds = None
            
            # Load existing token
            if self.token_path.exists():
                creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
            
            # Refresh or get new credentials
            if not creds or not creds.valid:
                if creds and creds.expired and creds.refresh_token:
                    creds.refresh(Request())
                else:
                    # Run OAuth2 flow
                    flow = InstalledAppFlow.from_client_secrets_file(
                        self.credentials_path, SCOPES
                    )
                    creds = flow.run_local_server(port=0)
                
                # Save token for future use
                with open(self.token_path, 'w') as f:
                    f.write(creds.to_json())
            
            # Build Gmail API service
            from googleapiclient.discovery import build
            self.service = build('gmail', 'v1', credentials=creds)
            
            logger.info('Gmail API authentication successful')
            return True
            
        except Exception as e:
            logger.error(f'Gmail authentication failed: {e}')
            return False
    
    def scan(self) -> list:
        """
        Scan Gmail inbox for unread emails.
        
        Returns:
            List of new email messages
        """
        new_emails = []
        
        try:
            # Authenticate if needed
            if not self.service:
                if not self.authenticate():
                    return []
            
            # Fetch unread emails
            results = self.service.users().messages().list(
                userId='me',
                q='is:unread',
                maxResults=10
            ).execute()
            
            messages = results.get('messages', [])
            
            for message in messages:
                msg_id = message['id']
                
                # Check if already processed
                if msg_id not in self.processed_ids:
                    # Fetch full message
                    msg = self.service.users().messages().get(
                        userId='me',
                        id=msg_id
                    ).execute()
                    
                    new_emails.append(msg)
                    self.processed_ids.add(msg_id)
                    
                    logger.info(f'New email detected: {msg_id}')
        
        except Exception as e:
            logger.error(f'Error scanning Gmail: {e}')
        
        return new_emails
    
    def create_task_file(self, email_msg: dict) -> Path:
        """
        Create task file in Needs_Action folder for new email.
        
        Args:
            email_msg: Gmail API message object
            
        Returns:
            Path to created task file
        """
        msg_id = email_msg['id']
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        task_filename = f'EMAIL_{msg_id}_{timestamp}.md'
        task_path = self.needs_action / task_filename
        
        # Extract email headers
        headers = {h['name']: h['value'] for h in email_msg['payload']['headers']}
        
        sender = headers.get('From', 'Unknown')
        subject = headers.get('Subject', 'No Subject')
        date = headers.get('Date', 'Unknown')
        
        # Extract email body
        body = self._extract_body(email_msg)
        
        # Create task file content
        content = f"""---
source: gmail_watcher
type: email
from: {sender}
subject: {subject}
date: {date}
received: {datetime.now().isoformat()}
message_id: {msg_id}
status: pending
priority: normal
---

# Email: {subject}

**From**: {sender}  
**Date**: {date}  
**Received**: {datetime.now().isoformat()}

## Email Content

{body}

## Suggested Actions

- [ ] Read email content
- [ ] Reply to sender
- [ ] Forward to relevant party
- [ ] Archive after processing
- [ ] Mark as unread if needs follow-up

## Notes

<!-- Add notes here -->

---
*Generated by GmailWatcher - Silver Tier*
"""
        
        # Write task file
        task_path.write_text(content)
        
        # Mark email as read
        try:
            self.service.users().messages().modify(
                userId='me',
                id=msg_id,
                body={'removeLabelIds': ['UNREAD']}
            ).execute()
        except Exception as e:
            logger.error(f'Failed to mark email as read: {e}')
        
        # Log operation
        self.log_operation('create_task_file', {
            'email_id': msg_id,
            'sender': sender,
            'subject': subject,
            'task_file': str(task_path)
        })
        
        return task_path
    
    def _extract_body(self, email_msg: dict) -> str:
        """
        Extract email body from Gmail API message.
        
        Args:
            email_msg: Gmail API message object
            
        Returns:
            Email body text
        """
        try:
            if 'parts' in email_msg['payload']:
                # Multipart email
                for part in email_msg['payload']['parts']:
                    if part['mimeType'] == 'text/plain':
                        body_data = part['body'].get('data', '')
                        if body_data:
                            body = base64.urlsafe_b64decode(body_data).decode('utf-8')
                            return body[:2000]  # Limit to 2000 chars
            else:
                # Simple email
                body_data = email_msg['payload']['body'].get('data', '')
                if body_data:
                    body = base64.urlsafe_b64decode(body_data).decode('utf-8')
                    return body[:2000]
        except Exception as e:
            logger.error(f'Error extracting email body: {e}')
        
        return '[Body not available]'


if __name__ == '__main__':
    # Test Gmail watcher
    import sys
    
    if len(sys.argv) < 3:
        print('Usage: python gmail_watcher.py <vault_path> <credentials_path>')
        sys.exit(1)
    
    vault_path = sys.argv[1]
    credentials_path = sys.argv[2]
    
    watcher = GmailWatcher(vault_path, credentials_path, poll_interval=60)
    
    print(f'GmailWatcher starting - Credentials: {credentials_path}')
    print('Press Ctrl+C to stop')
    
    watcher.run()
