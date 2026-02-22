# Gold Tier Data Model

**Feature**: Gold Tier Autonomous Assistant  
**Branch**: `003-gold-tier`  
**Date**: 2026-02-20  
**Purpose**: Define entities, attributes, relationships, and validation rules for Gold Tier components

---

## 1. Cross-Domain Trigger

**Description**: Event from personal domain (WhatsApp, Gmail) that triggers business action (Odoo invoice, social post) with context preservation.

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trigger_id` | string | Yes | Unique identifier (UUID) |
| `source_domain` | enum | Yes | `personal` or `business` |
| `source_type` | enum | Yes | `whatsapp`, `gmail`, `file_drop`, `email` |
| `source_data` | object | Yes | Original trigger data (message, email, file metadata) |
| `triggered_actions` | array | Yes | List of actions to execute (invoice, post, log) |
| `status` | enum | Yes | `pending`, `processing`, `approved`, `completed`, `failed` |
| `created` | ISO8601 | Yes | Trigger timestamp |
| `updated` | ISO8601 | Yes | Last update timestamp |
| `context` | object | No | Additional context (client name, amount, project) |

### Relationships

- **Triggers** → Multiple **Actions** (1-to-many)
- **Associated with** → One **Plan.md** (1-to-1)
- **Logged in** → Multiple **Audit Log Entries** (1-to-many)

### Validation Rules

1. `source_domain` must be `personal` or `business`
2. `source_type` must match actual source (whatsapp, gmail, file_drop, email)
3. `triggered_actions` must have at least one action
4. `status` transitions must follow: pending → processing → approved → completed/failed
5. `context` must include client name for invoice actions

### Example

```json
{
  "trigger_id": "cd-trigger-001",
  "source_domain": "personal",
  "source_type": "whatsapp",
  "source_data": {
    "message": "Completed project for Client ABC, $10000",
    "sender": "+1234567890",
    "timestamp": "2026-02-20T10:30:00Z"
  },
  "triggered_actions": [
    {
      "type": "odoo_create_invoice",
      "params": {
        "client": "Client ABC",
        "amount": 10000,
        "project": "Consulting"
      }
    },
    {
      "type": "social_generate_summary",
      "params": {
        "platform": "facebook",
        "content": "Project completed for Client ABC"
      }
    }
  ],
  "status": "pending",
  "created": "2026-02-20T10:30:00Z",
  "updated": "2026-02-20T10:30:00Z",
  "context": {
    "client_name": "Client ABC",
    "amount": 10000,
    "project": "Consulting"
  }
}
```

---

## 2. Odoo MCP Server

**Description**: MCP server handling Odoo JSON-RPC API calls for invoices, transactions, audits using authentication tokens.

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `server_id` | string | Yes | Unique identifier (odoo-mcp) |
| `odoo_url` | string | Yes | Odoo instance URL (e.g., http://localhost:8069) |
| `database` | string | Yes | Odoo database name |
| `api_key` | string | Yes | User API key (from Odoo user settings) |
| `models` | array | Yes | Supported Odoo models (account.move, account.move.line, etc.) |
| `status` | enum | Yes | `active`, `inactive`, `error` |
| `last_health_check` | ISO8601 | No | Last health check timestamp |

### Supported Operations

1. **Create Invoice** (`account.move.create`)
   - Input: partner_id, amount, line_items
   - Output: invoice_id, invoice_number

2. **Log Transaction** (`account.move.create` with type='entry')
   - Input: account_id, amount, description, category
   - Output: transaction_id

3. **Run Audit** (`account.move.search_read` with filters)
   - Input: date_range, filters
   - Output: list of transactions, totals

### Validation Rules

1. `odoo_url` must be valid URL
2. `database` must be non-empty string
3. `api_key` must be valid Odoo API key
4. `models` must include at least `account.move`
5. Health check must pass every 5 minutes

### Example Configuration

```json
{
  "server_id": "odoo-mcp",
  "odoo_url": "http://localhost:8069",
  "database": "odoo_db",
  "api_key": "abc123xyz",
  "models": [
    "account.move",
    "account.move.line",
    "account.journal",
    "res.partner"
  ],
  "status": "active",
  "last_health_check": "2026-02-20T10:30:00Z"
}
```

---

## 3. Social MCP Server

**Description**: MCP server managing Facebook Graph API, Instagram API, Twitter/X API for posting and summary generation.

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `server_id` | string | Yes | Unique identifier (social-mcp) |
| `platforms` | array | Yes | Supported platforms (facebook, instagram, twitter) |
| `credentials` | object | Yes | Platform-specific credentials (tokens, secrets) |
| `rate_limits` | object | No | Rate limit tracking per platform |
| `status` | enum | Yes | `active`, `inactive`, `error` |

### Platform-Specific Configuration

**Facebook**:
- `page_id`: Facebook Page ID
- `access_token`: Page Access Token
- `api_version`: Graph API version (v18.0)

**Instagram**:
- `ig_user_id`: Instagram Business Account ID
- `access_token`: Instagram Access Token
- `api_version`: Graph API version (v18.0)

**Twitter/X**:
- `bearer_token`: Twitter API v2 Bearer Token
- `api_version`: API version (v2)

### Supported Operations

1. **Create Post** (per platform)
   - Input: content, image (optional), hashtags (optional)
   - Output: post_id, post_url

2. **Generate Summary**
   - Input: activity_data (tasks completed, milestones)
   - Output: summary_text, suggested_hashtags

3. **Get Insights**
   - Input: date_range, metrics
   - Output: engagement_data, reach_data

### Validation Rules

1. `platforms` must have at least one platform
2. `credentials` must include valid tokens for each platform
3. `rate_limits` must track requests per 15-minute window
4. Posts must require HITL approval before publishing

### Example Configuration

```json
{
  "server_id": "social-mcp",
  "platforms": ["facebook", "instagram", "twitter"],
  "credentials": {
    "facebook": {
      "page_id": "123456789",
      "access_token": "EAAB...",
      "api_version": "v18.0"
    },
    "instagram": {
      "ig_user_id": "987654321",
      "access_token": "IGQVJ...",
      "api_version": "v18.0"
    },
    "twitter": {
      "bearer_token": "AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA...",
      "api_version": "v2"
    }
  },
  "rate_limits": {
    "facebook": {"requests": 0, "limit": 200, "window_reset": "2026-02-20T10:45:00Z"},
    "instagram": {"requests": 0, "limit": 200, "window_reset": "2026-02-20T10:45:00Z"},
    "twitter": {"requests": 0, "limit": 300, "window_reset": "2026-02-20T10:45:00Z"}
  },
  "status": "active"
}
```

---

## 4. Browser MCP Server

**Description**: MCP server providing browser automation (Playwright-based) for web interactions, form filling, data extraction.

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `server_id` | string | Yes | Unique identifier (browser-mcp) |
| `browser_type` | enum | Yes | `chromium`, `firefox`, `webkit` |
| `headless` | boolean | Yes | Run in headless mode |
| `timeout_ms` | integer | No | Default timeout (30000ms) |
| `status` | enum | Yes | `active`, `inactive`, `error` |

### Supported Operations

1. **Fill Form**
   - Input: url, fields (selector-value pairs), submit_selector
   - Output: success, screenshot, confirmation_text

2. **Extract Data**
   - Input: url, selectors (list of CSS selectors)
   - Output: extracted_data (key-value pairs)

3. **Navigate & Screenshot**
   - Input: url, wait_for (selector or timeout)
   - Output: screenshot, page_title

### Validation Rules

1. `browser_type` must be chromium, firefox, or webkit
2. `timeout_ms` must be between 5000 and 60000
3. All operations must log screenshots for audit trail
4. Sensitive fields (passwords, credit cards) must not be logged

### Example Configuration

```json
{
  "server_id": "browser-mcp",
  "browser_type": "chromium",
  "headless": true,
  "timeout_ms": 30000,
  "status": "active"
}
```

---

## 5. CEO Briefing

**Description**: Weekly report in Dashboard.md with revenue, expenses, bottlenecks, task summaries, and actionable insights.

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `briefing_id` | string | Yes | Unique identifier (CEO-YYYY-Www) |
| `week_start` | date | Yes | Week start date (Monday) |
| `week_end` | date | Yes | Week end date (Sunday) |
| `generated` | ISO8601 | Yes | Briefing generation timestamp |
| `revenue` | object | Yes | Revenue data (total, by_client, by_project) |
| `expenses` | object | Yes | Expenses data (total, by_category) |
| `profit` | number | Yes | Revenue - Expenses |
| `bottlenecks` | array | Yes | List of delayed tasks with root causes |
| `task_summary` | object | Yes | Task statistics (completed, pending, approval_pending) |
| `insights` | array | No | Actionable recommendations for next week |

### Sections

1. **Executive Summary**: High-level overview (2-3 sentences)
2. **Revenue**: Total revenue, breakdown by client/project
3. **Expenses**: Total expenses, breakdown by category
4. **Profit**: Net profit (Revenue - Expenses)
5. **Bottlenecks**: Delayed tasks, root causes, impact
6. **Task Summary**: Completed, pending, approval-pending counts
7. **Actionable Insights**: Recommendations for next week

### Validation Rules

1. `week_start` must be Monday, `week_end` must be Sunday
2. `revenue.total` must match Odoo data
3. `expenses.total` must match Odoo data
4. `profit` must equal `revenue.total - expenses.total`
5. `bottlenecks` must include at least root cause for each delay
6. Generated every Sunday at 11:59 PM via scheduling

### Example

```markdown
# CEO Briefing - Week 2026-W08

