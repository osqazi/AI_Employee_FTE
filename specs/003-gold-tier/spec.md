# Feature Specification: Gold Tier Autonomous Assistant

**Feature Branch**: `003-gold-tier`
**Created**: 2026-02-20
**Status**: Draft
**Input**: Gold Tier of Personal AI Employee for Hackathon 0 - Full autonomy with cross-domain integration, Odoo accounting, social media integrations, multiple MCP servers, weekly audits, error handling, Ralph Wiggum loop

## Overview

The Gold Tier extends the completed Silver Tier (functional assistant with Gmail/WhatsApp watchers, LinkedIn posting, reasoning loops, MCP server for emails, human-in-the-loop approvals, and scheduling) into a fully autonomous Personal AI Employee. This tier achieves complete cross-domain integration between personal and business affairs, with advanced automation capabilities including Odoo accounting integration, social media management, comprehensive error recovery, and the Ralph Wiggum loop for multi-step autonomous task completion.

**Target User**: Hackathon 0 judges evaluating technical proficiency, autonomy, and integration quality; developer for production deployment
**Implementation Time**: 40+ hours
**Primary Tools**: Claude Code (reasoning with Ralph Wiggum loop), Obsidian (dashboard/memory), Python/Node.js (watchers/MCP), Odoo Community v19+ (accounting), MCP servers (diverse actions)

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cross-Domain Integration (Priority: P1)

As a business owner, I want personal communications (WhatsApp, Gmail) to automatically trigger business actions (Odoo invoices, social media posts) so that my personal and business affairs are seamlessly integrated without manual intervention.

**Why this priority**: Cross-domain integration is the core differentiator of Gold Tier, transforming isolated tools into a unified autonomous employee that understands context across personal and business domains.

**Independent Test**: Can be fully tested by sending a WhatsApp message about a client project and verifying: (1) Odoo invoice is created, (2) social media summary is drafted, (3) all actions logged, (4) HITL approvals requested where needed.

**Acceptance Scenarios**:

1. **Given** a WhatsApp message about client work, **When** received and processed, **Then** Odoo invoice is created with client details and amount
2. **Given** an email about business achievement, **When** processed, **Then** social media post is drafted for approval
3. **Given** a file drop with transaction receipt, **When** detected, **Then** logged in Odoo accounting and categorized
4. **Given** cross-domain trigger requiring approval, **When** flagged, **Then** moved to /Pending_Approval with full context

---

### User Story 2 - Odoo Accounting Integration (Priority: P2)

As a business owner, I want the AI to manage accounting tasks via Odoo (invoice generation, transaction logging, audits) so that financial records are maintained automatically without manual bookkeeping.

**Why this priority**: Automated accounting reduces administrative overhead by 85-90% and ensures real-time financial visibility for decision-making.

**Independent Test**: Can be fully tested by simulating a business transaction and verifying: (1) invoice created in Odoo via JSON-RPC, (2) transaction logged with proper categorization, (3) audit trail maintained, (4) financial summary updated in Dashboard.md.

**Acceptance Scenarios**:

1. **Given** a completed client project, **When** flagged for invoicing, **Then** Odoo invoice created with line items and sent via email
2. **Given** a business expense receipt, **When** detected, **Then** transaction logged in Odoo with category and amount
3. **Given** end of week, **When** audit runs, **Then** revenue/expenses report generated with transaction details
4. **Given** Odoo API failure, **When** detected, **Then** error logged, retry attempted, fallback to manual alert

---

### User Story 3 - Social Media Management (Priority: P3)

As a business owner, I want the AI to manage Facebook, Instagram, and Twitter/X (posting messages, generating summaries) so that my social media presence is maintained consistently without daily manual effort.

**Why this priority**: Consistent social media presence drives business growth; automation ensures regular posting while HITL maintains brand voice control.

**Independent Test**: Can be fully tested by creating business content and verifying: (1) posts created for each platform (min 3 test posts/platform), (2) summaries generated, (3) HITL approval workflow followed, (4) engagement metrics logged.

**Acceptance Scenarios**:

1. **Given** business achievement detected, **When** processed, **Then** platform-specific posts drafted for Facebook, Instagram, Twitter/X
2. **Given** weekly activity summary, **When** generated, **Then** social media summary post created with highlights
3. **Given** post requiring approval, **When** drafted, **Then** moved to /Pending_Approval with preview
4. **Given** social media API rate limit, **When** hit, **Then** queued for retry, user notified of delay

