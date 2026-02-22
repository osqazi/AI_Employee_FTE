# Gold Tier Implementation Plan: Autonomous Assistant

**Personal AI Employee – Hackathon 0 Project**  
**Target Tier**: Gold (Full Autonomy)  
**Branch**: `003-gold-tier`  
**Date**: 2026-02-20  
**Status**: Silver Tier COMPLETE (86/86 tasks, 100%)  
**Specs**: Gold Tier specifications (cross-domain integration, Odoo accounting, social media, multiple MCP servers, weekly audits, Ralph Wiggum loop)  
**Goal**: Produce a complete, phased implementation plan for Gold Tier that achieves full autonomy with cross-domain integration, transforming the Personal AI Employee into a fully autonomous FTE capable of managing both personal and business affairs with minimal human intervention while maintaining HITL safety for sensitive actions.

**Estimated Implementation Time**: 40+ hours over 4-6 weeks  
**Phases**: 9 phases (Odoo foundation → Social media → MCP architecture → Audits → Ralph Wiggum → Error recovery → Cross-domain flows → Documentation)

---

## 1. Updated Overall Architecture Sketch

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         AI_Employee_Vault (Gold Tier)                    │
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
│  │  Logs/ (NEW - Gold Tier)                                            │ │
│  │  - audit_log.jsonl (comprehensive action logs)                      │ │
│  │  - ralph_wiggum_log.jsonl (loop iteration logs)                     │ │
│  │  - error_log.jsonl (error recovery logs)                            │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
         ▲                               │
         │                               ▼