**Week**: 2026-02-17 to 2026-02-23  
**Generated**: 2026-02-23T23:59:59Z

## Executive Summary

Strong week with revenue ahead of target. One bottleneck identified in client onboarding process.

## Revenue

| Client | Project | Amount |
|--------|---------|--------|
| Client ABC | Consulting | $10,000 |
| Client XYZ | Development | $5,000 |
| **Total** | | **$15,000** |

## Expenses

| Category | Amount |
|----------|--------|
| Office Supplies | $150 |
| Software Licenses | $300 |
| **Total** | **$450** |

## Profit

**Net Profit**: $14,550 ($15,000 - $450)

## Bottlenecks

| Task | Expected | Actual | Delay | Root Cause |
|------|----------|--------|-------|------------|
| Client Onboarding | 2 days | 5 days | +3 days | Waiting for client documents |

## Task Summary

| Status | Count |
|--------|-------|
| Completed | 15 |
| Pending | 5 |
| Awaiting Approval | 2 |

## Actionable Insights

1. Automate client document collection to reduce onboarding delays
2. Follow up with Client ABC on outstanding payment ($10,000 due in 7 days)
3. Schedule team meeting to review Q1 goals

---
*Generated by Gold Tier Autonomous Assistant*
```

---

## 6. Ralph Wiggum Loop

**Description**: Autonomous multi-step task execution pattern (read-plan-act-check iteration) using Stop hook until task resolution or max iterations (10).

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `loop_id` | string | Yes | Unique identifier (ralph-YYYYMMDD-NNN) |
| `task_file` | string | Yes | Path to task file in /Needs_Action |
| `plan_md` | string | Yes | Path to associated Plan.md |
| `max_iterations` | integer | Yes | Maximum iterations (default: 10) |
| `current_iteration` | integer | Yes | Current iteration number |
| `status` | enum | Yes | `active`, `completed`, `failed`, `max_iterations_exceeded` |
| `started` | ISO8601 | Yes | Loop start timestamp |
| `completed` | ISO8601 | No | Loop completion timestamp |
| `outcome` | string | No | Final outcome description |

### Iteration Schema

Each iteration logged in `Logs/ralph_wiggum_log.jsonl`:

```json
{
  "timestamp": "2026-02-20T10:30:00Z",
  "loop_id": "ralph-20260220-001",
  "iteration": 1,
  "phase": "READ",
  "action": "Load task from /Needs_Action/whatsapp_client_abc.md",
  "outcome": "Task loaded successfully",
  "next_phase": "REASON",
  "duration_ms": 50
}
```

### State Transitions

```
active → completed (task complete, all checkboxes [x])
active → failed (error unrecoverable)
active → max_iterations_exceeded (iteration >= 10)
```

### Validation Rules

1. `max_iterations` must be between 1 and 10
2. `current_iteration` must increment by 1 each iteration
3. Each iteration must log all 5 phases (READ, REASON, PLAN, ACT, CHECK)
4. On completion, Plan.md status must be "completed"
5. On failure, task must move to /Inbox with alert

### Example Log

```jsonl
{"timestamp":"2026-02-20T10:30:00Z","loop_id":"ralph-20260220-001","iteration":1,"phase":"READ","action":"Load task","outcome":"Success","duration_ms":50}
{"timestamp":"2026-02-20T10:30:01Z","loop_id":"ralph-20260220-001","iteration":1,"phase":"REASON","action":"Determine next step","outcome":"Create invoice","duration_ms":100}
{"timestamp":"2026-02-20T10:30:02Z","loop_id":"ralph-20260220-001","iteration":1,"phase":"PLAN","action":"Update Plan.md","outcome":"Step 1 added","duration_ms":75}
{"timestamp":"2026-02-20T10:30:03Z","loop_id":"ralph-20260220-001","iteration":1,"phase":"ACT","action":"Invoke odoo_create_invoice","outcome":"Invoice created","duration_ms":1250}
{"timestamp":"2026-02-20T10:30:04Z","loop_id":"ralph-20260220-001","iteration":1,"phase":"CHECK","action":"Verify invoice","outcome":"Success, continue","duration_ms":50}
```

---

## 7. Audit Log Entry

**Description**: Comprehensive log entry with timestamp, agent/skill used, action type, outcome, duration, and error details (if any).

### Attributes

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | ISO8601 | Yes | When operation occurred (UTC) |
| `action` | string | Yes | What operation was performed |
| `source` | string | Yes | Which component performed it (watcher, mcp, skill) |
| `status` | enum | Yes | `success`, `failure`, `pending`, `skipped` |
| `duration_ms` | integer | Yes | Operation duration in milliseconds |
| `user` | string | Yes | `system` or user ID |
| `agent` | string | No | Agent used (claude_code, builtin_agent) |
| `skill` | string | No | Skill invoked (odoo_create_invoice, etc.) |
| `mcp_server` | string | No | MCP server used (odoo-mcp, social-mcp) |
| `details` | object | No | Additional context (invoice_id, post_url, error_message) |

### Log Files

1. **audit_log.jsonl**: All actions
2. **ralph_wiggum_log.jsonl**: Loop iterations
3. **error_log.jsonl**: Error recovery attempts

### Validation Rules

1. `timestamp` must be ISO8601 with timezone
2. `status` must be success, failure, pending, or skipped
3. `duration_ms` must be non-negative integer
4. `details` must include error_message for failures
5. Logs must be append-only (immutable)
6. 90-day retention enforced

### Example

```json
{
  "timestamp": "2026-02-20T10:30:00Z",
  "action": "odoo_create_invoice",
  "source": "ralph_wiggum_loop",
  "status": "success",
  "duration_ms": 1250,
  "user": "system",
  "agent": "claude_code",
  "skill": "odoo_create_invoice",
  "mcp_server": "odoo-mcp",
  "details": {
    "invoice_id": "INV/2026/0001",
    "partner_id": 123,
    "amount": 5000.00,
    "client": "Client ABC"
  }
}
```

---

## Entity Relationships Diagram

```
┌────────────────────┐
│ Cross-Domain       │
│ Trigger            │
└─────────┬──────────┘
          │ 1
          │
          │ triggers
          │
          │ *
