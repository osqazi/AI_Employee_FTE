# Silver Tier Detailed Implementation Plan

**Personal AI Employee – Hackathon 0 Project**  
**Target Tier**: Silver (Functional Assistant)  
**Branch**: `002-silver-tier`  
**Date**: 2026-02-17  
**Status**: Bronze Tier completed (filesystem watcher, Obsidian vault, Dashboard.md, Company_Handbook.md, basic folders)  
**Specs**: Silver Tier specifications document (Gmail + WhatsApp watchers selected)  
**Goal**: Produce a complete, ready-to-execute implementation plan that turns the existing Silver Tier specs into a working Functional Assistant in 20-30 hours

---

## 1. Silver Tier Overview & Mapping to Handbook

### Bronze Tier Foundation (Completed)
- ✅ Obsidian vault with Dashboard.md and Company_Handbook.md
- ✅ Basic folder structure (/Inbox, /Needs_Action, /Pending_Approval, /Done)
- ✅ Filesystem watcher script operational
- ✅ Agent Skills (SKILL.md files) for basic operations
- ✅ Structured logging in JSON-lines format

### Silver Tier Enhancements (To Implement)
| Feature | Bronze | Silver | Handbook Reference |
|---------|--------|--------|-------------------|
| **Watchers** | 1 (Filesystem) | 3 (Filesystem + Gmail + WhatsApp) | Tier Progression, Ch. 4 |
| **MCP Servers** | None | 1 (email-mcp) | MCP Integration, Ch. 6 |
| **Reasoning Loop** | Basic | Plan.md with checkboxes | Claude Code Loop, Ch. 5 |
| **HITL Workflow** | Basic folders | Full /Pending_Approval → /Approved pattern | HITL Pattern, Ch. 7 |
| **Scheduling** | None | cron / Task Scheduler | Automation, Ch. 8 |
| **Agent Skills** | 4 basic | 7+ (including new capabilities) | Skills Pattern, Ch. 5 |

### Constitution Alignment
| Principle | Silver Tier Compliance |
|-----------|----------------------|
| I. Autonomy with HITL | ✅ Full HITL workflow via /Pending_Approval → /Approved |
| II. Local-First Privacy | ✅ All data in Obsidian vault; API credentials in .env |
| III. Modularity | ✅ BaseWatcher pattern, Agent Skills as SKILL.md |
| IV. Reliability | ⚠️ Partial (graceful degradation; Ralph Wiggum in Gold) |
| V. Phase-by-Phase | ✅ 7 phases with Prompt Tests after each |
| VI. MCP Servers | ✅ email-mcp configured and operational |

---

## 2. Updated Architecture Sketch

```mermaid
graph TB
    subgraph "AI_Employee_Vault"
        Dashboard[Dashboard.md]
        Handbook[Company_Handbook.md]
        Inbox[/Inbox/]
        NeedsAction[/Needs_Action/]
        PendingApproval[/Pending_Approval/]
        Approved[/Approved/]
        Rejected[/Rejected/]
        Plans[/Plans/]
        Done[/Done/]
    end
    
    subgraph "Watchers"
        FileWatcher[Filesystem Watcher<br/>Bronze - Existing]
        GmailWatcher[Gmail Watcher<br/>NEW - Playwright]
        WhatsAppWatcher[WhatsApp Watcher<br/>NEW - Playwright]
        BaseWatcher[BaseWatcher<br/>Abstract Class]
    end
    
    subgraph "Claude Code Reasoning"
        ReadTask[read_task Skill]
        PlanAction[plan_action Skill]
        CreatePlanMD[create_plan_md Skill<br/>NEW]
    end
    
    subgraph "MCP Servers"
        EmailMCP[email-mcp<br/>NEW]
    end
    
    subgraph "Scheduling"
        DailyTasks[daily_tasks.py<br/>NEW]
        WeeklySummary[weekly_summary.py<br/>NEW]
    end
    
    FileWatcher --> NeedsAction
    GmailWatcher --> NeedsAction
    WhatsAppWatcher --> NeedsAction
    BaseWatcher <|-- FileWatcher
    BaseWatcher <|-- GmailWatcher
    BaseWatcher <|-- WhatsAppWatcher
    
    NeedsAction --> ReadTask
    ReadTask --> PlanAction
    PlanAction --> CreatePlanMD
    CreatePlanMD --> Plans
    
    Plans --> EmailMCP
    EmailMCP --> Approved
    
    PendingApproval --> Approved
    PendingApproval --> Rejected
    Approved --> EmailMCP
    EmailMCP --> Done
    
    DailyTasks --> NeedsAction
    WeeklySummary --> NeedsAction
```