---

### User Story 4 - Multiple MCP Servers (Priority: P4)

As a system administrator, I want multiple specialized MCP servers (email, social, Odoo, browser automation) so that the AI can execute diverse actions through appropriate channels with proper authentication and error handling.

**Why this priority**: Specialized MCP servers enable modular, maintainable integrations where each server handles specific domain expertise (accounting, social, communication).

**Independent Test**: Can be fully tested by invoking each MCP server type and verifying: (1) minimum 4 MCP servers deployed (email, social, Odoo, browser), (2) each server responds to tool calls, (3) errors handled gracefully, (4) actions logged.

**Acceptance Scenarios**:

1. **Given** email sending request, **When** email-mcp invoked, **Then** email sent via SMTP with confirmation
2. **Given** social post request, **When** social-mcp invoked, **Then** post published to specified platform
3. **Given** invoice creation request, **When** odoo-mcp invoked, **Then** invoice created via JSON-RPC
4. **Given** web interaction request, **When** browser-mcp invoked, **Then** browser automation executed (e.g., form fill, data extract)

---

### User Story 5 - Weekly Audits & CEO Briefing (Priority: P5)

As a CEO, I want automated weekly business and accounting audits that generate CEO Briefings (revenue reports, bottlenecks, task summaries) in Dashboard.md so that I have comprehensive business visibility without manual report preparation.

**Why this priority**: Weekly CEO Briefings transform raw data into actionable insights, enabling informed decision-making with minimal time investment.

**Independent Test**: Can be fully tested by running weekly audit and verifying: (1) revenue report generated from Odoo data, (2) bottlenecks identified from task delays, (3) task summary compiled from completed tasks, (4) briefing posted in Dashboard.md with clear sections.

**Acceptance Scenarios**:

1. **Given** week end (Sunday 11:59 PM), **When** audit scheduled, **Then** revenue/expenses report generated from Odoo
2. **Given** completed tasks for week, **When** analyzed, **Then** task summary with completion rates generated
3. **Given** delayed tasks identified, **When** analyzed, **Then** bottlenecks section highlights root causes
4. **Given** audit complete, **When** briefing ready, **Then** Dashboard.md updated with CEO Briefing section

---

### User Story 6 - Error Recovery & Ralph Wiggum Loop (Priority: P6)

As a system operator, I want the AI to handle failures gracefully (retry logic, fallback modes, human alerts) and use the Ralph Wiggum loop for multi-step autonomy so that tasks complete successfully even when individual steps fail.

**Why this priority**: Error recovery ensures 95%+ uptime and task completion; Ralph Wiggum loop enables true autonomy for complex multi-step workflows without constant human intervention.

**Independent Test**: Can be fully tested by simulating failures and verifying: (1) retry logic attempts 3x with exponential backoff, (2) fallback to manual mode on persistent failure, (3) human alert sent for critical failures, (4) Ralph Wiggum loop completes multi-step invoice flow autonomously.

**Acceptance Scenarios**:

1. **Given** API timeout (e.g., Odoo unavailable), **When** detected, **Then** retry with 2s, 4s, 8s backoff
2. **Given** persistent failure (3 retries), **When** exhausted, **Then** fallback to manual alert with full context
3. **Given** multi-step task (invoice flow), **When** Ralph Wiggum loop active, **Then** iterates read-plan-act-check until complete
4. **Given** step failure in loop, **When** detected, **Then** self-corrects and retries alternative approach

---

### Edge Cases