┌─────────▼──────────┐
│ Action             │
│ (invoice, post,    │
│  log, etc.)        │
└─────────┬──────────┘
          │
          │ executed by
          │
          │ *
┌─────────▼──────────┐
│ Agent Skill        │
│ (odoo_create_      │
│  invoice, etc.)    │
└─────────┬──────────┘
          │
          │ invokes
          │
          │ *
┌─────────▼──────────┐
│ MCP Server         │
│ (odoo-mcp,         │
│  social-mcp, etc.) │
└─────────┬──────────┘
          │
          │ calls
          │
          │ *
┌─────────▼──────────┐
│ External Service   │
│ (Odoo, Facebook,   │
│  Twitter, etc.)    │
└────────────────────┘

┌────────────────────┐
│ Ralph Wiggum Loop  │
└─────────┬──────────┘
          │ 1
          │
          │ manages
          │
          │ 1
┌─────────▼──────────┐
│ Plan.md            │
└────────────────────┘

┌────────────────────┐
│ Audit Log Entry    │
└─────────┬──────────┘
          │ *
          │
          │ logs
          │
          │ *
┌─────────▼──────────┐
│ All Entities       │
└────────────────────┘
```

---

## Validation Summary

| Entity | Validation Method |
|--------|-------------------|
| Cross-Domain Trigger | JSON schema validation + business logic checks |
| Odoo MCP Server | Connection test + health check every 5 minutes |
| Social MCP Server | Token validation + rate limit tracking |
| Browser MCP Server | Test automation script + screenshot verification |
| CEO Briefing | Data consistency check (Odoo totals match) |
| Ralph Wiggum Loop | Iteration counter + completion marker verification |
| Audit Log Entry | JSON schema validation + append-only verification |

---

**Data Model Status**: ✅ COMPLETE - All 7 Gold Tier entities defined with attributes, relationships, validation rules, and examples

**Next Phase**: Phase 1 Contracts (API specifications for MCP servers)