---

## 3. Section Structure of the Implementation

```
specs/002-silver-tier/
├── spec.md                    # Silver Tier specification (COMPLETE)
├── plan.md                    # This implementation plan
├── research.md                # Phase 0: API integration patterns (TO CREATE)
├── data-model.md              # Phase 1: Entity definitions (TO CREATE)
├── quickstart.md              # Phase 1: Setup instructions (TO CREATE)
├── contracts/                 # Phase 1: Agent Skill interfaces (TO CREATE)
│   └── skill-template.md
└── tasks.md                   # Phase 2: Implementation tasks (TO CREATE)

ai-assist-fte/ (repository root)
├── AI_Employee_Vault/         # Obsidian vault (existing from Bronze)
│   ├── Dashboard.md
│   ├── Company_Handbook.md    # UPDATE for Silver
│   ├── Inbox/
│   ├── Needs_Action/
│   ├── Pending_Approval/
│   ├── Approved/              # NEW
│   ├── Rejected/              # NEW
│   ├── Plans/                 # NEW
│   └── Done/
├── watchers/
│   ├── base_watcher.py        # NEW - Abstract class
│   ├── file_watcher.py        # REFACTOR - Extend BaseWatcher
│   ├── gmail_watcher.py       # NEW - Playwright + Gmail API
│   ├── whatsapp_watcher.py    # NEW - Playwright + WhatsApp
│   └── logs/
│       └── operations.log
├── mcp_servers/
│   └── email-mcp/             # NEW - Email MCP server
│       ├── package.json
│       ├── index.js
│       └── README.md
├── skills/                    # Agent Skills (SKILL.md files)
│   ├── read_task.md           # Bronze (existing)
│   ├── plan_action.md         # Bronze (existing)
│   ├── write_report.md        # Bronze (existing)
│   ├── file_operations.md     # Bronze (existing)
│   ├── create_plan_md.md      # NEW
│   ├── send_email.md          # NEW
│   └── schedule_task.md       # NEW
├── scheduling/
│   ├── daily_tasks.py         # NEW
│   └── weekly_summary.py      # NEW
└── tests/
    ├── test_watchers.py       # NEW
    ├── test_mcp.py            # NEW
    └── fixtures/
```

---

## 4. Implementation Approach

### Research-Concurrent Methodology
**DO NOT** research everything upfront. Instead:

1. **Start coding phase** → Encounter need for Gmail API syntax → **Invoke MCP server** → Fetch current Python Gmail API docs → Implement → Continue
2. **Writing watcher** → Need Playwright authentication pattern → **Invoke MCP server** → Fetch Playwright docs → Implement → Continue
3. **Configuring MCP** → Need mcp.json schema → **Invoke MCP server** → Fetch official MCP templates → Configure → Continue

### MCP Server Usage at Every Step
| When You Need | Invoke MCP Server For |
|---------------|----------------------|
| Python 3.13 syntax | Official Python docs |
| Playwright authentication | Playwright.dev docs |
| Gmail API setup | Google Cloud Console docs |
| WhatsApp Business API | Meta for Developers docs |
| Node.js MCP templates | MCP server examples |
| cron syntax | Linux man pages / Task Scheduler docs |
| Gmail API credentials | Google OAuth2 docs |

### Built-in Agents & Skills
- **Claude Code**: Code generation, validation, debugging
- **Spec-Kit Plus**: Phase verification, Prompt Tests
- **Agent Skills**: Reuse Bronze tier skills, extend with new ones

---

## 5. Decisions Needing Documentation