- **What happens when Odoo is offline during invoice creation?** Task queued, retry every 5 minutes for 1 hour, then moved to /Inbox with "Odoo Offline" alert
- **How does system handle social media API rate limits?** Posts queued, scheduled for off-peak hours, user notified of queue status
- **What happens when Ralph Wiggum loop exceeds max iterations (10)?** Loop terminates, task moved to /Inbox with "Max Iterations Exceeded" alert and partial progress logged
- **How does system handle conflicting cross-domain triggers?** Triggers queued and processed sequentially; conflicts logged and escalated if unresolved after 3 attempts
- **What happens when HITL approval times out (7 days)?** Approval request expires, task moved to /Inbox with "Approval Timeout" alert, sender notified

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST achieve full cross-domain integration between personal (Gmail, WhatsApp) and business (Odoo, social media) affairs with verified trigger-action flows
- **FR-002**: Odoo Community v19+ accounting system MUST be operational and integrated via MCP using JSON-RPC APIs for invoice creation, transaction logging, and audits
- **FR-003**: Social media integrations (Facebook, Instagram, Twitter/X) MUST post messages, generate summaries, and log actions via MCP servers with minimum 3 test posts/summaries per platform
- **FR-004**: Minimum 4 MCP servers (email, social, Odoo, browser) MUST be deployed and used for distinct action types
- **FR-005**: Weekly audit and CEO Briefing MUST be automated, generating reports in Obsidian vault covering revenue, bottlenecks, and tasks via scheduling; MUST include Business_Goals.md template for goal tracking and subscription audit logic
- **FR-006**: Error recovery and graceful degradation MUST be implemented with retry logic (3 attempts, exponential backoff), fallback to manual alerts, watchdog process for monitoring critical processes, and 95%+ uptime in tests
- **FR-007**: Comprehensive audit logging MUST record all actions in /Logs/ with timestamps, agents involved, and outcomes; logs MUST be queryable for reviews
- **FR-008**: Ralph Wiggum loop (Stop hook pattern per Handbook Section 2D) MUST be operational for multi-step autonomy, demonstrating iterative read-plan-act-check execution
- **FR-009**: Documentation MUST be complete with architecture overview, lessons learned in README.md, setup guides, diagrams, and builtin agents/skills/MCP usage examples
- **FR-010**: All AI features MUST be implemented as Agent Skills (e.g., odoo_api_call, social_posting) using builtin agents for planning/reasoning
- **FR-011**: Human-in-the-loop approval MUST be mandatory for sensitive actions (posts, payments, external communications) via /Pending_Approval workflow
- **FR-012**: Prompt tests MUST pass after each phase (Odoo, social media, audits, error handling, Ralph Wiggum, logging, documentation) with simulated triggers matching handbook examples
- **FR-013**: DEV_MODE flag MUST be implemented in all action scripts to prevent real external actions during development/testing
- **FR-014**: Rate limiting MUST be implemented for all MCP servers (social media: 200 requests per 15-minute window per platform) to prevent API rate limit errors

### Key Entities

- **Cross-Domain Trigger**: Event from personal domain (WhatsApp, Gmail) that triggers business action (Odoo invoice, social post) with context preservation
- **Odoo MCP Server**: MCP server handling Odoo JSON-RPC API calls for invoices, transactions, audits using authentication tokens
- **Social MCP Server**: MCP server managing Facebook Graph API, Instagram API, Twitter/X API for posting and summary generation
- **Browser MCP Server**: MCP server providing browser automation (Playwright-based) for web interactions, form filling, data extraction
- **CEO Briefing**: Weekly report in Dashboard.md with revenue, expenses, bottlenecks, task summaries, and actionable insights; includes subscription audit suggestions
- **Business_Goals.md**: Template for tracking revenue targets, key metrics, active projects, and subscription audit rules (per Handbook Section 4)
- **Ralph Wiggum Loop**: Autonomous multi-step task execution pattern (read-plan-act-check iteration) using Stop hook until task resolution or max iterations (10)
- **Audit Log**: Comprehensive log entry with timestamp, agent/skill used, action type, outcome, duration, and error details (if any)
- **Watchdog Process**: Monitor process that watches and restarts critical processes (orchestrator, watchers, MCP servers) on failure

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Full cross-domain integration verified with end-to-end flow: WhatsApp message → Odoo invoice → social summary posted after approval (100% success rate in 10 test runs)
- **SC-002**: Odoo accounting operational with 20+ test transactions (invoices, expenses, audits) processed via JSON-RPC with 95%+ success rate
- **SC-003**: Social integrations functional with minimum 3 test posts/summaries per platform (Facebook, Instagram, Twitter/X) logged and approved via HITL
- **SC-004**: Minimum 4 MCP servers (email, social, Odoo, browser) deployed, tested, and used for distinct action types with 100% tool call success
- **SC-005**: Weekly CEO Briefing automated and generated in Dashboard.md with revenue, bottlenecks, tasks sections; runs every Sunday at 11:59 PM; includes Business_Goals.md tracking and subscription audit suggestions
- **SC-006**: Error recovery achieves 95%+ uptime in failure simulation tests (API timeouts, rate limits, network issues) with retry, fallback, watchdog monitoring, and alert mechanisms
- **SC-007**: Comprehensive audit logging captures 100% of actions in /Logs/ with queryable format (JSON-lines) and minimum 90-day retention
- **SC-008**: Ralph Wiggum loop demonstrates multi-step autonomy with invoice flow (detection → Odoo invoice → email send → social summary) completed in ≤10 iterations
- **SC-009**: Documentation complete with architecture diagram, setup guide, lessons learned, and agent/skill/MCP usage examples in README.md
- **SC-010**: All phase prompt tests pass (7 phases: Odoo, social, audits, error handling, Ralph Wiggum, logging, documentation) with 100% handbook requirement fulfillment
- **SC-011**: DEV_MODE flag functional in all action scripts - prevents real external actions when enabled
- **SC-012**: Rate limiting functional for all MCP servers - no API rate limit errors in 100+ test requests (200 requests per 15-minute window enforced)

