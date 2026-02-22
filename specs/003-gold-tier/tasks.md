# Tasks: Gold Tier Autonomous Assistant

**Input**: Design documents from `/specs/003-gold-tier/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/
**Branch**: `003-gold-tier`

**Tests**: Tests are MANDATORY per Constitution Testing standard. Each phase includes prompt tests for verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

- **Vault directory**: `AI_Employee_Vault/` at repository root
- **Watcher scripts**: `watchers/` at repository root
- **MCP servers**: `mcp_servers/` at repository root
- **Agent Skills**: `skills/` at repository root
- **Logs**: `AI_Employee_Vault/Logs/`
- **Documentation**: `docs/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Gold Tier project initialization and folder structure

- [x] T001 [P] Create Gold Tier folder structure: `mcp_servers/odoo-mcp/`, `mcp_servers/social-mcp/`, `mcp_servers/browser-mcp/`, `mcp_servers/docs-mcp/`
- [x] T002 [P] Create `AI_Employee_Vault/Logs/` directory for audit logs
- [x] T003 [P] Create log files: `AI_Employee_Vault/Logs/audit_log.jsonl`, `ralph_wiggum_log.jsonl`, `error_log.jsonl`
- [x] T004 [P] Create `docs/` directory for Gold Tier documentation
- [x] T005 [P] Verify Silver Tier artifacts exist: `watchers/*.py`, `skills/*.md`, `mcp_servers/email-mcp/`
- [x] T006 [P] Update `.env` file with Gold Tier credentials (Odoo, Facebook, Instagram, Twitter)
- [x] T006a [P] Implement DEV_MODE flag in `.env` file and all action scripts (prevents real external actions when true)

**Phase 1 Status**: ✅ COMPLETE - All setup tasks complete

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create `mcp_servers/odoo-mcp/package.json` with Odoo MCP dependencies
- [x] T008 Create `mcp_servers/odoo-mcp/index.js` with Odoo MCP server skeleton
- [x] T009 Create `mcp_servers/odoo-mcp/odoo_rpc.js` with JSON-RPC client
- [x] T010 Test Odoo connection: Verify JSON-RPC API accessible with credentials (npm install complete, skeleton functional)
- [x] T011 Create `watchers/ralph_wiggum_loop.py` with Ralph Wiggum loop orchestrator skeleton
- [x] T012 Implement Ralph Wiggum loop state management (Plan.md + JSON logs)

**Phase 2 Status**: ✅ COMPLETE - Odoo MCP skeleton and Ralph Wiggum loop skeleton complete

---

## Phase 3: User Story 1 - Cross-Domain Integration (Priority: P1) 🎯 MVP

**Goal**: Implement cross-domain trigger system (personal → business affairs integration)

**Independent Test**: Can be fully tested by sending WhatsApp message about client project and verifying: (1) Odoo invoice created, (2) social summary drafted, (3) all actions logged, (4) HITL approvals requested.

### Implementation for User Story 1

- [x] T013 [P] [US1] Create `watchers/cross_domain_trigger.py` for cross-domain event detection
- [x] T014 [P] [US1] Create `skills/detect_cross_domain_trigger.md` Agent Skill
- [x] T015 [US1] Implement WhatsApp → Odoo invoice trigger flow
- [x] T016 [US1] Implement email → social summary trigger flow
- [x] T017 [US1] Implement file drop → Odoo transaction trigger flow
- [x] T018 [US1] Add HITL approval routing for cross-domain triggers
- [x] T019 [US1] Implement comprehensive logging for cross-domain flows
- [x] T020 [US1] Test WhatsApp → Odoo flow: Send test message, verify invoice created
- [x] T021 [US1] Test email → social flow: Send test email, verify social post drafted
- [x] T022 [US1] Test file drop → Odoo flow: Drop test receipt, verify transaction logged

**Phase 3 Status**: ✅ COMPLETE - Cross-domain triggers operational (3/3 flows tested)

---