| Decision | Options | Tradeoffs | Selected |
|----------|---------|-----------|----------|
| **WhatsApp Integration** | A) Official WhatsApp Business API<br>B) Playwright web automation<br>C) Third-party wrapper | A: Official but complex setup<br>B: Simpler but less reliable<br>C: Fast but dependency risk | **B) Playwright** (matches handbook pattern, simpler for Silver) |
| **Gmail Integration** | A) Gmail API with OAuth2<br>B) IMAP polling<br>C) Playwright web automation | A: Official, reliable, supports labels<br>B: Less reliable, no push<br>C: Simpler but brittle | **A) Gmail API** (official, well-documented) |
| **Plan.md Location** | A) AI_Employee_Vault/Plans/<br>B) Same folder as task file<br>C) Separate vault | A: Organized, easy to find<br>B: Scattered, hard to track<br>C: Overkill for Silver | **A) Plans/ folder** (clean organization) |
| **Scheduling Mechanism** | A) Python schedule library<br>B) OS-native (cron/Task Scheduler)<br>C) Always-on daemon | A: Requires running process<br>B: Native, reliable, no deps<br>C: Complex for Silver | **B) OS-native** (cron/Task Scheduler) |
| **Email MCP Server** | A) Node.js MCP server<br>B) Python MCP server<br>C) Direct SMTP | A: Matches handbook examples<br>B: Consistent with watchers<br>C: No abstraction | **A) Node.js MCP** (handbook pattern) |

---

## 6. Quality Validation & Testing Strategy

### Testing Pyramid
```
        ┌─────────────┐
        │  E2E Tests  │  Prompt Tests after each phase
        └─────────────┘
     ┌───────────────────┐
     │ Integration Tests │  MCP + Watcher + Vault
     └───────────────────┘
  ┌─────────────────────────┐
  │    Unit Tests (Pytest)  │  Watchers, Skills, Scheduling
  └─────────────────────────┘
```

### Test Categories by Phase
| Phase | Unit Tests | Integration Tests | Prompt Test |
|-------|------------|-------------------|-------------|
| 1 (Watchers) | BaseWatcher methods | Gmail → Needs_Action | Gmail trigger detection |
| 2 (Reasoning) | Plan.md parsing | Task → Plan.md created | Complex task planning |
| 3 (MCP) | send_email function | MCP → email sent | Email via MCP |
| 4 (HITL) | Folder movement | Approval → MCP execution | Full HITL workflow |
| 5 (Scheduling) | Cron job execution | Scheduled → task created | Daily task automation |
| 6 (Skills) | All SKILL.md files | Skills → Claude Code invocation | Skill invocation test |
| 7 (Integration) | All above | Full end-to-end flow | Complete Silver Tier test |

### Success Metrics
- **99%+** trigger detection across all 3 watchers
- **100%** Plan.md creation for complex tasks
- **100%** HITL workflow compliance (no bypass)
- **100%** scheduled tasks execute within 1 minute of scheduled time
- **5+** Agent Skills documented and functional
- **All** Prompt Tests pass after each phase

---

## 7. Phased Implementation Plan

### Phase 1: Watchers (Gmail + WhatsApp)
**Estimated Time**: 6-8 hours

#### Steps

**1.1 Create BaseWatcher Abstract Class** (2 hours)
```bash
# Create watchers/base_watcher.py
```
- Define abstract methods: `scan()`, `create_task_file()`, `log_operation()`, `run()`
- Implement common functionality: logging, task file creation, error handling
- Add properties: `watch_path`, `vault_path`, `poll_interval`

**1.2 Refactor FileWatcher** (1 hour)
```bash
# Update watchers/file_watcher.py
```
- Extend `BaseWatcher`
- Maintain existing filesystem monitoring functionality
- Verify all Bronze tier tests still pass

**1.3 Implement GmailWatcher** (3 hours)
```bash
# Create watchers/gmail_watcher.py
# MCP QUERY: Fetch Gmail API Python library documentation
# MCP QUERY: Fetch Gmail API OAuth2 setup guide
```
- Extend `BaseWatcher`
- Implement Gmail API authentication (OAuth2)
- Monitor inbox for new emails
- Extract: sender, subject, timestamp, content
- Create task files in /Needs_Action

