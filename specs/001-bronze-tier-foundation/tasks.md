# Tasks: Bronze Tier Foundation

**Input**: Design documents from `/specs/001-bronze-tier-foundation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are MANDATORY per Constitution Testing standard. Unit tests (T036) and end-to-end tests (T039) included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Vault directory**: `AI_Employee_Vault/` at repository root
- **Watcher scripts**: `watchers/` at repository root
- **Agent Skills**: `skills/` at repository root
- **Logs**: `watchers/logs/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Create repository root directory structure: `obsidian-vault/`, `watchers/`, `skills/`, `tests/`
- [x] T002 [P] Create vault subdirectories: `Inbox/`, `Needs_Action/`, `Pending_Approval/`, `Done/`, `logs/`
- [x] T003 [P] Verify Python 3.13+ installation and accessibility

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `watchers/file_watcher.py` with FileWatcher class skeleton (imports, class definition, scan method stub)
- [x] T005 Create `watchers/dashboard_updater.py` with DashboardUpdater class skeleton
- [x] T006 Create `watchers/logs/operations.log` file for structured logging
- [x] T007 Implement logging utility function in `watchers/file_watcher.py`: `log_operation(action, status, duration_ms, details, user)`
- [x] T008 Create YAML parsing utility for task files (can be inline in file_watcher.py or separate module)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Vault Setup and Dashboard Creation (Priority: P1) 🎯 MVP

**Goal**: Create operational Obsidian vault with Dashboard.md and Company_Handbook.md

**Independent Test**: Can be fully tested by opening the vault in Obsidian and verifying Dashboard.md displays task summaries and Company_Handbook.md contains operational rules.

### Implementation for User Story 1

- [x] T009 [US1] Create `obsidian-vault/Dashboard.md` with initial structure (Last Updated, Task Summary table, Recent Activity, System Health sections)
- [x] T010 [US1] Create `obsidian-vault/Company_Handbook.md` with Rules of Engagement, Operational Guidelines, Constraints, Escalation Procedures
- [x] T011 [US1] Implement dashboard_updater.py `count_files(folder)` method to count .md files in vault folders
- [x] T012 [US1] Implement dashboard_updater.py `generate_dashboard()` method to create Dashboard.md content with current counts
- [x] T013 [US1] Implement dashboard_updater.py `run()` method with 30-second polling loop and atomic file writes
- [x] T014 [US1] Add `get_recent_activity(limit=5)` method to DashboardUpdater for recent completions
- [ ] T015 [US1] Test Dashboard updater: Run script and verify Dashboard.md updates every 30 seconds with correct counts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently - vault exists with Dashboard and Company Handbook, dashboard updates automatically

---

## Phase 4: User Story 2 - Watcher Trigger Detection (Priority: P2)

**Goal**: Implement file system Watcher that detects triggers and creates task files in /Needs_Action

**Independent Test**: Can be fully tested by simulating a trigger (creating a file in the monitored directory) and verifying a corresponding .md file appears in /Needs_Action with correct YAML frontmatter.

### Implementation for User Story 2

- [x] T016 [P] [US2] Implement FileWatcher `__init__(watch_path, vault_path, poll_interval)` with configuration
- [x] T017 [P] [US2] Implement FileWatcher `scan()` method using pathlib.rglob() to detect new/modified .md files
- [x] T018 [US2] Implement `create_task_file(file_path)` method to create properly formatted task file in /Needs_Action
- [x] T019 [US2] Ensure task file includes YAML frontmatter: source, timestamp (ISO 8601), status (pending), priority (medium)
- [x] T020 [US2] Ensure task file body includes: # Task Description, ## Processing Notes, ## Completion Report sections
- [x] T021 [US2] Implement FileWatcher `run()` method with continuous monitoring loop and error handling
- [x] T022 [US2] Add structured logging for all Watcher operations (scan_complete, create_task, errors)
- [x] T023 [US2] Implement graceful shutdown on KeyboardInterrupt with final log entry
- [ ] T024 [US2] Test Watcher: Create test file in Inbox, verify task file appears in Needs_Action within poll_interval + 5 seconds

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - vault with dashboard, Watcher detecting triggers and creating tasks

---

## Phase 5: User Story 3 - Claude Code Task Processing (Priority: P3)

**Goal**: Create Agent Skills and integrate Claude Code to process task files autonomously with HITL approval

**Independent Test**: Can be fully tested by placing a task file in /Needs_Action and verifying Claude Code reads it, processes it via skills, writes completion report, and moves file to /Done (or /Pending_Approval if approval needed).

### Implementation for User Story 3