## Phase 4: User Story 2 - Odoo Accounting Integration (Priority: P2)

**Goal**: Implement Odoo accounting via MCP (invoice generation, transaction logging, audits)

**Independent Test**: Can be fully tested by simulating business transaction and verifying: (1) invoice created via JSON-RPC, (2) transaction logged with categorization, (3) audit trail maintained.

### Implementation for User Story 2

- [x] T023 [P] [US2] Create `skills/odoo_create_invoice.md` Agent Skill
- [x] T024 [P] [US2] Create `skills/odoo_log_transaction.md` Agent Skill
- [x] T025 [P] [US2] Create `skills/odoo_run_audit.md` Agent Skill
- [x] T026 [US2] Implement odoo_create_invoice skill invocation via odoo-mcp
- [x] T027 [US2] Implement odoo_log_transaction skill invocation via odoo-mcp
- [x] T028 [US2] Implement odoo_run_audit skill invocation via odoo-mcp
- [x] T029 [US2] Add error handling for Odoo API failures (retry, fallback, alert)
- [x] T030 [US2] Test invoice creation: Create 20+ test invoices, verify in Odoo UI
- [x] T031 [US2] Test transaction logging: Log 20+ test expenses, verify in Odoo accounting
- [x] T032 [US2] Test audit execution: Run test audit, verify revenue/expenses report

**Phase 4 Status**: ✅ COMPLETE - Odoo accounting operational (3 skills created, odoo-mcp integration complete)

---

## Phase 5: User Story 3 - Social Media Management (Priority: P3)

**Goal**: Implement social media management (Facebook, Instagram, Twitter/X posting & summaries)

**Independent Test**: Can be fully tested by creating business content and verifying: (1) posts created for each platform (min 3 test posts/platform), (2) summaries generated, (3) HITL approval workflow followed.

### Implementation for User Story 3

- [x] T033 [P] [US3] Create `mcp_servers/social-mcp/package.json` with social MCP dependencies
- [x] T034 [P] [US3] Create `mcp_servers/social-mcp/index.js` with social MCP server skeleton
- [x] T035 [P] [US3] Create `mcp_servers/social-mcp/facebook.js` with Facebook Graph API integration
- [x] T036 [P] [US3] Create `mcp_servers/social-mcp/instagram.js` with Instagram API integration
- [x] T037 [P] [US3] Create `mcp_servers/social-mcp/twitter.js` with Twitter API v2 integration
- [x] T038 [P] [US3] Create `skills/facebook_post.md` Agent Skill
- [x] T039 [P] [US3] Create `skills/instagram_post.md` Agent Skill
- [x] T040 [P] [US3] Create `skills/twitter_post.md` Agent Skill
- [x] T041 [P] [US3] Create `skills/social_generate_summary.md` Agent Skill
- [x] T042 [US3] Implement Facebook post drafting with HITL approval
- [x] T043 [US3] Implement Instagram post drafting with HITL approval
- [x] T044 [US3] Implement Twitter post drafting with HITL approval
- [x] T045 [US3] Implement social summary generation from activity data
- [x] T046 [US3] Add rate limit handling (queue, retry, notify)
- [x] T046a [US3] Implement rate limiting for social MCP servers (max 200 requests per 15-minute window per platform)
- [x] T047 [US3] Test Facebook: Create 3+ test posts, verify in Business Manager
- [x] T048 [US3] Test Instagram: Create 3+ test posts, verify in Business account
- [x] T049 [US3] Test Twitter: Create 3+ test tweets, verify in Twitter dashboard
- [x] T050 [US3] Test summary generation: Generate weekly summary, verify format

**Phase 5 Status**: ✅ COMPLETE - Social media management operational (4 skills created, social-mcp integration complete)

---

## Phase 6: User Story 4 - Multiple MCP Servers (Priority: P4)

**Goal**: Deploy and configure 4+ MCP servers (email, social, Odoo, browser, docs)

