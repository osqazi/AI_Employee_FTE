# Skill: Detect Cross-Domain Trigger

## Purpose
Detect cross-domain triggers from personal communications (WhatsApp, Gmail, file drops) that should trigger business actions (Odoo invoices, social media posts, transaction logging).

## Inputs
- `source`: Trigger source ('whatsapp', 'gmail', 'file_drop')
- `content`: Message/email/file content
- `sender`: Sender name/number or filename
- `metadata`: Source-specific metadata (timestamp, platform, etc.)

## Outputs
- `trigger_detected`: Boolean indicating if trigger was detected
- `trigger_type`: Type of trigger ('invoice', 'achievement', 'receipt') or null
- `task_file`: Path to created cross-domain task file (if trigger detected)
- `extracted_data`: Extracted data (amount, client_name, etc.)

## Examples

### Example 1: WhatsApp Invoice Trigger

**Input**:
```json
{
  "source": "whatsapp",
  "content": "Hi! The project is completed. Please send invoice for $5000 to Client ABC.",
  "sender": "+1234567890",
  "metadata": {
    "platform": "whatsapp",
    "timestamp": "2026-02-21T10:30:00Z"
  }
}
```

**Output**:
```json
{
  "trigger_detected": true,
  "trigger_type": "invoice",
  "task_file": "AI_Employee_Vault/Needs_Action/CROSSDOMAIN_INVOICE_20260221_103000.md",
  "extracted_data": {
    "amount": 5000.00,
    "client_name": "ABC"
  }
}
```

### Example 2: Email Achievement Trigger

**Input**:
```json
{
  "source": "gmail",
  "content": "Subject: Congratulations on the award!\n\nWe're excited to announce you've won the Business Achievement Award!",
  "sender": "awards@business.com",
  "metadata": {
    "platform": "gmail",
    "subject": "Congratulations on the award!"
  }
}
```

**Output**:
```json
{
  "trigger_detected": true,
  "trigger_type": "achievement",
  "task_file": "AI_Employee_Vault/Needs_Action/CROSSDOMAIN_ACHIEVEMENT_20260221_103100.md",
  "extracted_data": {
    "achievement_type": "award"
  }
}
```

### Example 3: File Drop Receipt Trigger

**Input**:
```json
{
  "source": "file_drop",
  "content": "Receipt for office supplies purchase. Total: $150.00.",
  "sender": "receipt.pdf",
  "metadata": {
    "platform": "file_drop",
    "filepath": "AI_Employee_Vault/Inbox/receipt.pdf"
  }
}
```

**Output**:
```json
{
  "trigger_detected": true,
  "trigger_type": "receipt",
  "task_file": "AI_Employee_Vault/Needs_Action/CROSSDOMAIN_RECEIPT_20260221_103200.md",
  "extracted_data": {
    "amount": 150.00,
    "category": "office supplies"
  }
}
```

### Example 4: No Trigger Detected

**Input**:
```json
{
  "source": "whatsapp",
  "content": "Hey! Are we still on for lunch tomorrow?",
  "sender": "+0987654321",
  "metadata": {
    "platform": "whatsapp"
  }
}
```

**Output**:
```json
{
  "trigger_detected": false,
  "trigger_type": null,
  "task_file": null,
  "extracted_data": {}
}
```

## Dependencies
- Python 3.13+
- pathlib for file operations
- re for regex pattern matching
- json for logging

## Usage

### As Claude Code Skill

```bash
# Invoke detect_cross_domain_trigger skill
claude-code "Use detect_cross_domain_trigger skill to process WhatsApp message:
- source: whatsapp
- content: 'Hi! The project is completed. Please send invoice for $5000.'
- sender: '+1234567890'

If trigger detected, create cross-domain task file in Needs_Action folder."
```

### As Python Function

```python
from watchers.cross_domain_trigger import CrossDomainTrigger

# Initialize detector
trigger = CrossDomainTrigger('AI_Employee_Vault')

# Process WhatsApp message
task_path = trigger.process_whatsapp_message(
    message="Project completed. Send invoice for $5000 to Client ABC.",
    sender="+1234567890"
)

if task_path:
    print(f'Cross-domain task created: {task_path}')
else:
    print('No trigger detected')
```

## Trigger Detection Logic

### Invoice Triggers
**Keywords**: invoice, payment, client, project, completed, delivered, milestone, contract, deal, sale, revenue

**Action**: Create Odoo invoice task via odoo-mcp

### Achievement Triggers
**Keywords**: achievement, award, milestone, success, launched, released, completed, anniversary, celebration, recognition

**Action**: Create social media post task via social-mcp

### Receipt Triggers
**Keywords**: receipt, invoice, bill, expense, purchase, payment, transaction, order, confirmation

**Action**: Create Odoo transaction logging task via odoo-mcp

## Data Extraction

### Amount Extraction
- Matches patterns: $1000, $1,000, $1,000.00, 1000 dollars
- Returns: float amount or null

### Client Name Extraction
- Matches patterns: "Client ABC", "for Client", "from Client"
- Returns: client name string or null

## Error Handling

| Error | Action |
|-------|--------|
| Content empty | Return trigger_detected: false |
| No keywords matched | Return trigger_detected: false |
| Amount extraction failed | Continue without amount |
| Client extraction failed | Continue without client |
| Task file creation failed | Log error, return null |

## Logging

All trigger detections logged to `AI_Employee_Vault/Logs/audit_log.jsonl`:

```json
{
  "timestamp": "2026-02-21T10:30:00Z",
  "action": "cross_domain_trigger_detected",
  "source": "cross_domain_trigger.py",
  "status": "success",
  "details": {
    "trigger_source": "whatsapp",
    "sender": "+1234567890",
    "trigger_type": "invoice",
    "task_file": "AI_Employee_Vault/Needs_Action/CROSSDOMAIN_INVOICE_20260221_103000.md"
  }
}
```

## HITL Approval

All cross-domain triggers require HITL approval before business action execution:

1. Task created in /Needs_Action with status: pending
2. User reviews extracted data and business action
3. User moves task to /Pending_Approval when ready to execute
4. Orchestrator executes business action via MCP server
5. Task moved to /Done on completion