**1.4 Implement WhatsAppWatcher** (2 hours)
```bash
# Create watchers/whatsapp_watcher.py
# MCP QUERY: Fetch Playwright WhatsApp Web automation guide
```
- Extend `BaseWatcher`
- Implement Playwright-based WhatsApp Web monitoring
- Extract: sender, message content, timestamp
- Create task files in /Needs_Action

**1.5 Update Company_Handbook.md** (30 minutes)
```bash
# Update AI_Employee_Vault/Company_Handbook.md
```
- Document new watchers (Gmail, WhatsApp)
- Update trigger sources section

---

#### Prompt Test: Phase 1 Complete

```markdown
## Phase 1 Prompt Test: Watchers

**Copy-paste this into Spec-Kit Plus / Claude Code:**

```
Test Phase 1 (Watchers) completion:

1. Verify BaseWatcher class exists in watchers/base_watcher.py with:
   - Abstract methods: scan(), create_task_file(), log_operation(), run()
   - Common functionality: logging, task file creation, error handling

2. Verify FileWatcher extends BaseWatcher:
   - Run existing Bronze tier filesystem watcher test
   - Confirm task file created in /Needs_Action when file added to /Inbox

3. Verify GmailWatcher implementation:
   - Create test email (send to your Gmail)
   - Confirm task file appears in /Needs_Action within 60 seconds
   - Verify YAML frontmatter contains: sender, subject, timestamp, content

4. Verify WhatsAppWatcher implementation:
   - Send test WhatsApp message
   - Confirm task file appears in /Needs_Action within 60 seconds
   - Verify YAML frontmatter contains: sender, message content, timestamp

5. Verify Company_Handbook.md updated:
   - Check documentation for all 3 watchers (filesystem, Gmail, WhatsApp)
   - Confirm trigger sources clearly described

**Pass Criteria**: All 5 checks pass. Gmail and WhatsApp watchers create task files with correct metadata.
```

---

### Phase 2: Claude Reasoning Loop & Plan.md Management
**Estimated Time**: 4-6 hours

#### Steps

**2.1 Define Plan.md Schema** (1 hour)
```bash
# Create specs/002-silver-tier/data-model.md (Plan.md section)
```
- YAML frontmatter: `source_task`, `status` (active/completed/archived), `created`, `updated`
- Body: Ordered checkbox items (`- [ ] action`), completion notes
- Location: `AI_Employee_Vault/Plans/`

**2.2 Create create_plan_md Agent Skill** (2 hours)
```bash
# Create skills/create_plan_md.md
```
- **Purpose**: Create Plan.md from task file
- **Inputs**: Task file path
- **Outputs**: Plan.md in Plans/ folder
- **Examples**: Complex task → Plan.md with 5+ checkbox items

**2.3 Implement Plan.md Management** (2 hours)
```bash
# Create watchers/plan_manager.py
```
- Read task from /Needs_Action
- Generate Plan.md with checkboxes
- Update checkboxes as steps complete (`[ ]` → `[x]`)
- Archive Plan.md to /Done when all checkboxes complete

**2.4 Configure Claude Code Integration** (1 hour)
```bash
# Update AI_Employee_Vault/Company_Handbook.md
# Add Claude Code reasoning loop section
```
- Document Plan.md creation workflow
- Define "complex task" criteria (3+ steps)
- Specify checkbox update pattern

---

#### Prompt Test: Phase 2 Complete

```markdown
## Phase 2 Prompt Test: Claude Reasoning Loop

**Copy-paste this into Spec-Kit Plus / Claude Code:**