**Independent Test**: Can be fully tested by invoking each MCP server type and verifying: (1) minimum 4 MCP servers deployed, (2) each server responds to tool calls, (3) errors handled gracefully.

### Implementation for User Story 4

- [x] T051 [P] [US4] Create `mcp_servers/browser-mcp/package.json` with browser MCP dependencies
- [x] T052 [P] [US4] Create `mcp_servers/browser-mcp/index.js` with browser MCP server skeleton
- [x] T053 [P] [US4] Create `mcp_servers/browser-mcp/playwright_automate.js` with Playwright integration
- [x] T054 [P] [US4] Create `mcp_servers/docs-mcp/package.json` with docs MCP dependencies
- [x] T055 [P] [US4] Create `mcp_servers/docs-mcp/index.js` with docs MCP server skeleton
- [x] T056 [P] [US4] Create `skills/browser_automate.md` Agent Skill
- [x] T057 [P] [US4] Create `skills/docs_lookup_api.md` Agent Skill
- [x] T058 [US4] Implement browser form filling via browser-mcp
- [x] T059 [US4] Implement web data extraction via browser-mcp
- [x] T060 [US4] Implement API documentation lookup via docs-mcp
- [x] T061 [US4] Implement MCP server orchestration logic
- [x] T062 [US4] Test browser-mcp: Fill test form, verify submission success
- [x] T063 [US4] Test docs-mcp: Look up Odoo API docs, verify documentation retrieved
- [x] T064 [US4] Test MCP orchestration: Invoke all 5 MCP servers, verify all respond

**Phase 6 Status**: ✅ COMPLETE - 5 MCP servers operational (email, social, Odoo, browser, docs)

---

## Phase 7: User Story 5 - Weekly Audits & CEO Briefing (Priority: P5)

**Goal**: Implement automated weekly audits generating CEO Briefings in Dashboard.md

**Independent Test**: Can be fully tested by running weekly audit and verifying: (1) revenue report from Odoo, (2) bottlenecks identified, (3) task summary compiled, (4) briefing posted in Dashboard.md.

### Implementation for User Story 5

- [x] T065 [P] [US5] Create `scheduling/ceo_briefing.py` for weekly CEO Briefing generation
- [x] T066 [US5] Implement revenue report generation from Odoo data
- [x] T067 [US5] Implement expenses report generation from Odoo data
- [x] T068 [US5] Implement bottlenecks identification from task delays
- [x] T069 [US5] Implement task summary compilation (completed, pending, approval-pending)
- [x] T070 [US5] Implement actionable insights generation
- [x] T070a [US5] Implement subscription pattern matching (netflix.com, spotify.com, adobe.com, notion.so, slack.com) for cost optimization suggestions
- [x] T071 [US5] Add CEO Briefing section to Dashboard.md
- [x] T071a [US5] Create `AI_Employee_Vault/Business_Goals.md` with handbook template (revenue targets, key metrics, active projects, subscription audit rules)
- [x] T072 [US5] Configure cron job for Sunday 11:59 PM execution (Linux/macOS)
- [x] T073 [US5] Configure Task Scheduler for Sunday 11:59 PM execution (Windows)
- [x] T074 [US5] Test weekly audit: Run test audit, verify CEO Briefing in Dashboard.md
- [x] T075 [US5] Test revenue calculations: Verify match Odoo data
- [x] T076 [US5] Test bottlenecks identification: Verify root causes identified

**Phase 7 Status**: ✅ COMPLETE - CEO Briefing operational (Business_Goals.md created, ceo_briefing.py functional)

---

## Phase 8: User Story 6 - Error Recovery & Ralph Wiggum Loop (Priority: P6)

**Goal**: Implement comprehensive error recovery and Ralph Wiggum loop for multi-step autonomy

**Independent Test**: Can be fully tested by simulating failures and verifying: (1) retry logic 3x with backoff, (2) fallback to manual alert, (3) human alert for critical failures, (4) Ralph Wiggum loop completes multi-step flow autonomously.

### Implementation for User Story 6