---

## Assumptions

- Developer has successfully completed Silver Tier (3 watchers operational, Plan.md management, email-mcp, HITL workflow, scheduling, 7 Agent Skills)
- Odoo Community v19+ is already installed locally and accessible via JSON-RPC APIs
- Developer has intermediate-to-advanced skills in Python, Node.js, REST/JSON-RPC APIs, and Claude Code
- Social media developer accounts available for Facebook Graph API, Instagram API, Twitter/X API access
- 40+ hours available for implementation over 4-6 weeks (approximately 1 week per major integration)
- Local-first privacy maintained: no cloud dependencies except required API calls; secrets in .env, never synced
- Hackathon 0 evaluation criteria prioritize autonomy, integration quality, and handbook adherence over production-scale security

---

## Out of Scope (Platinum Tier)

- Cloud deployment (all components remain local-first)
- Work-zone specialization (single unified system)
- Synced vaults via Git/Syncthing (single local vault)
- A2A (agent-to-agent) messaging (single agent architecture)
- Advanced Odoo customizations beyond basic accounting modules (no enterprise features, custom modules)
- Real-time social media monitoring (focus on posting/summarizing only; watchers handle inputs)
- Full-scale production security (no advanced encryption; basic HITL and audit logging suffice)
- Medical/legal automations (business accounting and social media only)
- Automated CI/CD pipelines (manual prompt tests per phase)
- Multi-user support (single user/owner)

---

## Dependencies

- **Silver Tier Completion**: All 86 tasks complete, 7 Agent Skills operational, 3 watchers functional
- **Claude Code**: Active subscription with Stop hook support for Ralph Wiggum loop
- **Odoo Community v19+**: Local installation with JSON-RPC API access enabled
- **Python 3.13+**: For watchers, MCP servers, Odoo integration
- **Node.js v18+**: For MCP servers (email, social, browser)
- **Social Media API Access**: Facebook Graph API, Instagram API, Twitter/X API developer accounts
- **MCP Server Framework**: @modelcontextprotocol/sdk for MCP server development
- **Requests Library**: For Odoo JSON-RPC and social media API calls

---

## Verification Checklist

- [ ] Cross-domain integration tested end-to-end (WhatsApp → Odoo → social)
- [ ] Odoo MCP server operational with 20+ test transactions
- [ ] Social MCP servers (Facebook, Instagram, Twitter/X) functional with 3+ posts/platform
- [ ] Browser MCP server deployed and tested with web automation tasks
- [ ] Weekly CEO Briefing automated and generating in Dashboard.md
- [ ] Error recovery tested with simulated failures (95%+ success rate)
- [ ] Audit logging comprehensive and queryable (90-day retention)
- [ ] Ralph Wiggum loop demonstrated with multi-step invoice flow
- [ ] Documentation complete (architecture, setup, lessons learned)
- [ ] All 7 phase prompt tests passed (Odoo, social, audits, error, Ralph Wiggum, logging, docs)
- [ ] All AI features implemented as Agent Skills (10+ new skills for Gold Tier)
- [ ] HITL approval workflow enforced for all sensitive actions

---

**Next Phase**: `/sp.plan` - Create technical architecture plan for Gold Tier implementation with phased approach (Odoo → social → audits → error handling → Ralph Wiggum → logging → documentation)
