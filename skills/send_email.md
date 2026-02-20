# Skill: Send Email

## Purpose
Send emails via SMTP using the email-mcp server. Requires HITL approval before execution for external communications.

## Inputs
- `to`: Recipient email address (string, required)
- `subject`: Email subject (string, required)
- `body`: Email body content, HTML supported (string, required)
- `attachments`: Optional array of attachments (array, optional)
  - `filename`: Attachment filename
  - `path`: Path to attachment file
- `maxRetries`: Maximum retry attempts (number, default: 3)

## Outputs
- `success`: Boolean indicating send success
- `messageId`: Email message ID if successful
- `message`: Status message
- `error`: Error message if failed
- `attempt`: Number of attempts made

## Examples

### Example 1: Send Simple Email

**Input**:
```json
{
  "to": "client@example.com",
  "subject": "Project Update",
  "body": "<h1>Project Status</h1><p>The project is on track.</p>"
}
```

**Output**:
```json
{
  "success": true,
  "messageId": "<abc123@mail.gmail.com>",
  "message": "Email sent to client@example.com",
  "attempt": 1
}
```

### Example 2: Send Email with Attachment

**Input**:
```json
{
  "to": "team@company.com",
  "subject": "Weekly Report",
  "body": "<h1>Weekly Report</h1><p>Please find attached the weekly report.</p>",
  "attachments": [
    {
      "filename": "report.pdf",
      "path": "/path/to/report.pdf"
    }
  ]
}
```

### Example 3: Email with Retry Logic

**Input**:
```json
{
  "to": "client@example.com",
  "subject": "Important Notice",
  "body": "<p>This is an important notification.</p>",
  "maxRetries": 5
}
```

## Dependencies
- email-mcp server running and configured
- SMTP credentials in .env file
- Node.js 18+
- nodemailer package

## Usage

### As Claude Code Skill

```bash
# Invoke send_email skill via Claude Code
claude-code "Use send_email skill to send an email:
- to: client@example.com
- subject: Project Proposal
- body: <h1>Proposal</h1><p>Please review the attached proposal.</p>

Note: This requires HITL approval before sending."
```

### As MCP Tool Call

```javascript
// Call via MCP protocol
{
  "method": "tools/call",
  "params": {
    "name": "send_email",
    "arguments": {
      "to": "client@example.com",
      "subject": "Project Update",
      "body": "<h1>Update</h1><p>Project is on track.</p>"
    }
  }
}
```

## HITL Approval Workflow

**IMPORTANT**: Email sending requires human approval before execution.

1. **Task Created**: Email task appears in /Needs_Action
2. **Plan Created**: Plan.md created with email draft
3. **Approval Required**: Task moved to /Pending_Approval
4. **User Review**: User reviews email content in Plan.md
5. **Approval**: User moves task to /Approved
6. **Send Email**: Orchestrator invokes send_email skill
7. **Completion**: Task moved to /Done with send confirmation

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| SMTP authentication failed | Invalid credentials | Check .env SMTP_USER/SMTP_PASS |
| Connection timeout | Network issue | Check SMTP_HOST/SMTP_PORT |
| Recipient rejected | Invalid email address | Verify recipient email |
| Rate limit exceeded | Too many emails | Wait and retry later |
| Attachment not found | File path incorrect | Verify attachment path |

## SMTP Configuration

Add to `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Gmail App Password

For Gmail, generate an App Password:
1. Go to Google Account > Security
2. Enable 2-Step Verification
3. Generate App Password
4. Use 16-character password in .env

## Retry Logic

Default retry behavior:
- **Attempt 1**: Immediate send
- **Attempt 2**: Wait 2 seconds, retry
- **Attempt 3**: Wait 4 seconds, retry
- **Attempt 4+**: Wait 8+ seconds, retry

Exponential backoff prevents overwhelming SMTP server.

## Security Notes

- ✅ SMTP credentials stored in .env (never commit to git)
- ✅ HITL approval required for all external emails
- ✅ Email content logged for audit trail
- ✅ Attachments verified before sending
- ❌ Never send emails without approval
- ❌ Never expose SMTP credentials in code
