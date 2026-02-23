#!/usr/bin/env python3
"""
WhatsApp Watcher - Silver Tier

Monitors WhatsApp Web for new messages and creates task files in Needs_Action folder.
Uses Playwright for browser automation.
"""

import logging
from pathlib import Path
from datetime import datetime
from watchers.base_watcher import BaseWatcher

# Configure logging
logger = logging.getLogger('whatsapp_watcher')


class WhatsAppWatcher(BaseWatcher):
    """
    Watches WhatsApp Web for new messages.
    Extends BaseWatcher with WhatsApp-specific implementation using Playwright.
    """
    
    def __init__(self, vault_path: str, session_path: str, poll_interval: int = 60):
        """
        Initialize WhatsApp watcher.
        
        Args:
            vault_path: Path to AI_Employee_Vault
            session_path: Path to save/load WhatsApp Web session
            poll_interval: Seconds between scans (default: 60)
        """
        super().__init__(vault_path, poll_interval)
        
        self.session_path = Path(session_path)
        self.session_path.mkdir(parents=True, exist_ok=True)
        
        # Keywords to filter important messages
        self.keywords = ['urgent', 'asap', 'invoice', 'payment', 'help', 'important']
        
        # Playwright browser context (initialized on first use)
        self.browser = None
        self.context = None
        self.page = None
        
        # Track processed messages
        self.processed_messages = set()
        
        logger.info(f'WhatsAppWatcher initialized - Session: {self.session_path}')
    
    def initialize_browser(self):
        """
        Initialize Playwright browser with WhatsApp Web session.
        
        Returns:
            True if initialization successful
        """
        try:
            from playwright.sync_api import sync_playwright
            
            # Start Playwright
            playwright = sync_playwright().start()
            
            # Launch browser with persistent context (saves session)
            self.browser = playwright.chromium.launch_persistent_context(
                self.session_path,
                headless=True,
                args=['--start-maximized']
            )
            
            self.page = self.browser.pages[0] if self.browser.pages else self.browser.new_page()
            
            # Navigate to WhatsApp Web
            self.page.goto('https://web.whatsapp.com', wait_until='domcontentloaded')
            
            logger.info('WhatsApp Web browser initialized')
            return True
            
        except Exception as e:
            logger.error(f'Failed to initialize browser: {e}')
            return False
    
    def scan(self) -> list:
        """
        Scan WhatsApp Web for new messages.
        
        Returns:
            List of new messages
        """
        new_messages = []
        
        try:
            # Initialize browser if needed
            if not self.page:
                if not self.initialize_browser():
                    return []
            
            # Wait for chat list to load
            try:
                self.page.wait_for_selector('[data-testid="chat-list"]', timeout=5000)
            except Exception:
                logger.warning('Chat list not found - WhatsApp may not be logged in')
                return []
            
            # Find unread chats
            unread_chats = self.page.query_selector_all('[aria-label*="unread"]')
            
            for chat in unread_chats:
                try:
                    # Extract message data
                    chat_name = chat.inner_text()
                    
                    # Check for keywords
                    chat_text = chat_name.lower()
                    has_keyword = any(kw in chat_text for kw in self.keywords)
                    
                    # Only process if has keyword or is important
                    if has_keyword or len(unread_chats) <= 5:
                        # Create unique message ID
                        msg_id = f'{chat_name}_{datetime.now().strftime("%Y%m%d_%H%M%S")}'
                        
                        if msg_id not in self.processed_messages:
                            new_messages.append({
                                'id': msg_id,
                                'chat': chat_name,
                                'text': chat_text,
                                'element': chat
                            })
                            self.processed_messages.add(msg_id)
                            
                            logger.info(f'New WhatsApp message detected: {chat_name[:50]}')
                
                except Exception as e:
                    logger.error(f'Error processing chat: {e}')
        
        except Exception as e:
            logger.error(f'Error scanning WhatsApp: {e}')
        
        return new_messages
    
    def create_task_file(self, message: dict) -> Path:
        """
        Create task file in Needs_Action folder for new WhatsApp message.
        
        Args:
            message: Message data dictionary
            
        Returns:
            Path to created task file
        """
        msg_id = message['id']
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        task_filename = f'WHATSAPP_{msg_id}_{timestamp}.md'
        task_path = self.needs_action / task_filename
        
        # Create task file content
        content = f"""---
source: whatsapp_watcher
type: whatsapp_message
chat: {message['chat']}
received: {datetime.now().isoformat()}
message_id: {msg_id}
status: pending
priority: normal
---

# WhatsApp Message

**Chat**: {message['chat']}  
**Received**: {datetime.now().isoformat()}

## Message Content

{message['text']}

## Suggested Actions

- [ ] Read message content
- [ ] Reply to sender
- [ ] Take required action
- [ ] Archive after processing

## Notes

<!-- Add notes here -->

---
*Generated by WhatsAppWatcher - Silver Tier*
"""
        
        # Write task file
        task_path.write_text(content)
        
        # Log operation
        self.log_operation('create_task_file', {
            'message_id': msg_id,
            'chat': message['chat'],
            'task_file': str(task_path)
        })
        
        return task_path
    
    def close(self):
        """
        Close browser and cleanup.
        """
        if self.browser:
            try:
                self.browser.close()
                logger.info('WhatsApp browser closed')
            except Exception as e:
                logger.error(f'Error closing browser: {e}')


if __name__ == '__main__':
    # Test WhatsApp watcher
    import sys
    import atexit
    
    if len(sys.argv) < 3:
        print('Usage: python whatsapp_watcher.py <vault_path> <session_path>')
        sys.exit(1)
    
    vault_path = sys.argv[1]
    session_path = sys.argv[2]
    
    watcher = WhatsAppWatcher(vault_path, session_path, poll_interval=30)
    
    # Ensure browser closes on exit
    atexit.register(watcher.close)
    
    print(f'WhatsAppWatcher starting - Session: {session_path}')
    print('Press Ctrl+C to stop')
    
    watcher.run()