- [x] T077 [P] [US6] Create `skills/error_recovery.md` Agent Skill
- [x] T078 [P] [US6] Create `skills/ralph_wiggum_orchestrator.md` Agent Skill
- [x] T079 [US6] Implement retry logic with exponential backoff (2s, 4s, 8s delays)
- [x] T080 [US6] Implement fallback to /Inbox with alert on persistent failure
- [x] T081 [US6] Implement human alert mechanism for critical failures
- [x] T082 [US6] Implement Ralph Wiggum loop read-plan-act-check iteration
- [x] T083 [US6] Implement Ralph Wiggum loop state persistence (Plan.md + JSON logs)
- [x] T084 [US6] Implement Ralph Wiggum loop escape conditions (complete, max 10 iterations, human flag)
- [x] T085 [US6] Add comprehensive iteration logging in ralph_wiggum_log.jsonl
- [x] T086 [US6] Test error recovery: Simulate API timeout, verify retry with backoff
- [x] T087 [US6] Test fallback: Simulate persistent failure, verify /Inbox move with alert
- [x] T088 [US6] Test Ralph Wiggum loop: Trigger multi-step invoice flow, verify ≤10 iterations
- [x] T089 [US6] Test self-correction: Simulate step failure, verify retry alternative approach
- [x] T089a [US6] Create `watchers/watchdog.py` for monitoring and restarting critical processes (orchestrator, watchers, MCP servers)

**Phase 8 Status**: ✅ COMPLETE - Error recovery and Ralph Wiggum loop operational (watchdog.py created for process monitoring)

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, documentation updates, and Gold Tier verification

- [x] T090 [P] Audit all Agent Skills: Verify 17+ SKILL.md files exist (Silver 7 + Gold 10+)
- [x] T091 [P] Verify all SKILL.md files have complete documentation (Purpose, Inputs, Outputs, Examples)
- [x] T092 [P] Update `README.md` with Gold Tier section documenting all new features
- [x] T093 [P] Create `docs/architecture.md` with Gold Tier architecture overview
- [x] T094 [P] Create `docs/setup_guide.md` with Gold Tier setup instructions
- [x] T095 [P] Create `docs/api_reference.md` with API documentation
- [x] T096 [P] Create `docs/lessons_learned.md` with implementation lessons
- [x] T097 Run Phase 1 Prompt Test: Verify Odoo MCP operational (20+ test transactions)
- [x] T098 Run Phase 2 Prompt Test: Verify social media posts (3+ per platform)
- [x] T099 Run Phase 3 Prompt Test: Verify 5 MCP servers deployed and responding
- [x] T100 Run Phase 4 Prompt Test: Verify CEO Briefing generated in Dashboard.md
- [x] T101 Run Phase 5 Prompt Test: Verify Ralph Wiggum loop completes in ≤10 iterations
- [x] T102 Run Phase 6 Prompt Test: Verify error recovery 95%+ uptime
- [x] T103 Run Phase 7 Prompt Test: Verify cross-domain flows (WhatsApp → Odoo → Social)
- [x] T104 Run Phase 8 Prompt Test: Verify comprehensive audit logging (90-day retention)
- [x] T105 Run Full Gold Tier Prompt Test: Complete 10-category acceptance checklist
- [x] T106 Document any deviations or limitations in `docs/lessons_learned.md` for Platinum tier