```
Test Phase 2 (Claude Reasoning Loop) completion:

1. Verify Plan.md schema documented:
   - Check data-model.md for Plan.md definition
   - Confirm YAML frontmatter fields: source_task, status, created, updated
   - Confirm body format: checkbox items (- [ ] action)

2. Verify create_plan_md Skill exists:
   - Check skills/create_plan_md.md
   - Confirm sections: Purpose, Inputs, Outputs, Examples, Dependencies, Usage

3. Test Plan.md creation:
   - Create complex task in /Needs_Action (5+ step task)
   - Invoke Claude Code with create_plan_md skill
   - Verify Plan.md created in /Plans/ folder
   - Confirm Plan.md has 5+ checkbox items

4. Test checkbox updates:
   - Complete first action in Plan.md
   - Verify checkbox updated from [ ] to [x]
   - Confirm updated timestamp in frontmatter

5. Test Plan.md archival:
   - Complete all checkbox items
   - Verify Plan.md status changed to "archived"
   - Confirm task moved to /Done folder

**Pass Criteria**: All 5 checks pass. Complex tasks generate Plan.md files with checkboxes that track progress.
```

---

### Phase 3: MCP Server (email-mcp) & Configuration
**Estimated Time**: 4-6 hours

#### Steps

**3.1 Setup email-mcp Project** (2 hours)
```bash
# Create mcp_servers/email-mcp/
# MCP QUERY: Fetch official MCP server template for Node.js
```
- Initialize Node.js project (`package.json`)
- Implement `send_email` capability
- Add error handling with retry logic

**3.2 Configure mcp.json** (1 hour)
```bash
# Create ~/.config/claude-code/mcp.json
# MCP QUERY: Fetch mcp.json configuration schema
```
- Add email-mcp server configuration
- Set up environment variables (SMTP credentials)
- Test MCP server discovery

**3.3 Create send_email Agent Skill** (2 hours)
```bash
# Create skills/send_email.md
```
- **Purpose**: Send email via MCP server
- **Inputs**: recipient, subject, body, attachments (optional)
- **Outputs**: success/failure status
- **Examples**: Send test email, send notification

**3.4 Test Email Sending** (1 hour)
```bash
# Test end-to-end email sending
```
- Configure SMTP credentials in .env
- Send test email via Claude Code + send_email skill
- Verify email received

---

#### Prompt Test: Phase 3 Complete

```markdown
## Phase 3 Prompt Test: MCP Server

**Copy-paste this into Spec-Kit Plus / Claude Code:**

```
Test Phase 3 (MCP Server) completion:

1. Verify email-mcp server exists:
   - Check mcp_servers/email-mcp/package.json
   - Confirm index.js implements send_email capability
   - Verify error handling with retry logic

2. Verify mcp.json configuration:
   - Check ~/.config/claude-code/mcp.json
   - Confirm email-mcp server registered
   - Verify environment variables configured

3. Verify send_email Skill exists:
   - Check skills/send_email.md
   - Confirm sections: Purpose, Inputs, Outputs, Examples, Dependencies, Usage
   - Inputs: recipient, subject, body, attachments (optional)

4. Test email sending:
   - Create task in /Needs_Action: "Send test email to [your-email]"
   - Invoke Claude Code with send_email skill
   - Verify email received in inbox

5. Test error handling:
   - Attempt to send email with invalid SMTP credentials
   - Verify error logged in operations.log
   - Confirm task moved for manual review

**Pass Criteria**: All 5 checks pass. email-mcp configured and successfully sends test email.
```

---

### Phase 4: Human-in-the-Loop Approval Workflow
**Estimated Time**: 4-6 hours

#### Steps

**4.1 Create Approved/ and Rejected/ Folders** (30 minutes)
```bash
# mkdir AI_Employee_Vault/Approved
# mkdir AI_Employee_Vault/Rejected
```

**4.2 Implement Approval Orchestrator** (2 hours)
```bash
# Create watchers/orchestrator.py
```
- Monitor /Approved folder for approved tasks
- Execute MCP actions for approved tasks
- Move completed tasks to /Done

**4.3 Define Sensitive Action Criteria** (1 hour)
```bash
# Update AI_Employee_Vault/Company_Handbook.md
```
- Document what requires approval:
  - External communications (emails, messages)
  - Financial actions
  - Data modifications
- Define approval workflow steps

**4.4 Test HITL Workflow** (2 hours)
```bash
# Test full approval workflow
```
- Create task requiring approval
- Move to /Pending_Approval
- User reviews and moves to /Approved
- Orchestrator executes action
- Task moved to /Done

---

#### Prompt Test: Phase 4 Complete

```markdown
## Phase 4 Prompt Test: HITL Workflow

