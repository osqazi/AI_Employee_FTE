# Feature Specification: Silver Tier Functional Assistant

**Feature Branch**: `002-silver-tier`
**Created**: 2026-02-17
**Status**: Draft
**Input**: Silver Tier Specifications for Personal AI Employee – Hackathon 0 Project

## Overview

The Silver Tier extends the completed Bronze Tier into a working Functional Assistant with **two additional watchers (Gmail + WhatsApp)**, MCP server integration, Claude Code reasoning loop with Plan.md, and Human-in-the-Loop approval workflows.

**Target User**: Solo intermediate developer (Owais, Karachi) who has completed Bronze Tier
**Implementation Time**: 20-30 hours
**Primary Tools**: Claude Code (reasoning), Obsidian (dashboard), Python/Node.js (watchers), MCP servers (actions)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Multi-Watcher Trigger Detection (Priority: P1)

As a developer, I want multiple watcher scripts (Gmail, WhatsApp, filesystem) monitoring different trigger sources so that the AI can detect work items from multiple channels automatically.

**Why this priority**: Multiple watchers are the core Silver Tier enhancement over Bronze, enabling comprehensive task detection across communication channels.

**Independent Test**: Can be fully tested by simulating triggers in each channel (new email, WhatsApp message, file) and verifying corresponding task files appear in /Needs_Action with correct source attribution.

**Acceptance Scenarios**:

1. **Given** Gmail Watcher is running, **When** new email arrives, **Then** task file created in /Needs_Action with email metadata (sender, subject, timestamp, content)
2. **Given** WhatsApp Watcher is running, **When** new message received, **Then** task file created with message content and sender
3. **Given** Filesystem Watcher is running, **When** file added to Inbox, **Then** task file created (Bronze functionality maintained)
4. **Given** multiple triggers arrive simultaneously, **When** watchers process them, **Then** each creates separate task file without conflicts

---

### User Story 2 - Claude Code Reasoning Loop with Plan.md (Priority: P2)

As a developer, I want Claude Code to read /Needs_Action tasks, create/update Plan.md files with checkboxes, and drive task progression autonomously so that complex multi-step tasks are completed systematically.

**Why this priority**: The reasoning loop is the "brain" of the AI employee, transforming simple triggers into completed actions through systematic planning.

**Independent Test**: Can be fully tested by placing a complex task in /Needs_Action and verifying Claude Code creates Plan.md with checkboxes, updates progress, and completes all steps.

**Acceptance Scenarios**:

1. **Given** task in /Needs_Action, **When** Claude Code processes it, **Then** Plan.md created with ordered action items as checkboxes
2. **Given** Plan.md exists, **When** Claude Code executes steps, **Then** checkboxes updated as [x] for completed items
3. **Given** all checkboxes complete, **When** task finished, **Then** Plan.md archived and task moved to /Done
4. **Given** step requires approval, **When** Claude Code reaches it, **Then** execution pauses and file moves to /Pending_Approval

---

### User Story 3 - MCP Server Integration (Priority: P3)

As a developer, I want at least one fully working MCP server (email-mcp) configured for external actions so that the AI can execute real-world tasks like sending emails.

**Why this priority**: MCP servers enable the AI to take external actions beyond the vault, making it a true FTE rather than just a tracking system.

**Independent Test**: Can be fully tested by configuring email-mcp in mcp.json, creating an email task, and verifying email is sent via MCP when task is processed.

**Acceptance Scenarios**:

1. **Given** email-mcp configured, **When** Claude Code invokes send_email skill, **Then** email sent to specified recipient
2. **Given** MCP server error occurs, **When** send fails, **Then** error logged and task moved for manual review
3. **Given** multiple MCP actions needed, **When** orchestrator calls them, **Then** each action logged with result

---

### User Story 4 - Human-in-the-Loop Approval Workflow (Priority: P4)

As a developer, I want a complete HITL approval workflow with /Pending_Approval → /Approved or /Rejected folders so that I maintain control over sensitive actions while benefiting from automation.

