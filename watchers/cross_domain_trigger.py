#!/usr/bin/env python3
"""
Cross-Domain Trigger Detector

Detects triggers from personal domain (WhatsApp, Gmail) and creates cross-domain task files
that trigger business actions (Odoo invoices, social media posts).

Implements cross-domain integration for Gold Tier:
- WhatsApp message → Odoo invoice
- Email achievement → Social media post
- File drop → Odoo transaction logging
"""

import json
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('cross_domain_trigger')


class CrossDomainTrigger:
    """
    Cross-domain trigger detector and task creator.
    
    Detects personal communications that should trigger business actions:
    - WhatsApp messages about client work → Create Odoo invoice task
    - Emails about achievements → Create social media post task
    - File drops with receipts → Create Odoo transaction logging task
    """
    
    def __init__(self, vault_path: str):
        """
        Initialize cross-domain trigger detector.
        
        Args:
            vault_path: Path to AI_Employee_Vault directory
        """
        self.vault_path = Path(vault_path)
        self.needs_action = self.vault_path / 'Needs_Action'
        self.logs = self.vault_path / 'Logs'
        
        # Ensure directories exist
        self.needs_action.mkdir(exist_ok=True)
        self.logs.mkdir(exist_ok=True)
        
        # Keywords for detecting business triggers
        self.invoice_keywords = [
            'invoice', 'payment', 'client', 'project', 'completed', 'delivered',
            'milestone', 'contract', 'deal', 'sale', 'revenue'
        ]
        
        self.achievement_keywords = [
            'achievement', 'award', 'milestone', 'success', 'launched', 'released',
            'completed', 'anniversary', 'celebration', 'recognition'
        ]
        
        self.receipt_keywords = [
            'receipt', 'invoice', 'bill', 'expense', 'purchase', 'payment',
            'transaction', 'order', 'confirmation'
        ]
        
        logger.info(f'CrossDomainTrigger initialized - Vault: {self.vault_path}')
    
    def detect_trigger_type(self, content: str) -> Optional[str]:
        """
        Detect type of cross-domain trigger from content.
        
        Args:
            content: Message/email/file content
            
        Returns:
            Trigger type ('invoice', 'achievement', 'receipt') or None
        """
        content_lower = content.lower()
        
        # Check for invoice triggers
        if any(keyword in content_lower for keyword in self.invoice_keywords):
            return 'invoice'
        
        # Check for achievement triggers
        if any(keyword in content_lower for keyword in self.achievement_keywords):
            return 'achievement'
        
        # Check for receipt triggers
        if any(keyword in content_lower for keyword in self.receipt_keywords):
            return 'receipt'
        
        return None
    
    def extract_amount(self, content: str) -> Optional[float]:
        """
        Extract monetary amount from content.
        
        Args:
            content: Message content
            
        Returns:
            Amount as float, or None if not found
        """
        # Match patterns like $1000, $1,000, $1,000.00
        patterns = [
            r'\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)',
            r'(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(?:dollars?|USD)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content, re.IGNORECASE)
            if match:
                amount_str = match.group(1).replace(',', '')
                try:
                    return float(amount_str)
                except ValueError:
                    continue
        
        return None
    
    def extract_client_name(self, content: str) -> Optional[str]:
        """
        Extract client name from content.
        
        Args:
            content: Message content
            
        Returns:
            Client name, or None if not found
        """
        # Look for patterns like "Client ABC", "for Client", "from Client"
        patterns = [
            r'[Cc]lient\s+([A-Z][a-zA-Z]+)',
            r'[Ff]or\s+([A-Z][a-zA-Z]+)',
            r'[Ff]rom\s+([A-Z][a-zA-Z]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, content)
            if match:
                return match.group(1)
        
        return None
    
    def create_cross_domain_task(self, trigger_type: str, source: str, source_data: Dict[str, Any], content: str) -> Path:
        """
        Create cross-domain task file in Needs_Action folder.
        
        Args:
            trigger_type: Type of trigger ('invoice', 'achievement', 'receipt')
            source: Source of trigger ('whatsapp', 'gmail', 'file_drop')
            source_data: Source-specific data (sender, timestamp, etc.)
            content: Original content
            
        Returns:
            Path to created task file
        """
        timestamp = datetime.now(timezone.utc).isoformat()
        task_filename = f"CROSSDOMAIN_{trigger_type.upper()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        task_path = self.needs_action / task_filename
        
        # Extract additional data based on trigger type
        amount = self.extract_amount(content) if trigger_type in ['invoice', 'receipt'] else None
        client_name = self.extract_client_name(content) if trigger_type == 'invoice' else None
        
        # Determine business action
        if trigger_type == 'invoice':
            business_action = "Create Odoo invoice"
            mcp_server = "odoo-mcp"
            skill = "odoo_create_invoice"
        elif trigger_type == 'achievement':
            business_action = "Draft social media posts"
            mcp_server = "social-mcp"
            skill = "social_generate_summary"
        else:  # receipt
            business_action = "Log transaction in Odoo"
            mcp_server = "odoo-mcp"
            skill = "odoo_log_transaction"
        
        # Create task content
        task_content = f"""---
source: cross_domain_trigger
type: {trigger_type}
trigger_source: {source}
business_action: {business_action}
mcp_server: {mcp_server}
skill: {skill}
status: pending
priority: high
created: {timestamp}
---

# Cross-Domain Trigger: {trigger_type.title()}

**Source**: {source}  
**Detected**: {timestamp}  
**Business Action**: {business_action}

## Original Content

{content}

## Extracted Data

"""
        
        if amount:
            task_content += f"- **Amount**: ${amount:,.2f}\n"
        
        if client_name:
            task_content += f"- **Client**: {client_name}\n"
        
        task_content += f"""
## Required Actions

1. [ ] Review trigger and extracted data
2. [ ] {business_action} via {mcp_server}
3. [ ] Log action in audit_log.jsonl
4. [ ] Move to /Done when complete

## HITL Approval

**Requires Approval**: Yes (sensitive business action)  
**Approval Status**: Pending  
**Move to /Pending_Approval when ready to execute**

---
*Generated by CrossDomainTrigger detector*
"""
        
        task_path.write_text(task_content)
        logger.info(f'Cross-domain task created: {task_path} (type: {trigger_type}, source: {source})')
        
        return task_path
    
    def process_whatsapp_message(self, message: str, sender: str) -> Optional[Path]:
        """
        Process WhatsApp message for cross-domain triggers.
        
        Args:
            message: WhatsApp message content
            sender: Message sender
            
        Returns:
            Path to created task file, or None if no trigger detected
        """
        logger.info(f'Processing WhatsApp message from {sender}')
        
        trigger_type = self.detect_trigger_type(message)
        if not trigger_type:
            logger.info(f'No cross-domain trigger detected in message from {sender}')
            return None
        
        source_data = {
            'sender': sender,
            'platform': 'whatsapp'
        }
        
        task_path = self.create_cross_domain_task(trigger_type, 'whatsapp', source_data, message)
        
        # Log trigger detection
        self.log_trigger('whatsapp', sender, trigger_type, str(task_path))
        
        return task_path
    
    def process_email(self, subject: str, body: str, sender: str) -> Optional[Path]:
        """
        Process email for cross-domain triggers.
        
        Args:
            subject: Email subject
            body: Email body
            sender: Email sender
            
        Returns:
            Path to created task file, or None if no trigger detected
        """
        logger.info(f'Processing email from {sender}')
        
        # Check both subject and body
        content = f"{subject}\n{body}"
        trigger_type = self.detect_trigger_type(content)
        
        if not trigger_type:
            logger.info(f'No cross-domain trigger detected in email from {sender}')
            return None
        
        source_data = {
            'sender': sender,
            'subject': subject,
            'platform': 'gmail'
        }
        
        task_path = self.create_cross_domain_task(trigger_type, 'gmail', source_data, content)
        
        # Log trigger detection
        self.log_trigger('gmail', sender, trigger_type, str(task_path))
        
        return task_path
    
    def process_file_drop(self, file_path: Path, content: str) -> Optional[Path]:
        """
        Process file drop for cross-domain triggers.
        
        Args:
            file_path: Path to dropped file
            content: File content
            
        Returns:
            Path to created task file, or None if no trigger detected
        """
        logger.info(f'Processing file drop: {file_path.name}')
        
        trigger_type = self.detect_trigger_type(content)
        if not trigger_type:
            logger.info(f'No cross-domain trigger detected in {file_path.name}')
            return None
        
        source_data = {
            'filename': file_path.name,
            'filepath': str(file_path),
            'platform': 'file_drop'
        }
        
        task_path = self.create_cross_domain_task(trigger_type, 'file_drop', source_data, content)
        
        # Log trigger detection
        self.log_trigger('file_drop', file_path.name, trigger_type, str(task_path))
        
        return task_path
    
    def log_trigger(self, source: str, sender: str, trigger_type: str, task_path: str) -> None:
        """
        Log cross-domain trigger detection.
        
        Args:
            source: Trigger source (whatsapp, gmail, file_drop)
            sender: Sender/filename
            trigger_type: Type of trigger detected
            task_path: Path to created task file
        """
        log_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'action': 'cross_domain_trigger_detected',
            'source': 'cross_domain_trigger.py',
            'status': 'success',
            'details': {
                'trigger_source': source,
                'sender': sender,
                'trigger_type': trigger_type,
                'task_file': task_path
            }
        }
        
        log_file = self.logs / 'audit_log.jsonl'
        
        try:
            with open(log_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
            logger.info(f'Trigger logged: {source} → {trigger_type} → {task_path}')
        except Exception as e:
            logger.error(f'Error logging trigger: {e}')


if __name__ == '__main__':
    # Test Cross-Domain Trigger
    print('\n=== CROSS-DOMAIN TRIGGER TEST ===')
    
    vault_path = Path('AI_Employee_Vault')
    trigger = CrossDomainTrigger(str(vault_path))
    
    # Test 1: WhatsApp invoice trigger
    print('\n[Test 1] WhatsApp invoice trigger')
    whatsapp_msg = "Hi! The project is completed. Please send invoice for $5000 to Client ABC."
    task1 = trigger.process_whatsapp_message(whatsapp_msg, "+1234567890")
    if task1:
        print(f'[OK] Task created: {task1}')
    else:
        print('[FAIL] No task created')
    
    # Test 2: Email achievement trigger
    print('\n[Test 2] Email achievement trigger')
    email_subject = "Congratulations on the award!"
    email_body = "We're excited to announce you've won the Business Achievement Award!"
    task2 = trigger.process_email(email_subject, email_body, "awards@business.com")
    if task2:
        print(f'[OK] Task created: {task2}')
    else:
        print('[FAIL] No task created')
    
    # Test 3: File drop receipt trigger
    print('\n[Test 3] File drop receipt trigger')
    receipt_content = "Receipt for office supplies purchase. Total: $150.00. Thank you for your payment."
    task3 = trigger.process_file_drop(Path('receipt.pdf'), receipt_content)
    if task3:
        print(f'[OK] Task created: {task3}')
    else:
        print('[FAIL] No task created')
    
    print('\n=== TEST COMPLETE ===')