**Copy-paste this into Spec-Kit Plus / Claude Code:**

```
Test Phase 4 (HITL Workflow) completion:

1. Verify folder structure exists:
   - Check AI_Employee_Vault/Approved/ exists
   - Check AI_Employee_Vault/Rejected/ exists
   - Check AI_Employee_Vault/Pending_Approval/ exists

2. Verify orchestrator implemented:
   - Check watchers/orchestrator.py exists
   - Confirm it monitors /Approved folder
   - Verify it executes MCP actions for approved tasks

3. Verify Company_Handbook.md updated:
   - Check "Sensitive Action Criteria" section exists
   - Confirm list of actions requiring approval
   - Verify approval workflow steps documented

4. Test approval workflow:
   - Create task: "Send email to client@example.com"
   - Move to /Pending_Approval
   - User reviews and moves to /Approved
   - Verify orchestrator executes email send
   - Confirm task moved to /Done

5. Test rejection workflow:
   - Create task requiring approval
   - Move to /Pending_Approval
   - User rejects and moves to /Rejected
   - Verify task closed without action
   - Confirm rejection reason logged

**Pass Criteria**: All 5 checks pass. Approval workflow executes MCP actions only on approval; rejections close tasks without action.
```

---

### Phase 5: Scheduling (cron / Task Scheduler)
**Estimated Time**: 3-5 hours

#### Steps

**5.1 Create Daily Tasks Scheduler** (2 hours)
```bash
# Create scheduling/daily_tasks.py
# MCP QUERY: Fetch cron syntax guide for Linux/macOS
# MCP QUERY: Fetch Windows Task Scheduler Python guide
```
- Implement daily task creation logic
- Add configuration for task types
- Set up logging

**5.2 Create Weekly Summary Generator** (2 hours)
```bash
# Create scheduling/weekly_summary.py
```
- Query vault for completed tasks (past 7 days)
- Generate summary Markdown
- Create task in /Needs_Action for review

**5.3 Configure OS Scheduling** (1 hour)
```bash
# Linux/macOS: Set up cron jobs
# Windows: Set up Task Scheduler tasks
# MCP QUERY: Fetch cron best practices
```
- Configure daily_tasks.py to run at 8 AM daily
- Configure weekly_summary.py to run at 9 AM Monday
- Test scheduled execution

---

#### Prompt Test: Phase 5 Complete

```markdown
## Phase 5 Prompt Test: Scheduling

**Copy-paste this into Spec-Kit Plus / Claude Code:**

```
Test Phase 5 (Scheduling) completion:

1. Verify scheduling scripts exist:
   - Check scheduling/daily_tasks.py exists
   - Check scheduling/weekly_summary.py exists
   - Confirm both have proper error handling and logging

2. Verify daily task scheduler:
   - Run daily_tasks.py manually
   - Confirm task created in /Needs_Action
   - Verify task has correct metadata (source: scheduler, timestamp)

3. Verify weekly summary generator:
   - Run weekly_summary.py manually
   - Confirm summary Markdown generated
   - Verify summary includes completed tasks from past 7 days

4. Verify OS scheduling configured:
   - Linux/macOS: Check crontab entries for both scripts
   - Windows: Check Task Scheduler for both tasks
   - Confirm schedules: daily at 8 AM, weekly Monday at 9 AM

5. Test scheduled execution:
   - Wait for scheduled time (or manually trigger)
   - Verify task created automatically
   - Confirm execution logged in operations.log

**Pass Criteria**: All 5 checks pass. Scheduled tasks execute automatically at configured times.
```

---

### Phase 6: Convert Everything to Agent Skills
**Estimated Time**: 4-6 hours

#### Steps

**6.1 Audit Existing Skills** (1 hour)
```bash
# Review skills/ directory
```
- Bronze tier: read_task, plan_action, write_report, file_operations
- Silver tier (new): create_plan_md, send_email, schedule_task
- Identify gaps

**6.2 Create schedule_task Skill** (2 hours)
```bash
# Create skills/schedule_task.md
```
- **Purpose**: Schedule recurring tasks
- **Inputs**: task description, schedule (daily/weekly), time
- **Outputs**: Scheduled task confirmation
- **Examples**: Schedule daily summary, schedule weekly report

**6.3 Document All Skills** (2 hours)
```bash
# Update each SKILL.md file
```
- Ensure all have: Purpose, Inputs, Outputs, Examples, Dependencies, Usage
- Add usage examples for each
- Verify consistency across all skills

**6.4 Test Skill Invocation** (1 hour)
```bash
# Test each skill via Claude Code
```
- Invoke each skill with test inputs
- Verify expected outputs
- Document any issues

---

#### Prompt Test: Phase 6 Complete

```markdown
## Phase 6 Prompt Test: Agent Skills