**Why this priority**: HITL is constitutionally required for sensitive actions and ensures the AI remains an assistant under human control.

**Independent Test**: Can be fully tested by creating a task requiring approval, moving it through the workflow, and verifying MCP actions only trigger on approval.

**Acceptance Scenarios**:

1. **Given** sensitive action detected, **When** task created, **Then** it goes to /Pending_Approval automatically
2. **Given** task in /Pending_Approval, **When** user reviews and approves, **Then** file moved to /Approved folder
3. **Given** file in /Approved, **When** orchestrator checks, **Then** it processes the approved action via MCP
4. **Given** user rejects task, **When** file moved to /Rejected, **Then** task closed with rejection reason logged

---

### User Story 5 - Basic Scheduling (Priority: P5)

As a developer, I want basic scheduling (cron/Task Scheduler) for daily/weekly tasks so that routine activities happen automatically without manual triggering.

**Why this priority**: Scheduling enables proactive automation rather than just reactive trigger processing, making the AI truly autonomous for routine tasks.

**Independent Test**: Can be fully tested by scheduling a daily task or weekly summary and verifying it executes at the scheduled time.

**Acceptance Scenarios**:

1. **Given** daily task scheduled, **When** scheduled time arrives, **Then** task created automatically
2. **Given** weekly summary task scheduled, **When** schedule triggers, **Then** summary generated from vault data
3. **Given** schedule needs update, **When** cron/Task Scheduler modified, **Then** new schedule takes effect immediately

---

### Edge Cases

- **What happens when MCP server is unavailable?** Task remains in /Needs_Action with error logged, retry after 5 minutes, escalate to /Inbox after 3 failures
- **How does system handle Gmail API rate limits?** Watcher implements exponential backoff, logs rate limit event, resumes when limit resets
- **How does system handle conflicting approvals?** Only user can approve/reject; AI cannot override human decision; audit trail maintained
- **What happens when scheduled task conflicts with existing task?** Tasks queued and processed sequentially; no parallel execution in Silver tier
- **What happens when WhatsApp API changes?** MCP server abstraction isolates changes, update MCP server only without affecting watchers

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST implement exactly two additional watcher scripts beyond Bronze filesystem watcher (Gmail Watcher + WhatsApp Watcher)
- **FR-002**: Gmail Watcher MUST monitor inbox and create task files for new emails with sender, subject, timestamp, and content
- **FR-003**: WhatsApp Watcher MUST monitor messages and create task files with sender, message content, and timestamp
- **FR-004**: System MUST implement email sending capability via MCP server for external communications with HITL approval before execution
- **FR-005**: Claude Code reasoning loop MUST read /Needs_Action tasks and create/update Plan.md files with ordered action items as checkboxes
- **FR-006**: Plan.md MUST track progress by updating checkboxes ([ ] → [x]) as steps complete
- **FR-007**: At least one MCP server (email-mcp) MUST be fully configured and operational in ~/.config/claude-code/mcp.json
- **FR-008**: HITL approval workflow MUST use /Pending_Approval → /Approved or /Rejected folder pattern with orchestrator checking /Approved for execution
- **FR-009**: Basic scheduling MUST be implemented using cron (Linux/macOS) or Task Scheduler (Windows) for daily/weekly tasks
- **FR-010**: All AI-driven functionality MUST be implemented as reusable Agent Skills (SKILL.md files) that Claude Code can invoke
- **FR-011**: System MUST use connected MCP server to fetch current documentation for Python 3.13, Playwright, Gmail API, WhatsApp API, Node.js, MCP templates, and cron syntax (or fetch from official documentation if MCP unavailable)
- **FR-012**: Every phase MUST include dedicated "Prompt Test" procedure for verification before proceeding to next phase

### Key Entities

