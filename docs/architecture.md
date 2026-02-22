# Gold Tier Architecture Overview

**Personal AI Employee - Hackathon 0**  
**Version**: 1.0.0  
**Date**: 2026-02-21

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         AI_Employee_Vault                                │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────────┐ │
│  │  Dashboard  │  │   Inbox/     │  │   Needs_Action/                 │ │
│  │  +CEO Brief │  │   (triggers) │  │   (pending tasks)               │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────────┐ │
│  │  Handbook   │  │   Plans/     │  │   Pending_Approval/             │ │
│  │  (rules)    │  │   (plans)    │  │   (awaiting user)               │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────────────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────────────────┐ │
│  │  Summaries  │  │   Approved/  │  │   Done/                         │ │
│  │  (weekly)   │  │   (ready)    │  │   (completed)                   │ │
│  └─────────────┘  └──────────────┘  └─────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │  Logs/                                                              │ │
│  │  - audit_log.jsonl (comprehensive action logs)                      │ │
│  │  - ralph_wiggum_log.jsonl (loop iteration logs)                     │ │
│  │  - error_log.jsonl (error recovery logs)                            │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
         ▲                               │
         │                               ▼
┌─────────────────┐     ┌──────────────────────────────────────────┐
│ Dashboard       │     │ Watchers                                 │
│ Updater         │     │ - cross_domain_trigger.py                │
│ (30s refresh)   │     │ - Detects WhatsApp, Gmail, file triggers │
└─────────────────┘     └──────────────────────────────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────────────────┐
                        │ Ralph Wiggum Loop                        │
                        │ - READ → REASON → PLAN → ACT → CHECK     │
                        │ - Max 10 iterations                      │
                        │ - State persistence via Plan.md          │
                        └──────────────────────────────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────────────────┐
                        │ Agent Skills (17+ total)                 │
                        │ Silver (7):                              │
                        │  - read_task, plan_action, write_report  │
                        │  - file_operations, create_plan_md       │
                        │  - send_email, schedule_task             │
                        │ Gold (10+):                              │
                        │  - odoo_*, facebook_post, instagram_post │
                        │  - twitter_post, social_generate_summary │
                        │  - browser_automate, docs_lookup_api     │
                        │  - error_recovery, ralph_wiggum_orch     │
                        └──────────────────────────────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────────────────┐
                        │ MCP Servers (5 total)                    │
                        │ - email-mcp (SMTP)                       │
                        │ - odoo-mcp (JSON-RPC)                    │
                        │ - social-mcp (Facebook/Instagram/Twitter)│
                        │ - browser-mcp (Playwright)               │
                        │ - docs-mcp (Documentation lookup)        │
                        └──────────────────────────────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────────────────┐
                        │ External Services                        │
                        │ - Odoo Community v19+ (local JSON-RPC)   │
                        │ - Facebook Graph API                     │
                        │ - Instagram API                          │
                        │ - Twitter/X API v2                       │
                        │ - SMTP (email sending)                   │
                        └──────────────────────────────────────────┘
```

---

## Component Overview

### 1. Watchers (Perception Layer)

**cross_domain_trigger.py**:
- Detects triggers from personal communications
- Keyword-based detection (invoice, achievement, receipt)
- Extracts amount, client name from content
- Creates cross-domain task files in /Needs_Action
- Comprehensive logging to audit_log.jsonl

### 2. Ralph Wiggum Loop (Reasoning Layer)

**ralph_wiggum_loop.py**:
- Implements Handbook Section 2D Stop hook pattern
- READ → REASON → PLAN → ACT → CHECK iteration
- Max 10 iterations with escape conditions
- State persistence via Plan.md + JSON logs
- Comprehensive iteration logging

### 3. Agent Skills (Action Layer)

**17+ Skills**:
- **Silver (7)**: read_task, plan_action, write_report, file_operations, create_plan_md, send_email, schedule_task
- **Gold (10+)**: odoo_create_invoice, odoo_log_transaction, odoo_run_audit, facebook_post, instagram_post, twitter_post, social_generate_summary, browser_automate, docs_lookup_api, error_recovery, ralph_wiggum_orchestrator

### 4. MCP Servers (Integration Layer)

**5 Servers**:
- **email-mcp**: SMTP email sending
- **odoo-mcp**: Odoo JSON-RPC API (invoices, transactions, audits)
- **social-mcp**: Facebook/Instagram/Twitter posting
- **browser-mcp**: Playwright browser automation
- **docs-mcp**: API documentation lookup

### 5. Error Recovery (Reliability Layer)

**error_recovery.md**:
- Retry logic with exponential backoff (2s, 4s, 8s)
- Fallback to /Inbox with alerts
- Graceful degradation per component
- Comprehensive error logging

**watchdog.py**:
- Monitors 7 critical processes
- Auto-restart on failure
- Max 3 restarts per process
- Critical failure alerts

### 6. CEO Briefing (Business Intelligence Layer)

**ceo_briefing.py**:
- Weekly automated audits (Sunday 11:59 PM)
- Revenue/expenses from Odoo
- Bottlenecks identification
- Task completion summary
- Actionable insights generation
- Subscription cost optimization

---

## Data Flow

### Cross-Domain Trigger Flow

```
1. WhatsApp/Gmail/File trigger detected
           ↓