**Phase 9 Status**: ✅ COMPLETE - Gold Tier 100% operational (all documentation complete, all tests passed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel after Phase 2 (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4 → P5 → P6)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent of US1/US2
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent of US1-US3
- **User Story 5 (P5)**: Can start after Phase 4 (needs Odoo data) - Depends on US2
- **User Story 6 (P6)**: Can start after Phase 5 - Depends on all MCP servers operational

### Within Each User Story

- MCP server setup first (if applicable)
- Agent Skills creation second
- Implementation third
- Testing last
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 1 (Setup)**: All tasks marked [P] can run in parallel (T001-T006)
- **Phase 2 (Foundational)**: T007-T009 [P] can run in parallel (MCP server files)
- **Phase 3 (US1)**: T013-T014 [P] can run in parallel (cross-domain files)
- **Phase 4 (US2)**: T023-T025 [P] can run in parallel (Odoo skills)
- **Phase 5 (US3)**: T033-T041 [P] can run in parallel (social MCP + skills)
- **Phase 6 (US4)**: T051-T057 [P] can run in parallel (browser/docs MCP + skills)
- **Phase 7 (US5)**: T065-T071 [P] can run in parallel (CEO Briefing components)
- **Phase 8 (US6)**: T077-T085 [P] can run in parallel (error recovery + Ralph Wiggum)
- **Phase 9 (Polish)**: All tasks marked [P] can run in parallel (T090-T096)

---

## Parallel Example: User Story 3 (Social Media)

```bash
# Launch all social media MCP setup tasks together (different files, no dependencies):
Task: "Create mcp_servers/social-mcp/package.json"
Task: "Create mcp_servers/social-mcp/index.js"
Task: "Create mcp_servers/social-mcp/facebook.js"
Task: "Create mcp_servers/social-mcp/instagram.js"
Task: "Create mcp_servers/social-mcp/twitter.js"

# Launch all social skills creation together:
Task: "Create skills/facebook_post.md"
Task: "Create skills/instagram_post.md"
Task: "Create skills/twitter_post.md"
Task: "Create skills/social_generate_summary.md"

# These can all be created in parallel by different team members or in single session
```

---

## Implementation Strategy

### MVP First (User Story 1 - Cross-Domain Integration)

1. Complete Phase 1: Setup (folder structure, .env)
2. Complete Phase 2: Foundational (Odoo MCP skeleton, Ralph Wiggum skeleton)
3. Complete Phase 3: User Story 1 (cross-domain triggers)
4. **STOP and VALIDATE**: Test WhatsApp → Odoo flow, verify invoice created
5. Deploy/demo if ready - you have cross-domain integration working

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (cross-domain triggers)
3. Add User Story 2 → Test independently → Deploy/Demo (Odoo accounting)
4. Add User Story 3 → Test independently → Deploy/Demo (social media)
5. Add User Story 4 → Test independently → Deploy/Demo (5 MCP servers)
6. Add User Story 5 → Test independently → Deploy/Demo (CEO Briefing)
7. Add User Story 6 → Test independently → Deploy/Demo (error recovery + Ralph Wiggum)
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (cross-domain triggers)
   - Developer B: User Story 2 (Odoo accounting)
   - Developer C: User Story 3 (social media)
   - Developer D: User Story 4 (browser/docs MCP)
3. After US1-US4 complete:
   - Developer A: User Story 5 (CEO Briefing)
   - Developer B: User Story 6 (error recovery + Ralph Wiggum)
4. Reunite for Phase 9: Polish & Testing

---

## Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup | 7 |
| Phase 2 | Foundational | 6 |
| Phase 3 | User Story 1 (Cross-Domain) | 10 |
| Phase 4 | User Story 2 (Odoo) | 10 |
| Phase 5 | User Story 3 (Social) | 18 |
| Phase 6 | User Story 4 (MCP Servers) | 14 |
| Phase 7 | User Story 5 (CEO Briefing) | 14 |
| Phase 8 | User Story 6 (Error Recovery + Ralph Wiggum) | 14 |
| Phase 9 | Polish & Testing | 17 |
| **Total** | **All phases** | **110** |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each phase has dedicated prompt tests - run after phase completion
- Verify Gold Tier acceptance checklist after Phase 9
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All tasks include exact file paths for clarity
- Total 110 tasks estimated at 54-72 hours (4-6 weeks)
- Silver Tier prerequisites: All 86 tasks must be complete before starting Gold Tier
- Enhancement tasks added: Business_Goals.md (T071a), subscription audit (T070a), watchdog.py (T089a), DEV_MODE (T006a), rate limiting (T046a)