┌─────────────────┐     ┌──────────────────────────────────────────┐
│ Dashboard       │     │ Watchers (Silver + Gold)                 │
│ Updater         │     │ - Filesystem (Bronze)                    │
│ (30s refresh)   │     │ - Gmail (Silver, OAuth2)                 │
└─────────────────┘     │ - WhatsApp (Silver, QR)                  │
                        │ - Odoo Transaction (NEW - Gold)          │
                        │ - Social Media (NEW - Gold)              │
                        └──────────────────────────────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────────────────┐
                        │ Ralph Wiggum Loop (NEW - Gold)           │
                        │ - Read vault state                       │
                        │ - Reason about next step                 │
                        │ - Plan actions                           │
                        │ - Execute via skills/MCP                 │
                        │ - Check if done                          │
                        │ - Iterate until complete or max 10 loops │
                        └──────────────────────────────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────────────────┐
                        │ Agent Skills (Silver + Gold)             │
                        │ Silver (7 skills):                       │
                        │  - read_task, plan_action, write_report  │
                        │  - file_operations, create_plan_md       │
                        │  - send_email, schedule_task             │
                        │ Gold (NEW - 10+ skills):                 │
                        │  - odoo_create_invoice                   │
                        │  - odoo_log_transaction                  │
                        │  - odoo_run_audit                        │
                        │  - facebook_post                         │
                        │  - instagram_post                        │
                        │  - twitter_post                          │
                        │  - social_generate_summary               │
                        │  - browser_automate                      │
                        │  - error_recovery                        │
                        │  - Ralph Wiggum orchestrator             │
                        └──────────────────────────────────────────┘
                                         │
                                         ▼
                        ┌──────────────────────────────────────────┐
                        │ MCP Servers (Silver + Gold)              │
                        │ Silver (1 server):                       │
                        │  - email-mcp                             │
                        │ Gold (NEW - 4+ servers):                 │
                        │  - odoo-mcp (JSON-RPC to Odoo v19+)      │
                        │  - social-mcp (Facebook/Instagram/Twitter│
                        │  - browser-mcp (Playwright automation)   │
                        │  - docs-mcp (API documentation lookup)   │
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

**Key Gold Tier Additions**:
1. **Logs/ folder** - Comprehensive audit logging (JSON-lines format)
2. **Ralph Wiggum Loop** - Autonomous multi-step task execution
3. **4+ MCP Servers** - Odoo, Social, Browser, Docs
4. **10+ New Agent Skills** - Odoo API, social posting, browser automation, error recovery
5. **CEO Briefing** - Weekly automated audit reports in Dashboard.md

---

## 2. Final Folder Structure Additions

```
ai-assist-fte/
├── AI_Employee_Vault/               # Obsidian vault (extended for Gold)
│   ├── Dashboard.md                 # Now includes CEO Briefing section
│   ├── Company_Handbook.md          # Updated with Gold Tier rules
│   ├── Inbox/                       # Unprocessed triggers
│   ├── Needs_Action/                # Tasks awaiting processing
│   ├── Pending_Approval/            # Tasks awaiting human approval
│   ├── Approved/                    # Approved tasks ready for execution
│   ├── Done/                        # Completed tasks
│   ├── Plans/                       # Plan.md files for complex tasks
│   ├── Summaries/                   # Weekly summaries (Silver)
│   └── Logs/                        # NEW - Gold Tier audit logs
│       ├── audit_log.jsonl          # All actions with timestamps
│       ├── ralph_wiggum_log.jsonl   # Loop iteration logs
│       └── error_log.jsonl          # Error recovery logs
├── watchers/                        # Watcher scripts (extended)
│   ├── base_watcher.py              # Base class (Silver)
│   ├── file_watcher.py              # Filesystem (Bronze)
│   ├── gmail_watcher.py             # Gmail (Silver)
│   ├── whatsapp_watcher.py          # WhatsApp (Silver)
│   ├── plan_manager.py              # Plan.md management (Silver)
│   ├── orchestrator.py              # HITL orchestrator (Silver)
│   ├── daily_tasks.py               # Daily scheduling (Silver)
│   ├── weekly_summary.py            # Weekly summaries (Silver)
│   ├── odoo_transaction_watcher.py  # NEW - Odoo transaction monitor
│   ├── social_watcher.py            # NEW - Social media monitor
│   └── ralph_wiggum_loop.py         # NEW - Ralph Wiggum loop orchestrator
├── mcp_servers/                     # MCP servers (extended for Gold)
│   ├── email-mcp/                   # Email sending (Silver)
│   │   ├── package.json
│   │   └── index.js
│   ├── odoo-mcp/                    # NEW - Odoo JSON-RPC
│   │   ├── package.json
│   │   ├── index.js
│   │   └── odoo_rpc.js
│   ├── social-mcp/                  # NEW - Social media posting
│   │   ├── package.json
│   │   ├── index.js
│   │   ├── facebook.js
│   │   ├── instagram.js
│   │   └── twitter.js
│   ├── browser-mcp/                 # NEW - Browser automation
│   │   ├── package.json
│   │   ├── index.js
│   │   └── playwright_automate.js
│   ├── docs-mcp/                    # NEW - Documentation lookup
│   │   ├── package.json
│   │   └── index.js
│   └── mcp.json.example             # Configuration template
├── skills/                          # Agent Skills (extended for Gold)
│   ├── read_task.md                 # Silver
│   ├── plan_action.md               # Silver
│   ├── write_report.md              # Silver
│   ├── file_operations.md           # Silver
│   ├── create_plan_md.md            # Silver
│   ├── send_email.md                # Silver
│   ├── schedule_task.md             # Silver
│   ├── odoo_create_invoice.md       # NEW - Gold
│   ├── odoo_log_transaction.md      # NEW - Gold
│   ├── odoo_run_audit.md            # NEW - Gold
│   ├── facebook_post.md             # NEW - Gold
│   ├── instagram_post.md            # NEW - Gold
│   ├── twitter_post.md              # NEW - Gold
│   ├── social_generate_summary.md   # NEW - Gold
│   ├── browser_automate.md          # NEW - Gold
│   ├── error_recovery.md            # NEW - Gold
│   └── ralph_wiggum_orchestrator.md # NEW - Gold
├── scheduling/                      # Scheduling scripts (Silver)
│   ├── daily_tasks.py
│   └── weekly_summary.py
├── tests/                           # Test scripts (extended)
│   ├── test_watchers_silver.py
│   ├── test_gmail_live.py
│   ├── test_whatsapp_live.py
│   ├── test_odoo_mcp.py             # NEW - Gold
│   ├── test_social_mcp.py           # NEW - Gold
│   ├── test_browser_mcp.py          # NEW - Gold
│   └── test_ralph_wiggum.py         # NEW - Gold
└── docs/                            # NEW - Gold Tier documentation
    ├── architecture.md              # System architecture overview
    ├── setup_guide.md               # Gold Tier setup instructions
    ├── api_reference.md             # API documentation
    └── lessons_learned.md           # Lessons learned during implementation
```

**New Folders for Gold Tier**:
- `AI_Employee_Vault/Logs/` - Comprehensive audit logs
- `mcp_servers/odoo-mcp/` - Odoo JSON-RPC server
- `mcp_servers/social-mcp/` - Social media posting server
- `mcp_servers/browser-mcp/` - Browser automation server
- `mcp_servers/docs-mcp/` - Documentation lookup server
- `docs/` - Gold Tier documentation

---

## 3. Phased Roadmap (with Estimated Effort & Dependencies)

### Phase 1: Odoo Foundation & Basic MCP Integration
**Estimated Effort**: 6-8 hours
**Dependencies**: Silver Tier complete, Odoo v19+ installed locally
**Deliverables**:
- odoo-mcp server operational
- odoo_create_invoice skill
- odoo_log_transaction skill
- DEV_MODE flag implementation (prevents real external actions during development)
- 20+ test transactions processed

**Prompt Tests**:
1. Create test invoice via Odoo MCP → Verify invoice in Odoo UI
2. Log test expense → Verify transaction in Odoo accounting
3. Verify DEV_MODE flag functional (prevents real actions when enabled)

### Phase 2: Facebook + Instagram Integration
**Estimated Effort**: 6-8 hours  
**Dependencies**: Phase 1 complete, Facebook Graph API access  
**Deliverables**:
- social-mcp server with Facebook/Instagram support
- facebook_post skill
- instagram_post skill
- Rate limiting implementation (200 requests per 15-minute window)
- 3+ test posts per platform

**Prompt Tests**:
1. Draft Facebook post → Verify in Facebook Business Manager
2. Draft Instagram post → Verify in Instagram Business account
3. Verify rate limiting enforced (no API rate limit errors)

### Phase 3: Twitter/X Integration
**Estimated Effort**: 4-6 hours  
**Dependencies**: Phase 2 complete, Twitter API v2 access  
**Deliverables**:
- social-mcp extended with Twitter support
- twitter_post skill
- 3+ test tweets

**Prompt Tests**:
1. Draft tweet → Verify in Twitter dashboard
2. Generate Twitter summary → Verify format compliance

### Phase 4: Multiple MCP Servers Architecture
**Estimated Effort**: 4-6 hours  
**Dependencies**: Phases 1-3 complete  
**Deliverables**:
- browser-mcp server operational
- docs-mcp server operational
- MCP server orchestration logic
- 4+ MCP servers deployed and tested

**Prompt Tests**:
1. Invoke browser-mcp for form fill → Verify automation success
2. Invoke docs-mcp for API lookup → Verify documentation retrieved

### Phase 5: Weekly Audit & CEO Briefing Generation
**Estimated Effort**: 6-8 hours  
**Dependencies**: Phase 4 complete, Odoo data available  
**Deliverables**:
- CEO Briefing template in Dashboard.md
- Automated weekly audit script
- Revenue/expenses report generation
- Bottlenecks identification logic
- Business_Goals.md template (handbook Section 4)
- Subscription pattern matching for cost optimization

**Prompt Tests**:
1. Run weekly audit → Verify CEO Briefing in Dashboard.md
2. Verify revenue calculations match Odoo data
3. Verify Business_Goals.md created with handbook template
4. Verify subscription audit suggestions generated

### Phase 6: Ralph Wiggum Loop Implementation
**Estimated Effort**: 8-10 hours  
**Dependencies**: Phase 5 complete, all MCP servers operational  
**Deliverables**:
- ralph_wiggum_loop.py orchestrator
- ralph_wiggum_orchestrator skill
- Stop hook pattern per Handbook Section 2D
- Multi-step invoice flow demonstration

**Prompt Tests**:
1. Trigger multi-step invoice flow → Verify Ralph Wiggum loop completes in ≤10 iterations
2. Simulate step failure → Verify self-correction and retry

### Phase 7: Comprehensive Audit Logging & Error Recovery
**Estimated Effort**: 6-8 hours
**Dependencies**: Phase 6 complete
**Deliverables**:
- Logs/ folder with JSON-lines logging
- error_recovery skill
- Retry logic with exponential backoff
- Watchdog process for monitoring critical processes (watchdog.py)
- 95%+ uptime in failure simulation tests

**Prompt Tests**:
1. Simulate API timeout → Verify retry with backoff
2. Verify all actions logged in audit_log.jsonl
3. Verify watchdog.py monitors and restarts critical processes

### Phase 8: Cross-Domain End-to-End Flows
**Estimated Effort**: 8-10 hours  
**Dependencies**: Phases 1-7 complete  
**Deliverables**:
- WhatsApp → Odoo invoice → Social post flow
- Email → Business achievement → Social summary flow
- File drop → Odoo transaction → Categorization flow
- Full HITL approval workflow integration

**Prompt Tests**:
1. Send WhatsApp about client work → Verify Odoo invoice created → Verify social post drafted
2. Drop receipt file → Verify Odoo transaction logged → Verify categorization

### Phase 9: Final Documentation & Demo Preparation
**Estimated Effort**: 6-8 hours  
**Dependencies**: Phases 1-8 complete  
**Deliverables**:
- Architecture overview in docs/architecture.md
- Setup guide in docs/setup_guide.md
- Lessons learned in docs/lessons_learned.md
- Demo script for judges
- README.md updated with Gold Tier features

**Prompt Tests**:
1. Run full Gold Tier acceptance checklist → Verify 100% handbook requirement fulfillment
2. Demo autonomous multi-step task → Verify Ralph Wiggum loop behavior

**Total Estimated Effort**: 54-72 hours over 4-6 weeks

---

## 4. Key Design Decisions & Tradeoffs

### Decision 1: MCP Server Architecture
**Question**: How to structure multiple MCP servers?

**Options Considered**:
- **Option A**: One unified MCP server with domain routes (email, social, odoo, browser)
  - Pros: Single deployment, easier management
  - Cons: Monolithic, harder to maintain, single point of failure
- **Option B**: One MCP server per domain (email-mcp, social-mcp, odoo-mcp, browser-mcp)
  - Pros: Modular, independent deployment, easier debugging
  - Cons: More deployment overhead
- **Option C**: One MCP server per action type (post-mcp, invoice-mcp, automate-mcp)
  - Pros: Fine-grained control
  - Cons: Too many servers, management overhead

**Chosen**: **Option B** - One MCP server per domain  
**Rationale**: Aligns with Constitution Principle III (Modularity), enables independent testing and deployment, matches Silver Tier email-mcp pattern, easier to debug domain-specific issues.

### Decision 2: Ralph Wiggum Loop State Persistence
**Question**: Where and how to persist Ralph Wiggum loop state?

**Options Considered**:
- **Option A**: In-memory only (volatile, lost on restart)
  - Pros: Simple, fast
  - Cons: Loses progress on restart, not suitable for long-running tasks
- **Option B**: In vault markdown files (Plan.md with iteration history)
  - Pros: Persistent, human-readable, audit trail
  - Cons: More I/O overhead
- **Option C**: Separate JSON state files in Logs/ folder
  - Pros: Persistent, structured, queryable
  - Cons: Less human-readable

**Chosen**: **Option B + C hybrid** - Plan.md for human visibility + JSON state in Logs/ralph_wiggum_log.jsonl for audit  
**Rationale**: Balances human visibility with audit requirements, enables recovery from restarts, maintains comprehensive iteration logs.

### Decision 3: Weekly Audit Trigger Mechanism
**Question**: How to trigger weekly audits?

**Options Considered**:
- **Option A**: Cron job + Python orchestrator script
  - Pros: Native OS scheduling, reliable, no external dependencies
  - Cons: Requires cron setup
- **Option B**: Watcher on time file (file changes at scheduled time)
  - Pros: Consistent with watcher pattern
  - Cons: Less reliable, file system dependency
- **Option C**: Claude Code scheduled task
  - Pros: Integrated with existing system
  - Cons: Requires Claude Code always running

**Chosen**: **Option A** - Cron job + Python orchestrator  
**Rationale**: Matches Silver Tier scheduling pattern (daily_tasks.py, weekly_summary.py), reliable OS-native scheduling, easier to debug.

### Decision 4: Social Media Credential Handling
**Question**: How to handle social media credentials and posting approval flow?

**Options Considered**:
- **Option A**: Credentials in .env, posts auto-published
  - Pros: Simple, fully automated
  - Cons: Violates HITL principle, risky
- **Option B**: Credentials in .env, posts require HITL approval via /Pending_Approval
  - Pros: Safe, maintains human control, audit trail
  - Cons: Slightly slower
- **Option C**: Credentials in vault, posts require approval
  - Pros: Centralized
  - Cons: Violates "secrets never in vault" principle

**Chosen**: **Option B** - Credentials in .env, HITL approval required  
**Rationale**: Aligns with Constitution Principle I (HITL for external communications), maintains security (.env not committed), provides audit trail via /Pending_Approval workflow.

### Decision 5: Audit Log Format & Location
**Question**: Format and location of audit logs?

**Options Considered**:
- **Option A**: Daily markdown reports in Logs/ folder
  - Pros: Human-readable
  - Cons: Hard to query, parse
- **Option B**: JSON-lines in Logs/audit_log.jsonl
  - Pros: Machine-parseable, queryable, compact
  - Cons: Less human-readable
- **Option C**: Both markdown summaries + JSON-lines details
  - Pros: Best of both worlds
  - Cons: More storage, duplication

**Chosen**: **Option C** - JSON-lines for comprehensive logging + weekly markdown summaries  
**Rationale**: JSON-lines enables querying and analysis (Constitution Principle I - audit logging), weekly markdown summaries provide human-readable CEO Briefings.

### Decision 6: Error Recovery Strategy
**Question**: How to detect and recover from watcher/MCP failures without losing tasks?

**Options Considered**:
- **Option A**: Retry indefinitely until success
  - Pros: Eventually completes
  - Cons: Can hang forever, no human visibility
- **Option B**: Retry 3x with exponential backoff, then move to /Inbox with alert
  - Pros: Bounded retry time, human alerted for manual intervention
  - Cons: Requires human intervention for persistent failures
- **Option C**: Retry 3x, then skip task silently
  - Pros: No human intervention needed
  - Cons: Tasks lost, no visibility

**Chosen**: **Option B** - 3 retries with backoff, then /Inbox with alert  
**Rationale**: Balances automation with human oversight, ensures no tasks lost, provides visibility into persistent failures via /Inbox alert.

### Decision 7: Task Orchestration Architecture
**Question**: Central "Task Orchestrator" script or let Claude drive everything via vault polling?

**Options Considered**:
- **Option A**: Central orchestrator script (Python) managing all workflows
  - Pros: Centralized control, easier debugging
  - Cons: Single point of failure, more complex
- **Option B**: Claude Code drives everything via vault polling + Ralph Wiggum loop
  - Pros: Decentralized, aligns with agent-driven architecture
  - Cons: Requires Claude Code always available
- **Option C**: Hybrid - orchestrator for scheduled tasks, Claude for on-demand tasks
  - Pros: Best of both worlds
  - Cons: More complex architecture

**Chosen**: **Option C** - Hybrid approach  
**Rationale**: Scheduled tasks (weekly audits, daily summaries) use Python orchestrator (consistent with Silver Tier), on-demand multi-step tasks use Claude Code + Ralph Wiggum loop (aligns with agent-driven architecture).

---

## 5. Ralph Wiggum Loop Implementation Approach

### Overview
The Ralph Wiggum loop implements the Stop hook pattern from Handbook Section 2D for autonomous multi-step task completion. It enables Claude Code to iterate continuously (read-plan-act-check) until tasks are resolved or max iterations (10) reached.

### Architecture
```
┌─────────────────────────────────────────────────────────────┐
│ Ralph Wiggum Loop Orchestrator                              │
│ (ralph_wiggum_loop.py)                                      │
├─────────────────────────────────────────────────────────────┤
│ 1. READ: Load task from /Needs_Action                       │
│ 2. REASON: Analyze task, determine next step                │
│ 3. PLAN: Create/update Plan.md with action items            │
│ 4. ACT: Execute action via Agent Skills + MCP servers       │
│ 5. CHECK: Verify if task complete                           │
│    - If YES: Move to /Done, log success, exit               │
│    - If NO: Increment iteration counter                     │
│      - If iterations < 10: Go to step 2                     │
│      - If iterations >= 10: Move to /Inbox, log failure     │
└─────────────────────────────────────────────────────────────┘
```

### Implementation Details

**State Management**:
- Task state: Stored in Plan.md (YAML frontmatter: status, iteration, total_steps, completed_steps)
- Loop state: Logged in Logs/ralph_wiggum_log.jsonl (JSON-lines: timestamp, iteration, action, outcome)
- Completion markers: Plan.md status field (active → completed/archived)

**Escape Conditions**:
1. **Task Complete**: All Plan.md checkboxes marked [x], status = "completed"
2. **Max Iterations**: iteration_count >= 10, moved to /Inbox with "Max Iterations Exceeded" alert
3. **Human Flag**: User creates flag file in task folder, loop pauses and alerts
4. **Explicit Completion**: Agent writes completion marker in Plan.md (## Completion Report section)

**Agent Skills Integration**:
- High-level reasoning: Claude Code builtin agent
- Concrete actions: Agent Skills (odoo_create_invoice, social_post, etc.)
- MCP calls: Skills invoke appropriate MCP server (odoo-mcp, social-mcp, etc.)

**Example Flow (Invoice Generation)**:
```
Iteration 1:
  READ: WhatsApp message about client project
  REASON: Need to create invoice in Odoo
  PLAN: Create Plan.md with steps (extract details → create invoice → send email → log transaction)
  ACT: Extract client details from WhatsApp message
  CHECK: Details extracted? YES → Continue

Iteration 2:
  READ: Extracted client details
  REASON: Ready to create Odoo invoice
  PLAN: Update Plan.md (step 1 complete)
  ACT: Invoke odoo_create_invoice skill via odoo-mcp
  CHECK: Invoice created? YES → Continue

Iteration 3:
  READ: Invoice created in Odoo
  REASON: Need to send invoice via email
  PLAN: Update Plan.md (step 2 complete)
  ACT: Invoke send_email skill via email-mcp
  CHECK: Email sent? YES → Continue

Iteration 4:
  READ: Email sent
  REASON: Need to log transaction
  PLAN: Update Plan.md (step 3 complete)
  ACT: Invoke odoo_log_transaction skill
  CHECK: Transaction logged? YES → Continue

Iteration 5:
  READ: Transaction logged
  REASON: All steps complete
  PLAN: Mark Plan.md as completed
  ACT: Move task to /Done, log success
  CHECK: Task complete? YES → Exit loop
```

**Logging**:
- Every iteration logged in Logs/ralph_wiggum_log.jsonl
- Fields: timestamp, task_file, iteration, action_taken, outcome, next_step, duration_ms
- Enables post-mortem analysis and debugging

---

## 6. Phase-by-Phase Testing & Prompt Test Examples

### Phase 1: Odoo Foundation
**Prompt Test 1**: Create Test Invoice
```
Trigger: "Create invoice for Client ABC, $5000, project consulting"
Expected:
- Invoice created in Odoo with line items
- Invoice number logged
- Task moved to /Done
- Audit log entry created
```

**Prompt Test 2**: Log Transaction
```
Trigger: "Log expense: Office supplies, $150, category: Operations"
Expected:
- Transaction logged in Odoo accounting
- Category assigned correctly
- Receipt attached (if provided)
- Audit log entry created
```

### Phase 2: Facebook + Instagram
**Prompt Test 1**: Facebook Post
```
Trigger: "Draft Facebook post: Launched new product line, excited to share!"
Expected:
- Post drafted in Facebook Business Manager
- HITL approval requested (/Pending_Approval)
- Post preview included
- Audit log entry created
```

**Prompt Test 2**: Instagram Post
```
Trigger: "Draft Instagram post: Behind the scenes at our office"
Expected:
- Post drafted in Instagram Business account
- Image attached (if provided)
- Hashtags suggested
- HITL approval requested
```

### Phase 3: Twitter/X
**Prompt Test 1**: Tweet Draft
```
Trigger: "Draft tweet: Just closed biggest deal in company history! #milestone"
Expected:
- Tweet drafted in Twitter dashboard
- Character count verified (<280)
- Hashtags included
- HITL approval requested
```

### Phase 4: Multiple MCP Servers
**Prompt Test 1**: Browser Automation
```
Trigger: "Fill contact form on website.com/contact: Name=John, Email=john@example.com, Message=Hello"
Expected:
- Browser-mcp invoked
- Form fields filled correctly
- Form submitted
- Screenshot of confirmation logged
```

**Prompt Test 2**: Documentation Lookup
```
Trigger: "Look up Odoo JSON-RPC API for invoice creation"
Expected:
- Docs-mcp invoked
- API documentation retrieved
- Example code provided
- Relevant endpoints listed
```

### Phase 5: Weekly Audit & CEO Briefing
**Prompt Test 1**: Weekly Audit Run
```
Trigger: "Run weekly audit (simulate Sunday 11:59 PM)"
Expected:
- Revenue report generated from Odoo data
- Expenses report generated
- Bottlenecks identified (delayed tasks)
- CEO Briefing posted in Dashboard.md
```

**Prompt Test 2**: CEO Briefing Format
```
Trigger: "Verify CEO Briefing format"
Expected:
- Revenue section with total amount
- Expenses section with breakdown
- Bottlenecks section with root causes
- Task summary with completion rates
- Actionable insights section
```

### Phase 6: Ralph Wiggum Loop
**Prompt Test 1**: Multi-Step Invoice Flow
```
Trigger: "Process client project: WhatsApp message received, create invoice, send email, log transaction"
Expected:
- Ralph Wiggum loop activated
- Iterations logged in ralph_wiggum_log.jsonl
- Task completed in ≤10 iterations
- All steps verified (invoice created, email sent, transaction logged)
```

**Prompt Test 2**: Self-Correction on Failure
```
Trigger: "Simulate Odoo API timeout during invoice creation"
Expected:
- Loop detects failure
- Self-corrects (retries with backoff)
- Alternative approach attempted if needed
- Task completes or moves to /Inbox with alert
```

### Phase 7: Audit Logging & Error Recovery
**Prompt Test 1**: API Timeout Recovery
```
Trigger: "Simulate Facebook API timeout"
Expected:
- Retry 1: 2s delay
- Retry 2: 4s delay
- Retry 3: 8s delay
- On persistent failure: Move to /Inbox, alert user
- Error logged in error_log.jsonl
```

**Prompt Test 2**: Comprehensive Logging
```
Trigger: "Verify all actions logged"
Expected:
- Audit log entry for every action
- Fields: timestamp, agent, skill, action, outcome, duration_ms
- Logs queryable by date/task/agent
- 90-day retention verified
```

### Phase 8: Cross-Domain Flows
**Prompt Test 1**: WhatsApp → Odoo → Social
```
Trigger: "WhatsApp message: Completed project for Client XYZ, $10000"
Expected:
- WhatsApp watcher detects message
- Odoo invoice created automatically
- Social media summary drafted
- HITL approval requested for social post
- All actions logged
```

**Prompt Test 2**: Email → Business Achievement → Social Summary
```
Trigger: "Email: Won industry award!"
Expected:
- Email watcher detects achievement
- Social media posts drafted (Facebook, Instagram, Twitter)
- HITL approval requested for all platforms
- CEO Briefing updated with achievement
```

### Phase 9: Final Documentation
**Prompt Test 1**: Full Acceptance Checklist
```
Trigger: "Run Gold Tier acceptance checklist"
Expected:
- All 10 SC criteria verified
- 100% handbook requirement fulfillment
- Demo script executable
- Architecture diagram accurate
```

**Prompt Test 2**: Judge Demo
```
Trigger: "Demonstrate autonomous multi-step task for judges"
Expected:
- Ralph Wiggum loop visible in action
- HITL approval workflow demonstrated
- Audit logs queryable
- CEO Briefing generated
- All Gold Tier features operational
```

---

## 7. Final Gold Tier Acceptance Checklist (Mapped to Handbook Deliverables)

### Cross-Domain Integration
- [ ] WhatsApp → Odoo invoice flow tested and operational
- [ ] Email → Social summary flow tested and operational
- [ ] File drop → Odoo transaction flow tested and operational
- [ ] All cross-domain triggers logged in audit_log.jsonl

### Odoo Accounting Integration
- [ ] Odoo MCP server operational with JSON-RPC API
- [ ] 20+ test transactions processed (invoices, expenses)
- [ ] Invoice creation skill functional
- [ ] Transaction logging skill functional
- [ ] Audit running skill functional

### Social Media Management
- [ ] Facebook MCP integration operational (3+ test posts)
- [ ] Instagram MCP integration operational (3+ test posts)
- [ ] Twitter/X MCP integration operational (3+ test posts)
- [ ] Social summary generation functional
- [ ] HITL approval workflow enforced for all posts

### Multiple MCP Servers
- [ ] Email MCP server operational (Silver, verified)
- [ ] Odoo MCP server operational (Gold, NEW)
- [ ] Social MCP server operational (Gold, NEW)
- [ ] Browser MCP server operational (Gold, NEW)
- [ ] Docs MCP server operational (Gold, NEW)
- [ ] Total: 5 MCP servers deployed (exceeds minimum 4)

### Weekly Audit & CEO Briefing
- [ ] Weekly audit scheduled (Sunday 11:59 PM)
- [ ] Revenue report generated from Odoo data
- [ ] Bottlenecks identified from task delays
- [ ] Task summary compiled from completed tasks
- [ ] CEO Briefing posted in Dashboard.md with clear sections

### Error Recovery & Ralph Wiggum Loop
- [ ] Retry logic implemented (3 attempts, exponential backoff)
- [ ] Fallback to manual alert on persistent failure
- [ ] 95%+ uptime achieved in failure simulation tests
- [ ] Ralph Wiggum loop operational per Handbook Section 2D
- [ ] Multi-step autonomy demonstrated (invoice flow in ≤10 iterations)

### Comprehensive Audit Logging
- [ ] Logs/ folder created with JSON-lines format
- [ ] audit_log.jsonl capturing all actions
- [ ] ralph_wiggum_log.jsonl capturing loop iterations
- [ ] error_log.jsonl capturing error recovery attempts
- [ ] Logs queryable for reviews
- [ ] 90-day retention enforced

### Documentation
- [ ] Architecture overview in docs/architecture.md
- [ ] Setup guide in docs/setup_guide.md
- [ ] API reference in docs/api_reference.md
- [ ] Lessons learned in docs/lessons_learned.md
- [ ] README.md updated with Gold Tier features
- [ ] Diagrams included showing component connections

### Agent Skills & Builtin Agents
- [ ] All AI features implemented as Agent Skills (17+ skills total)
- [ ] Builtin agents used for planning/reasoning
- [ ] MCP servers used for documentation lookups
- [ ] Skills documented with Purpose, Inputs, Outputs, Examples

### HITL Safety
- [ ] All sensitive actions require HITL approval
- [ ] /Pending_Approval workflow enforced
- [ ] Approval/denial actions logged
- [ ] No unauthorized posts/payments/communications

---

## 8. Open Questions / Risks / Next Steps

### Open Questions
1. **Odoo API Authentication**: Will Odoo v19+ require additional authentication setup beyond JSON-RPC?
2. **Social Media API Rate Limits**: What are the specific rate limits for Facebook/Instagram/Twitter APIs?
3. **Browser Automation Scope**: Which specific web interactions need automation (forms, data extraction, both)?
4. **CEO Briefing Distribution**: Should CEO Briefing be emailed to stakeholders or just in Dashboard.md?

### Risks & Mitigations
1. **Risk**: Social media API access delayed
   - **Mitigation**: Start with Facebook (easiest), then Instagram, then Twitter
2. **Risk**: Odoo JSON-RPC API complexity
   - **Mitigation**: Use docs-mcp for API lookup, start with simple invoice creation
3. **Risk**: Ralph Wiggum loop infinite iterations
   - **Mitigation**: Hard limit at 10 iterations, comprehensive logging for debugging
4. **Risk**: MCP server deployment complexity
   - **Mitigation**: Deploy one at a time, test thoroughly before next

### Next Steps After Gold
1. **Production Deployment**: Configure cron jobs, background services, monitoring
2. **Gold Tier Live Testing**: Run full end-to-end tests with real data
3. **Platinum Tier Planning**: Cloud deployment, work-zone specialization, synced vaults
4. **Hackathon 0 Submission**: Prepare demo video, architecture diagram, submission form

---

**Plan Status**: ✅ COMPLETE - Ready for `/sp.tasks` to generate implementation task list

**Next Command**: `/sp.tasks` to break this plan into actionable tasks organized by phase and user story
