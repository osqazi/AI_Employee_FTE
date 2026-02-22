# Skill: Error Recovery

## Purpose
Handle failures gracefully with retry logic, exponential backoff, fallback to manual alerts, and comprehensive error logging.

## Inputs
- `action`: Action that failed (string, required)
- `error`: Error message/exception (string, required)
- `retry_count`: Current retry attempt (integer, default: 0)
- `max_retries`: Maximum retry attempts (integer, default: 3)
- `context`: Additional context about the failure (object, optional)

## Outputs
- `should_retry`: Boolean indicating if action should be retried
- `retry_delay`: Delay in seconds before retry (integer)
- `fallback_action`: Fallback action if retries exhausted (string)
- `logged`: Boolean indicating if error was logged
- `message`: Status message

## Examples

### Example 1: First Retry

**Input**:
```json
{
  "action": "odoo_create_invoice",
  "error": "Connection timeout",
  "retry_count": 0,
  "max_retries": 3
}
```

**Output**:
```json
{
  "should_retry": true,
  "retry_delay": 2,
  "fallback_action": "Move task to /Inbox with alert",
  "logged": true,
  "message": "Retry 1/3 after 2s delay"
}
```

### Example 2: Max Retries Exhausted

**Input**:
```json
{
  "action": "facebook_post",
  "error": "API rate limit exceeded",
  "retry_count": 3,
  "max_retries": 3
}
```

**Output**:
```json
{
  "should_retry": false,
  "retry_delay": 0,
  "fallback_action": "Move task to /Inbox with alert",
  "logged": true,
  "message": "Max retries (3) exhausted - fallback to manual alert"
}
```

## Dependencies
- Error logging to audit_log.jsonl
- Task folder structure (/Inbox, /Needs_Action, /Pending_Approval)

## Usage

### As Claude Code Skill

```bash
# Invoke error_recovery skill
claude-code "Use error_recovery skill to handle failure:
- action: odoo_create_invoice
- error: Connection timeout
- retry_count: 0

Determine if should retry or fallback to manual."
```

## Retry Logic

### Exponential Backoff

| Retry Attempt | Delay |
|---------------|-------|
| 1 | 2 seconds |
| 2 | 4 seconds |
| 3 | 8 seconds |
| 4+ | Max retries exhausted |

Formula: `delay = 2 ^ retry_count` seconds

### Error Categories

| Error Type | Retry? | Rationale |
|------------|--------|-----------|
| Connection timeout | Yes | Transient network issue |
| API rate limit | Yes | Temporary limit, will reset |
| Authentication failed | No | Credentials issue, needs manual fix |
| Invalid data | No | Data issue, needs manual correction |
| Server error (5xx) | Yes | Server-side transient issue |
| Client error (4xx) | No | Client-side issue, needs manual fix |

## Fallback Actions

When max retries exhausted:

1. **Log error** to error_log.jsonl with full context
2. **Move task** to /Inbox folder
3. **Create alert** file with error details and recommended action
4. **Notify user** via Dashboard.md update

## Logging

All errors logged to `AI_Employee_Vault/Logs/error_log.jsonl`:

```json
{
  "timestamp": "2026-02-21T10:30:00Z",
  "action": "odoo_create_invoice",
  "error": "Connection timeout",
  "retry_count": 3,
  "max_retries": 3,
  "context": {
    "partner_id": 123,
    "amount": 5000.00
  },
  "fallback_action": "Move to /Inbox with alert"
}
```

## Graceful Degradation

When components fail:

| Component | Degradation Strategy |
|-----------|---------------------|
| Odoo API down | Queue invoices locally, process when restored |
| Social media API down | Queue posts, schedule for later |
| Claude Code unavailable | Watchers continue collecting, queue grows |
| Obsidian vault locked | Write to temporary folder, sync when available |

## HITL Alert

When fallback triggered:

1. Task moved to /Inbox
2. Alert file created: `ALERT_[timestamp].md`
3. Alert contains:
   - Original task details
   - Error message and context
   - Retry history
   - Recommended manual action
4. Dashboard.md updated with alert count