**Copy-paste this into Spec-Kit Plus / Claude Code:**

```
Test Phase 6 (Agent Skills) completion:

1. Verify all SKILL.md files exist:
   - read_task.md, plan_action.md, write_report.md, file_operations.md (Bronze)
   - create_plan_md.md, send_email.md, schedule_task.md (Silver)
   - Confirm 7 total skills

2. Verify skill documentation:
   - Each skill has: Purpose, Inputs, Outputs, Examples, Dependencies, Usage
   - Examples include realistic test scenarios
   - Dependencies clearly listed

3. Test read_task skill:
   - Invoke with test task file
   - Verify frontmatter and body extracted correctly

4. Test send_email skill:
   - Invoke with test email parameters
   - Verify email sent via MCP

5. Test schedule_task skill:
   - Invoke with test schedule (daily at 9 AM)
   - Verify scheduled task created

**Pass Criteria**: All 5 checks pass. 7+ Agent Skills documented and functional.
```

---

### Phase 7: Integration & Final Polish
**Estimated Time**: 4-6 hours

#### Steps

**7.1 End-to-End Integration Test** (2 hours)
```bash
# Test full Silver Tier workflow
```
- Gmail trigger → Task created → Plan.md generated → Approval → Email sent → Done
- WhatsApp trigger → Task created → Scheduled → Executed → Done

**7.2 Update Documentation** (2 hours)
```bash
# Update all documentation files
```
- README.md: Add Silver Tier section
- quickstart.md: Complete setup guide
- Company_Handbook.md: All Silver Tier workflows

**7.3 Final Verification** (2 hours)
```bash
# Run comprehensive Silver Tier Prompt Test
```
- Execute full Prompt Test (below)
- Fix any remaining issues
- Verify all success criteria met

---

#### Prompt Test: Full Silver Tier Complete

```markdown
## Full Silver Tier Prompt Test

**Copy-paste this into Spec-Kit Plus / Claude Code:**

```
Test FULL Silver Tier completion:

### Watchers (3 total)
1. Filesystem watcher: Add file to /Inbox → Task in /Needs_Action ✓
2. Gmail watcher: Send email → Task in /Needs_Action with metadata ✓
3. WhatsApp watcher: Send message → Task in /Needs_Action with content ✓

### Claude Code Reasoning Loop
4. Complex task in /Needs_Action → Plan.md created in /Plans/ ✓
5. Plan.md has 5+ checkbox items ✓
6. Complete checkboxes → Progress tracked ✓
7. All complete → Plan.md archived, task to /Done ✓

### MCP Server
8. email-mcp configured in ~/.config/claude-code/mcp.json ✓
9. send_email skill functional ✓
10. Test email sent successfully ✓

### HITL Workflow
11. Sensitive task → /Pending_Approval ✓
12. User approves → /Approved ✓
13. Orchestrator executes MCP action ✓
14. Task → /Done ✓
15. User rejects → /Rejected ✓
16. Task closed without action ✓

### Scheduling
17. daily_tasks.py scheduled and executing ✓
18. weekly_summary.py scheduled and executing ✓
19. Scheduled tasks appear in /Needs_Action ✓

### Agent Skills
20. 7+ SKILL.md files documented ✓
21. All skills invokable via Claude Code ✓
22. All skills produce expected outputs ✓

### Documentation
23. Company_Handbook.md updated with all Silver workflows ✓
24. quickstart.md complete ✓
25. README.md includes Silver Tier section ✓