- **BaseWatcher**: Abstract parent class for all watchers providing common functionality (logging, task creation, error handling)
- **GmailWatcher**: Extends BaseWatcher; monitors Gmail inbox via Gmail API; creates task files for new emails
- **WhatsAppWatcher**: Extends BaseWatcher; monitors WhatsApp messages; creates task files for messages
- **EmailMCP**: MCP server for sending emails; configured in ~/.config/claude-code/mcp.json; invoked by Claude Code skills
- **Plan.md**: Markdown file with checkbox-based action items; created by Claude Code reasoning loop; tracks task progress
- **HITL Workflow**: Folder-based approval pattern (/Pending_Approval → /Approved or /Rejected); ensures human control over sensitive actions

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developer with intermediate Python/Node.js proficiency can implement all Silver Tier features in 20-30 hours following the specification
- **SC-002**: Exactly 2 additional watchers operational beyond Bronze filesystem watcher (Gmail + WhatsApp)
- **SC-003**: Claude Code reasoning loop creates Plan.md for 100% of tasks placed in /Needs_Action
- **SC-004**: At least 1 MCP server (email-mcp) fully configured and successfully sends test email
- **SC-005**: HITL approval workflow processes 100% of sensitive actions through /Pending_Approval → /Approved path
- **SC-006**: Basic scheduling executes at least 1 daily task and 1 weekly task at scheduled times
- **SC-007**: All AI functionality documented as Agent Skills with at least 5 SKILL.md files created
- **SC-008**: Each phase passes its dedicated "Prompt Test" verification before proceeding to next phase
- **SC-009**: Full Silver Tier passes comprehensive Prompt Test verifying all deliverables functional and integrated

---

## Assumptions

- Developer has successfully completed Bronze Tier (vault structure, Dashboard.md, Company_Handbook.md, filesystem watcher operational)
- Developer has intermediate proficiency with Python, Node.js, command-line, and API integrations
- Claude Code subscription active and configured
- Gmail API credentials obtainable via Google Cloud Console
- WhatsApp Business API or MCP server available for integration
- Development environment: Windows (Task Scheduler) or Linux/macOS (cron)
- 20-30 hours available for implementation over 2-4 weeks
- Ralph Wiggum loop documented in handbook Section 2D is Gold Tier requirement; Silver tier uses graceful degradation only (exponential backoff, error logging)

---

## Out of Scope (Gold/Platinum Tier)

- LinkedIn, Facebook, Instagram, Twitter posting (Handbook Section "Hackathon Scope & Tiered Deliverables" lists "Automatically Post on LinkedIn" but also includes "Facebook/Instagram/Twitter posting" under Gold Tier; for consistency and scope management, all social media auto-posting deferred to Gold tier)
- Odoo JSON-RPC accounting integration
- Ralph Wiggum loop (advanced error recovery) - Handbook Section 2D documents the pattern but lists it under Gold Tier requirements
- Weekly Business & Accounting Audit
- Multiple MCP servers (1 required, additional optional)
- Cloud delegation or vault sync
- Work-zone specialization
- 24/7 cloud orchestration
- Full production security hardening
- Advanced audit logging beyond basic operational logs
- Error recovery beyond graceful degradation

---

## Dependencies

- **Bronze Tier Completion**: Vault structure, Dashboard, Company Handbook, filesystem watcher
- **Claude Code**: Active subscription, configured for local development
- **Python 3.13+**: For watcher scripts and orchestration
- **Node.js**: For MCP server implementation
- **Gmail API**: Credentials from Google Cloud Console
- **WhatsApp Business API**: Or MCP server integration
- **MCP Server Framework**: Claude Code MCP configuration

---

## Verification Checklist

- [ ] 2 additional watchers implemented (Gmail + WhatsApp)
- [ ] Claude Code creates Plan.md with checkboxes for tasks
- [ ] 1+ MCP server configured and operational
- [ ] HITL workflow uses /Pending_Approval → /Approved or /Rejected pattern
- [ ] Basic scheduling implemented (cron or Task Scheduler)
- [ ] 5+ Agent Skills documented as SKILL.md files
- [ ] Each phase includes "Prompt Test" procedure
- [ ] Full Silver Tier Prompt Test passes all deliverables

---

**Next Phase**: `/sp.plan` - Create technical architecture plan for Silver Tier implementation