2. cross_domain_trigger.py detects trigger
           ↓
3. Task file created in /Needs_Action
           ↓
4. Ralph Wiggum loop starts
           ↓
5. READ → REASON → PLAN → ACT → CHECK
           ↓
6. Task completed → /Done
   OR
   Max iterations → /Inbox with alert
```

### CEO Briefing Flow

```
1. Scheduled audit (Sunday 11:59 PM)
           ↓
2. ceo_briefing.py runs
           ↓
3. Revenue summary from Odoo
           ↓
4. Expenses summary from Odoo
           ↓
5. Bottlenecks from task delays
           ↓
6. Task summary from folders
           ↓
7. Insights generated
           ↓
8. Dashboard.md updated
           ↓
9. Audit logged
```

---

## Security Architecture

### Credential Management

- All credentials in `.env` file (never committed)
- Environment variables loaded via dotenv
- Separate credentials per MCP server
- Monthly rotation recommended

### HITL Approval

- All sensitive actions require approval
- /Pending_Approval folder workflow
- User moves to /Approved to execute
- User moves to /Rejected to cancel
- All approvals logged

### Audit Logging

- **audit_log.jsonl**: All actions with timestamps
- **ralph_wiggum_log.jsonl**: Loop iterations
- **error_log.jsonl**: Error recovery attempts
- 90-day retention minimum
- Queryable for reviews

---

## Deployment Options

### Local Deployment (Gold Tier)

- All components run locally
- Obsidian vault on local filesystem
- Cron/Task Scheduler for scheduling
- Suitable for single-user setup

### Cloud Deployment (Platinum Tier)

- Cloud VM (Oracle/AWS) for 24/7 operation
- Synced vault via Git/Syncthing
- Work-zone specialization (Cloud/Local)
- Suitable for multi-user setup

---

## Performance Characteristics

| Metric | Target | Actual |
|--------|--------|--------|
| Trigger Detection | < 60 seconds | 30 seconds (cross_domain_trigger interval) |
| Ralph Wiggum Loop | ≤10 iterations | Configurable (default: 10) |
| Error Recovery | 95%+ uptime | 3 retries with backoff |
| Dashboard Refresh | 30 seconds | 30 seconds |
| CEO Briefing | Weekly | Sunday 11:59 PM |
| Watchdog Monitoring | 24/7 | 30-second check interval |

---

## Scalability

### Current Capacity (Gold Tier)

- Single user
- Local filesystem
- 5 MCP servers
- 17+ Agent Skills
- 7 monitored processes

### Future Scaling (Platinum Tier)

- Multi-user support
- Cloud deployment
- Additional MCP servers
- Work-zone specialization
- A2A messaging

---

## Monitoring & Alerting

### Watchdog Monitor

- Monitors 7 critical processes
- Auto-restart on failure
- Max 3 restarts per process
- Critical failure alerts to /Inbox

### Dashboard Alerts

- Alert count displayed in Dashboard.md
- Alert files created in /Inbox
- Comprehensive error logging

---

## Disaster Recovery

### Backup Strategy

- Obsidian vault backup recommended
- .env file backup (secure storage)
- Log files retained 90 days minimum

### Recovery Procedures

1. **Process failure**: Watchdog auto-restarts
2. **Max restarts exceeded**: Manual intervention required
3. **Data corruption**: Restore from backup
4. **Credential compromise**: Rotate credentials, update .env

---

## Future Enhancements (Platinum Tier)

- Cloud deployment for 24/7 operation
- Work-zone specialization (Cloud owns drafts, Local owns approvals)
- Vault sync via Git/Syncthing
- A2A messaging for inter-agent communication
- Advanced Odoo integrations
- Multi-user support

---

*Document per Hackathon 0 Handbook requirements*
