# Feature Specification: Bronze Tier Foundation

**Feature Branch**: `001-bronze-tier-foundation`
**Created**: 2026-02-17
**Status**: Draft
**Input**: Building an Autonomous FTE (Full-Time Equivalent) as a Personal AI Employee: Bronze Tier (Foundation)

## Clarifications

### Session 2026-02-17

- Q: Which trigger source should the Bronze Tier Watcher implement? → A: File system monitoring only
- Q: How should the user provide approval when Claude Code reaches a sensitive action? → A: File-based approval using /Pending_Approval folder
- Q: What is the minimum required YAML frontmatter schema for Task Files? → A: YAML frontmatter + body structure
- Q: How should the Dashboard stay synchronized with task file changes? → A: Polling-based updates every 30 seconds
- Q: What minimum information must each log entry contain? → A: Structured logging with timestamp, action, source, status, duration, user

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vault Setup and Dashboard Creation (Priority: P1)

As a hackathon participant, I want to set up an Obsidian vault with a Dashboard and Company Handbook so that I have a centralized interface for monitoring AI operations and defined rules of engagement.

**Why this priority**: The vault is the foundation of the entire system, serving as both memory and GUI. Without it, no other functionality can operate.

**Independent Test**: Can be fully tested by opening the vault in Obsidian and verifying Dashboard.md displays real-time summaries and Company_Handbook.md contains operational rules.

**Acceptance Scenarios**:

1. **Given** an empty Obsidian vault, **When** the setup is complete, **Then** the folder structure includes /Inbox, /Needs_Action, and /Done directories
2. **Given** the vault structure exists, **When** Dashboard.md is opened, **Then** it displays a real-time summary of pending tasks and recent activity
3. **Given** the vault is configured, **When** Company_Handbook.md is reviewed, **Then** it contains clear rules of engagement for AI operations

---

### User Story 2 - Watcher Trigger Detection (Priority: P2)

As a user, I want a Watcher script to monitor for file system triggers and create task files in the vault so that the AI can proactively detect work items.

**Why this priority**: The Watcher provides the perception layer, enabling the AI to detect when action is needed without manual input.

**Independent Test**: Can be fully tested by simulating a trigger (creating a file in the monitored directory) and verifying a corresponding .md file appears in /Needs_Action.

**Acceptance Scenarios**:

1. **Given** the Watcher is running, **When** a new file appears in the monitored directory, **Then** a .md file is created in /Needs_Action with relevant details
2. **Given** a trigger file exists, **When** the Watcher processes it, **Then** the file content includes timestamp, source, and description of the trigger
3. **Given** the Watcher encounters an error, **When** it fails to process a trigger, **Then** an error log is created for debugging

---

### User Story 3 - Claude Code Task Processing (Priority: P3)

As a user, I want Claude Code to read task files from the vault, process them using Agent Skills, and write results back so that tasks are completed autonomously with human oversight.

**Why this priority**: This is the core reasoning engine that transforms detected triggers into completed actions, delivering the primary value proposition.

**Independent Test**: Can be fully tested by placing a task file in /Needs_Action and verifying Claude Code reads it, processes it via skills, and writes output to /Done with a completion log.

**Acceptance Scenarios**:

1. **Given** a task file exists in /Needs_Action, **When** Claude Code processes it, **Then** it reads the file and creates a plan using Agent Skills
2. **Given** a plan is created, **When** execution completes, **Then** results are written to /Done with a summary report
3. **Given** a task requires human approval, **When** Claude Code reaches an approval point, **Then** it moves the file to /Pending_Approval for user review
4. **Given** a file is in /Pending_Approval, **When** user reviews and approves, **Then** user moves file back to /Needs_Action for continuation

---

### Edge Cases

- What happens when the Watcher detects a malformed trigger file? System logs the error and skips processing, leaving the file in /Inbox for manual review.
- How does system handle Claude Code API failures? Failed operations are logged with structured format, and the task file remains in /Needs_Action for retry or manual intervention.
- What happens when multiple triggers arrive simultaneously? Triggers are queued and processed sequentially to maintain audit trail integrity.
- How does the system handle vault file lock conflicts? The system waits for file release with a timeout, then logs a conflict warning.
- How does user resume a task after approval? User moves file from /Pending_Approval back to /Needs_Action, and Claude Code continues processing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an Obsidian vault with Dashboard.md displaying real-time operational summaries
- **FR-002**: System MUST provide Company_Handbook.md containing rules of engagement and operational guidelines
- **FR-003**: System MUST implement a folder structure with /Inbox, /Needs_Action, /Pending_Approval, and /Done for task lifecycle management
- **FR-004**: System MUST implement a Watcher script that monitors a designated directory for new or modified files
- **FR-005**: Watcher MUST create .md files in /Needs_Action when triggers are detected
- **FR-006**: System MUST integrate Claude Code to read task files and process them autonomously
- **FR-007**: All AI functionality MUST be implemented as Agent Skills (SKILL.md files) for reproducibility
- **FR-008**: System MUST log all operations using structured format with timestamp, action, source, status, duration, and user (if applicable)
- **FR-009**: System MUST require human-in-the-loop approval for sensitive actions by moving task files to /Pending_Approval folder
- **FR-010**: System MUST support end-to-end prompt testing to verify functionality post-completion
- **FR-011**: Dashboard MUST refresh every 30 seconds via polling to reflect task status changes

### Key Entities

- **Task File**: A Markdown file with YAML frontmatter (source, timestamp, status, priority) and body (description, completion report)
- **Watcher**: A monitoring component that polls a designated directory for new or modified files and creates task files in the vault
- **Agent Skill**: A documented capability (SKILL.md) that defines how AI performs a specific task
- **Dashboard**: A Markdown file providing visibility into system state, pending tasks, and recent activity; refreshed every 30 seconds via polling
- **Company Handbook**: A Markdown file containing operational rules, guidelines, and constraints for AI behavior
- **Pending Approval Folder**: /Pending_Approval directory where task files wait for human review before sensitive actions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete vault setup and verify all required files exist within 2 hours of starting
- **SC-002**: Watcher detects and creates task files for 100% of simulated file triggers during testing
- **SC-003**: Claude Code processes task files and produces completion reports with 99%+ success rate (successful completions / total attempts)
- **SC-004**: End-to-end prompt test (file trigger → detection → processing → approval → completion → log) passes without manual intervention
- **SC-005**: All AI functionality is documented as Agent Skills with clear usage examples
- **SC-006**: System achieves 85-90% simulated cost savings per task compared to human FTE baseline ($20/hour manual processing rate)
- **SC-007**: Dashboard reflects task status changes within 30 seconds via polling-based refresh
- **SC-008**: All operations are logged with structured format containing timestamp, action, source, status, duration, and user (if applicable)
