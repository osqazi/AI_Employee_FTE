# Gold Tier Research & Technology Decisions

**Feature**: Gold Tier Autonomous Assistant  
**Branch**: `003-gold-tier`  
**Date**: 2026-02-20  
**Purpose**: Document technology decisions, API integration patterns, and best practices for Gold Tier implementation

---

## 1. Odoo Community v19+ JSON-RPC Integration

**Decision**: Use Odoo's built-in JSON-RPC API for all accounting operations

**Rationale**: 
- Odoo Community v19+ includes native JSON-RPC support
- No additional dependencies required
- Well-documented API for invoice creation, transaction logging, audits
- Aligns with Constitution Principle VI (MCP servers for external actions)

**Alternatives Considered**:
- XML-RPC: Rejected (more verbose, older protocol)
- Direct database access: Rejected (violates encapsulation, risky)
- Odoo ORM via Python: Rejected (requires Odoo server-side modules)

**API Endpoints**:
- `jsonrpc(url, params)` - Base JSON-RPC call
- `/web/dataset/call_kw` - Model method invocation
- Models: `account.move` (invoices), `account.move.line` (invoice lines), `account.journal` (journals)

**Authentication**:
- API Key from Odoo user settings
- Database name, user ID, API key passed in JSON-RPC params

**Example Invoice Creation**:
```python
import requests
import json

def create_invoice(odoo_url, db, api_key, partner_id, amount, lines):
    payload = {
        "jsonrpc": "2.0",
        "method": "call",
        "params": {
            "service": "object",
            "method": "execute",
            "args": [
                db,
                api_key,
                "account.move",
                "create",
                {
                    "move_type": "out_invoice",
                    "partner_id": partner_id,
                    "invoice_line_ids": lines
                }
            ]
        }
    }
    response = requests.post(f"{odoo_url}/web/dataset/call_kw", json=payload)
    return response.json()
```

---

## 2. Social Media API Integration Patterns

### Facebook Graph API
**Decision**: Use Facebook Graph API v18.0 for posting and insights

**Rationale**: Official API, comprehensive features, well-documented

**Authentication**: OAuth 2.0 with Page Access Token

**Endpoints**:
- `POST /{page-id}/feed` - Create post
- `GET /{page-id}/insights` - Get page insights
- `POST /{page-id}/photos` - Upload photo

### Instagram Graph API
**Decision**: Use Instagram Graph API (connected to Facebook Page)

**Rationale**: Official API, business account support, insights available

**Authentication**: OAuth 2.0 with Instagram Business Account Token

**Endpoints**:
- `POST /{ig-user-id}/media` - Create media container
- `POST /{ig-user-id}/media_publish` - Publish media
- `GET /{ig-user-id}/insights` - Get insights

### Twitter/X API v2
**Decision**: Use Twitter API v2 with OAuth 2.0

**Rationale**: Current API version, improved rate limits, comprehensive endpoints

**Authentication**: OAuth 2.0 Bearer Token

**Endpoints**:
- `POST /2/tweets` - Create tweet
- `GET /2/users/:id/tweets` - Get user tweets
- `GET /2/tweets/:id` - Get tweet details

---

## 3. Browser Automation with Playwright

**Decision**: Use Playwright for browser automation (form filling, data extraction)

**Rationale**:
- Cross-browser support (Chromium, Firefox, WebKit)
- Headless mode for automation
- Auto-wait for elements (reliable)
- Screenshot/video recording for debugging

**Alternatives Considered**:
- Selenium: Rejected (slower, more setup required)
- Puppeteer: Rejected (Chrome-only, less flexible)

**Use Cases**:
- Form filling on websites without APIs
- Data extraction from web pages
- Screenshot capture for audit trail
- Automated testing of web flows

**Example Form Fill**:
```python
from playwright.sync_api import sync_playwright

def fill_contact_form(url, name, email, message):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        page.fill('input[name="name"]', name)
        page.fill('input[name="email"]', email)
        page.fill('textarea[name="message"]', message)
        page.click('button[type="submit"]')
        page.wait_for_selector('.confirmation')
        screenshot = page.screenshot()
        browser.close()
        return screenshot
```

---

## 4. Ralph Wiggum Loop Implementation Pattern

**Decision**: Implement as Python orchestrator with Claude Code stop-hook pattern

**Rationale**:
- Handbook Section 2D specifies stop-hook pattern
- Python provides better state management than pure Claude Code
- Enables logging, iteration tracking, error recovery
- Maintains human visibility via Plan.md updates

**Implementation Pattern**:
```python
class RalphWiggumLoop:
    def __init__(self, task_file, max_iterations=10):
        self.task_file = task_file
        self.max_iterations = max_iterations
        self.iteration = 0
        self.plan_md = self.load_plan()
    
    def run(self):
        while self.iteration < self.max_iterations:
            # READ
            task_state = self.read_task_state()
            
            # REASON
            next_action = self.reason_next_step(task_state)
            
            # PLAN
            self.update_plan(next_action)
            
            # ACT
            outcome = self.execute_action(next_action)
            
            # CHECK
            if self.is_task_complete(outcome):
                self.complete_task()
                return
            
            self.iteration += 1
            self.log_iteration()
        
        # Max iterations exceeded
        self.fail_task("Max iterations exceeded")
```

**State Persistence**:
- Plan.md: Human-visible state (checkpoints, completion status)
- ralph_wiggum_log.jsonl: Machine-readable iteration logs
- Task file YAML: Metadata (source, status, priority)

**Escape Conditions**:
1. Task complete (all Plan.md checkboxes [x])
2. Max iterations (10) reached
3. Human flag file created
4. Explicit completion marker written

