# Company Handbook

## Watcher Documentation

### Filesystem Watcher (Bronze Tier)
- **Purpose**: Monitors `AI_Employee_Vault/Inbox/` for new `.md` files
- **Trigger**: New markdown file created in Inbox folder
- **Output**: Task file created in `Needs_Action/` with source: `file_watcher`
- **Polling Interval**: 5 seconds
- **File Pattern**: `*.md`

### Gmail Watcher (Silver Tier)
- **Purpose**: Monitors Gmail inbox for new unread important emails
- **Trigger**: New email with "unread" and "important" labels
- **Output**: Task file created in `Needs_Action/` with source: `gmail_watcher`
- **Polling Interval**: 120 seconds (2 minutes)
- **Authentication**: OAuth2 via Google Cloud Console
- **Credentials**: Stored in `credentials.json` (never commit to version control)
- **Keywords**: Automatically flags emails marked as important by Gmail

### WhatsApp Watcher (Silver Tier)
- **Purpose**: Monitors WhatsApp Web for new messages containing keywords
- **Trigger**: New message containing: urgent, asap, invoice, payment, help, important
- **Output**: Task file created in `Needs_Action/` with source: `whatsapp_watcher`
- **Polling Interval**: 30 seconds
- **Authentication**: WhatsApp Web session (QR code scan on first run)
- **Session Storage**: `whatsapp_session/` folder (never commit to version control)
- **Note**: Uses Playwright browser automation; be aware of WhatsApp's terms of service

### All Watchers Share:
- **BaseWatcher Pattern**: Consistent interface across all watchers
- **DEV_MODE Support**: Dry-run capability for testing without execution
- **Structured Logging**: All operations logged to `watchers/logs/operations.log`
- **Error Handling**: Exponential backoff, graceful degradation
- **Task File Schema**: YAML frontmatter with source, timestamp, status, priority

---

## Rules of Engagement

1. All actions must be logged with timestamps in structured JSON format
2. Sensitive actions (financial, legal, external communications) require human approval before execution
3. Failed operations must be moved to Inbox for manual review
4. Task files must follow YAML frontmatter schema (source, timestamp, status, priority)
5. All autonomous actions must be traceable through audit logs

## Operational Guidelines

- Process tasks in order of priority (high → medium → low)
- Update task status field as you progress through the workflow
- Write detailed completion reports for all tasks
- Never modify files outside the vault without explicit permission
- When in doubt, escalate to Inbox for human review
- Maintain 99%+ consistency in task processing

## Constraints

- No external API calls without explicit user configuration
- No secrets (.env, tokens) stored in vault or committed to version control
- No automatic execution of financial or legal actions without HITL approval
- No email or social media posting without human approval
- Local-first: all data stored in Obsidian vault by default

## Escalation Procedures

### When to Escalate to Inbox

- Task file is malformed or missing required fields
- Required information is missing or ambiguous
- Processing fails multiple times (max 3 retries)
- Action requires human judgment or ethical consideration
- File cannot be parsed or understood

### How to Escalate

1. Log the error with structured logging (include error type and details)
2. Move task file to `Inbox/` folder
3. Update Dashboard with error count
4. Optionally: Add error details to the task file's Processing Notes section

## Approval Workflow

### Actions Requiring Approval

- **Financial**: Payments, invoices, purchases, refunds
- **Legal**: Contracts, agreements, terms of service
- **External Communications**: Emails, social media posts, messages
- **Data Changes**: Deleting or modifying important records

### Approval Process

1. Claude Code moves file from `Needs_Action/` to `Pending_Approval/`
2. User reviews task file and completion plan
3. User moves file back to `Needs_Action/` to approve
4. Claude Code continues processing
5. If user disagrees, move to `Inbox/` for manual handling

## System Components

### Watcher (`file_watcher.py`)
- Monitors Inbox directory for new files
- Creates task files in Needs_Action folder
- Logs all operations with structured logging

### Dashboard Updater (`dashboard_updater.py`)
- Refreshes Dashboard.md every 30 seconds
- Counts tasks by status
- Shows recent activity and system health

### Agent Skills
- **read_task**: Parse task files and extract metadata
- **plan_action**: Create action plans from task descriptions
- **write_report**: Write completion reports
- **file_operations**: Move files between folders

## Contact & Support

For issues or questions:
1. Check the [Dashboard](./Dashboard.md) for system status
2. Review operations.log in `watchers/logs/`
3. Escalate to Inbox if automated processing fails
4. Consult the project README for setup and troubleshooting