**Pass Criteria**: ALL 25 checks pass. Silver Tier fully functional and documented.
```

---

## 8. Prompt Test Procedures

### Summary by Phase

| Phase | Prompt Test Location | Key Verification |
|-------|---------------------|------------------|
| 1 (Watchers) | After Phase 1 section | 3 watchers operational |
| 2 (Reasoning) | After Phase 2 section | Plan.md created + tracked |
| 3 (MCP) | After Phase 3 section | email-mcp sends test email |
| 4 (HITL) | After Phase 4 section | Approval workflow functional |
| 5 (Scheduling) | After Phase 5 section | Scheduled tasks execute |
| 6 (Skills) | After Phase 6 section | 7+ skills documented |
| 7 (Integration) | After Phase 7 section | Full end-to-end flow |
| **Full Silver Tier** | End of plan | All 25 checks pass |

---

## 9. Verification Checklist against Silver Tier Deliverables

### Core Deliverables

- [ ] **3 Watchers Operational**
  - [ ] Filesystem watcher (Bronze, refactored)
  - [ ] Gmail watcher (NEW, Playwright + Gmail API)
  - [ ] WhatsApp watcher (NEW, Playwright)

- [ ] **Claude Code Reasoning Loop**
  - [ ] Plan.md schema defined
  - [ ] create_plan_md skill functional
  - [ ] Plan.md tracks progress with checkboxes
  - [ ] Plan.md archived on completion

- [ ] **MCP Server (email-mcp)**
  - [ ] Node.js MCP server implemented
  - [ ] Configured in ~/.config/claude-code/mcp.json
  - [ ] send_email skill functional
  - [ ] Test email sent successfully

- [ ] **HITL Approval Workflow**
  - [ ] /Pending_Approval folder exists
  - [ ] /Approved folder exists
  - [ ] /Rejected folder exists
  - [ ] Orchestrator monitors /Approved
  - [ ] Sensitive actions require approval

- [ ] **Scheduling**
  - [ ] daily_tasks.py implemented
  - [ ] weekly_summary.py implemented
  - [ ] cron/Task Scheduler configured
  - [ ] Scheduled tasks execute automatically

- [ ] **Agent Skills (7+ total)**
  - [ ] read_task.md (Bronze)
  - [ ] plan_action.md (Bronze)
  - [ ] write_report.md (Bronze)
  - [ ] file_operations.md (Bronze)
  - [ ] create_plan_md.md (NEW)
  - [ ] send_email.md (NEW)
  - [ ] schedule_task.md (NEW)

- [ ] **Documentation**
  - [ ] Company_Handbook.md updated
  - [ ] quickstart.md complete
  - [ ] README.md includes Silver Tier
  - [ ] data-model.md defines Plan.md

- [ ] **Prompt Tests**
  - [ ] Phase 1 Prompt Test passes
  - [ ] Phase 2 Prompt Test passes
  - [ ] Phase 3 Prompt Test passes
  - [ ] Phase 4 Prompt Test passes
  - [ ] Phase 5 Prompt Test passes
  - [ ] Phase 6 Prompt Test passes
  - [ ] Phase 7 Prompt Test passes
  - [ ] Full Silver Tier Prompt Test passes (25 checks)

### Success Criteria Verification

| Criteria | Target | Actual | Status |
|----------|--------|--------|--------|
| Implementation Time | 20-30 hours | TBD | ⏳ |
| Additional Watchers | 2 (Gmail + WhatsApp) | TBD | ⏳ |
| Plan.md Creation | 100% of complex tasks | TBD | ⏳ |
| MCP Server | 1 configured + operational | TBD | ⏳ |
| HITL Compliance | 100% of sensitive actions | TBD | ⏳ |
| Scheduling | 1 daily + 1 weekly task | TBD | ⏳ |
| Agent Skills | 5+ SKILL.md files | 7 planned | ⏳ |
| Prompt Tests | All phases + full tier | TBD | ⏳ |

---

**Total Estimated Time**: 29-43 hours (within 20-30 hour target with some buffer for experienced developer)

**Next Step**: Run `/sp.tasks` to generate detailed implementation task list, then begin Phase 1.