---

## 5. Audit Logging Strategy (JSON-Lines)

**Decision**: Use JSON-lines format in Logs/ folder for comprehensive audit logging

**Rationale**:
- Machine-parseable for querying and analysis
- Compact storage (one JSON object per line)
- Append-only (immutable audit trail)
- Aligns with Constitution Principle I (audit logging)

**Log Files**:
- `audit_log.jsonl` - All actions with timestamps
- `ralph_wiggum_log.jsonl` - Loop iterations
- `error_log.jsonl` - Error recovery attempts

**Log Entry Schema**:
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
    "amount": 5000.00
  }
}
```

**Querying**:
```python
import json
from datetime import datetime

def query_logs(log_file, start_date, end_date, action=None):
    entries = []
    with open(log_file, 'r') as f:
        for line in f:
            entry = json.loads(line)
            entry_date = entry['timestamp'][:10]
            if start_date <= entry_date <= end_date:
                if action is None or entry['action'] == action:
                    entries.append(entry)
    return entries
```

---

## 6. Error Recovery with Exponential Backoff

**Decision**: Implement retry logic with exponential backoff (2s, 4s, 8s delays)

**Rationale**:
- Handles transient failures (network blips, rate limits)
- Prevents overwhelming external APIs
- Industry-standard pattern for error recovery
- Aligns with Constitution Principle IV (reliability through iteration)

**Implementation Pattern**:
```python
import time
from functools import wraps

def retry_with_backoff(max_retries=3, base_delay=2):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_retries):
                try:
                    return func(*args, **kwargs)
                except TransientError as e:
                    if attempt == max_retries - 1:
                        raise
                    delay = base_delay * (2 ** attempt)  # 2s, 4s, 8s
                    log_error(f"Retry {attempt+1}/{max_retries} after {delay}s: {e}")
                    time.sleep(delay)
            return None
        return wrapper
    return decorator

@retry_with_backoff(max_retries=3, base_delay=2)
def call_odoo_api(endpoint, params):
    response = requests.post(odoo_url, json=params, timeout=10)
    response.raise_for_status()
    return response.json()
```

**Error Classification**:
- **TransientError**: Network timeout, rate limit (retry)
- **PermanentError**: Invalid credentials, malformed request (don't retry, alert human)

**Fallback Strategy**:
1. Retry 3x with backoff
2. On persistent failure: Move task to /Inbox
3. Create alert file with full context
4. Log in error_log.jsonl

---

## 7. MCP Server Architecture (Domain-Based)

**Decision**: One MCP server per domain (email, social, odoo, browser, docs)

**Rationale**:
- Modular deployment and testing
- Independent scaling
- Easier debugging (domain-specific logs)
- Aligns with Constitution Principle III (modularity)

**Server Structure**:
```
mcp_servers/
├── email-mcp/
│   ├── package.json
│   ├── index.js
│   └── smtp_client.js
├── odoo-mcp/
│   ├── package.json
│   ├── index.js
│   └── odoo_rpc.js
├── social-mcp/
│   ├── package.json
│   ├── index.js
│   ├── facebook.js
│   ├── instagram.js
│   └── twitter.js
├── browser-mcp/
│   ├── package.json
│   ├── index.js
│   └── playwright_automate.js
└── docs-mcp/
    ├── package.json
    ├── index.js
    └── api_docs_lookup.js
```

**Communication Pattern**:
- Claude Code invokes tool via MCP protocol
- MCP server processes request
- Response returned to Claude Code
- Action logged in audit_log.jsonl

---

## 8. Weekly CEO Briefing Generation

**Decision**: Automated weekly audit script generates CEO Briefing in Dashboard.md

**Rationale**:
- Transforms raw data into actionable insights
- Minimal time investment for CEO (user)
- Demonstrates business value of AI Employee
- Aligns with Gold Tier success criteria

**Data Sources**:
- Odoo: Revenue, expenses, transactions
- Vault: Completed tasks, delayed tasks
- Logs: Error rates, uptime metrics

**Briefing Sections**:
1. **Executive Summary**: High-level overview
2. **Revenue**: Total revenue, breakdown by client/project
3. **Expenses**: Total expenses, breakdown by category
4. **Profit**: Revenue - Expenses
5. **Bottlenecks**: Delayed tasks, root causes
6. **Task Summary**: Completed, pending, approval-pending
7. **Actionable Insights**: Recommendations for next week

**Generation Schedule**:
- Cron job: Sunday 11:59 PM
- Script: `scheduling/ceo_briefing.py`
- Output: Dashboard.md CEO Briefing section

---

## Summary of Technology Choices

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| Odoo Integration | JSON-RPC API | Native support, well-documented |
| Facebook API | Graph API v18.0 | Official, comprehensive |
| Instagram API | Graph API (Business) | Official, insights available |
| Twitter API | API v2 OAuth 2.0 | Current version, improved limits |
| Browser Automation | Playwright | Cross-browser, reliable, auto-wait |
| Ralph Wiggum Loop | Python orchestrator + stop-hook | Handbook Section 2D compliance |
| Audit Logging | JSON-lines in Logs/ | Machine-parseable, compact, immutable |
| Error Recovery | Exponential backoff (2s, 4s, 8s) | Industry standard, prevents API overload |
| MCP Architecture | One server per domain | Modular, independent testing/deployment |
| CEO Briefing | Automated weekly script | Actionable insights, minimal time investment |

---

**Research Status**: ✅ COMPLETE - All technology decisions documented with rationale and examples

**Next Phase**: Phase 1 Design & Contracts (data-model.md, contracts/, quickstart.md)