- [x] T025 [P] [US3] Create `skills/read_task.md` SKILL.md file with Purpose, Inputs, Outputs, Examples, Dependencies, Usage
- [x] T026 [P] [US3] Create `skills/plan_action.md` SKILL.md file with action planning template
- [x] T027 [P] [US3] Create `skills/write_report.md` SKILL.md file with completion report template
- [x] T028 [P] [US3] Create `skills/file_operations.md` SKILL.md file with file move operations template
- [ ] T029 [US3] Create test task file manually in /Needs_Action using schema from data-model.md (YAML frontmatter: source, timestamp, status, priority)
- [ ] T030 [US3] Add "Claude Code Integration" section to quickstart.md documenting invocation pattern (read task → use skills → write results)
- [ ] T031 [US3] Implement file movement logic: Move task from Needs_Action → Done on completion
- [ ] T032 [US3] Implement file movement logic: Move task from Needs_Action → Pending_Approval when approval needed
- [ ] T033 [US3] Document HITL approval workflow: User moves file from Pending_Approval → Needs_Action after review
- [ ] T034 [US3] Update task file status field in YAML frontmatter during processing (pending → processing → completed/approved/failed)
- [ ] T035 [US3] Test Claude Code processing: Place task in Needs_Action, invoke Claude Code with skills, verify completion report in Done

**Checkpoint**: All user stories should now be independently functional - vault, Watcher, and Claude Code processing all working

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [x] T036 [P] Create `tests/test_watcher.py` with basic Watcher functionality tests
- [x] T037 [P] Create `tests/fixtures/` directory with sample trigger files for testing
- [ ] T038 [P] Add comprehensive docstrings to all Python functions and classes
- [x] T039 [P] Create `tests/test_e2e.py` with end-to-end test harness (trigger → detection → processing → completion → log)
- [ ] T040 [P] Verify PEP 8 compliance across all Python files (linting)
- [ ] T041 Run end-to-end prompt test: Create trigger → Watcher detects → Task created → Claude Code processes → Completion logged
- [ ] T042 Verify 99%+ consistency: Run end-to-end test 10 times, count successes
- [ ] T043 Verify Dashboard refresh: Move task between folders, confirm Dashboard updates within 30 seconds
- [ ] T044 Verify structured logging: Check operations.log contains all required fields (timestamp, action, source, status, duration_ms, user)
- [ ] T045 Update README.md with project overview, setup instructions, and Bronze tier status
- [ ] T046 Create architecture diagram showing Watcher → Task File → Agent Skill → Dashboard flow
- [ ] T047 Verify all Agent Skills follow SKILL.md template structure and contain at least one usage example per skill
- [ ] T048 Run Bronze tier verification checklist against spec.md success criteria (SC-001 through SC-008)
- [ ] T049 Document any deviations or limitations in Company_Handbook.md for future tiers

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but independently testable

### Within Each User Story

- Models/configuration first
- Core implementation second
- Integration/testing last
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T001, T002, T003)
- All Foundational tasks can run sequentially (Phase 2 has internal dependencies)
- Once Foundational is done:
  - Developer A: User Story 1 (Vault & Dashboard)
  - Developer B: User Story 2 (Watcher)
  - Developer C: User Story 3 (Claude Code & Skills)
- All skills within User Story 3 marked [P] can run in parallel (T025-T028)
- Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 3

```bash
# Launch all Agent Skills creation together (different files, no dependencies):
Task: "Create skills/read_task.md SKILL.md file"
Task: "Create skills/plan_action.md SKILL.md file"
Task: "Create skills/write_report.md SKILL.md file"
Task: "Create skills/file_operations.md SKILL.md file"

# These can all be created in parallel by different team members
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (directory structure)
2. Complete Phase 2: Foundational (Watcher skeleton, logging utility)
3. Complete Phase 3: User Story 1 (Vault, Dashboard, Company Handbook, Dashboard updater)
4. **STOP and VALIDATE**: Test vault opens in Obsidian, Dashboard.md exists and updates, Company_Handbook.md has content
5. Deploy/demo if ready - you have a working dashboard system

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: Vault + Dashboard)
3. Add User Story 2 → Test independently → Deploy/Demo (Watcher detecting triggers)
4. Add User Story 3 → Test independently → Deploy/Demo (Full autonomous processing)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Vault & Dashboard)
   - Developer B: User Story 2 (Watcher implementation)
   - Developer C: User Story 3 (Agent Skills & Claude Code integration)
3. Stories complete and integrate independently
4. Reunite for Phase 6: Polish & Testing

---

## Task Summary

| Phase | Description | Task Count |
|-------|-------------|------------|
| Phase 1 | Setup | 3 |
| Phase 2 | Foundational | 5 |
| Phase 3 | User Story 1 (Vault) | 7 |
| Phase 4 | User Story 2 (Watcher) | 9 |
| Phase 5 | User Story 3 (Claude Code) | 11 |
| Phase 6 | Polish & Testing | 14 |
| **Total** | **All phases** | **49** |

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Verify Dashboard updates after each story completes
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- End-to-end test (T040) validates entire Bronze tier functionality
- All tasks include exact file paths for clarity
