<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0 (Initial constitution)

Added Principles:
- I. Autonomy with Human-in-the-Loop Safeguards
- II. Local-First Privacy
- III. Modularity and Extensibility
- IV. Reliability Through Iteration
- V. Phase-by-Phase Development
- VI. Integration of Connected MCP Servers

Added Sections:
- Core Principles (6 principles)
- Key Standards (Agent Skills, Code Quality, Documentation, Testing, Security, Tool Usage)
- Constraints (Tech Stack, Tiered Progression, Hardware, Timeline, Ethics)

Removed Sections:
- None (initial creation)

Templates Status:
- ✅ .specify/templates/plan-template.md - Constitution Check section compatible
- ✅ .specify/templates/spec-template.md - No conflicts with standards
- ✅ .specify/templates/tasks-template.md - Phase structure aligns with Principle V
- ✅ .qwen/commands/sp.constitution.md - Generic agent references maintained

Follow-up TODOs:
- None
-->

# AI-Assist-FTE Constitution

## Core Principles

### I. Autonomy with Human-in-the-Loop Safeguards

The AI operates proactively to manage personal and business affairs, but MUST
require explicit human approval for sensitive actions including payments,
legal commitments, and external communications.

**Non-negotiable rules**:
- All financial transactions require HITL approval before execution
- All external communications (email, social media) require HITL approval
- Audit logging MUST record all autonomous actions and approval decisions
- Kill switches MUST be available to halt autonomous operations immediately

**Rationale**: Balances efficiency of automation with accountability and risk
mitigation for high-stakes decisions.

### II. Local-First Privacy

Data storage and processing MUST prioritize local systems using Obsidian vault
to minimize external exposure and maintain user control over personal information.

**Non-negotiable rules**:
- Personal data stored locally in Obsidian vault by default
- Cloud sync only for backup purposes with end-to-end encryption
- No external API calls without explicit user configuration
- Secrets (.env, tokens) NEVER committed to version control

**Rationale**: Protects user privacy by keeping sensitive data under direct user
control while enabling optional cloud connectivity.

### III. Modularity and Extensibility

All components (Watchers, MCP servers, Claude Code loops) MUST be designed as
reusable, scalable modules supporting tiered progression (Bronze → Platinum).

**Non-negotiable rules**:
- Each component MUST be independently testable and documented
- Components MUST expose clear interfaces for integration
- New features MUST extend existing modules rather than duplicate functionality
- Agent Skills MUST be implemented as SKILL.md files for reproducibility

**Rationale**: Enables incremental development and easy scaling across tiers
while maintaining code reusability and reducing technical debt.

### IV. Reliability Through Iteration

Multi-step task completion MUST implement error recovery mechanisms including
the Ralph Wiggum loop for iterative refinement and self-correction.

**Non-negotiable rules**:
- All long-running operations MUST implement retry logic with backoff
- Error states MUST trigger automatic recovery attempts before escalation
- Failed operations MUST log detailed context for debugging
- Watchdog processes MUST monitor and restart failed components

**Rationale**: Ensures 24/7 operational reliability expected of an FTE employee
through automated error handling and self-healing capabilities.

### V. Phase-by-Phase Development

Development MUST proceed tier by tier (Bronze → Silver → Gold → Platinum), with
each phase incorporating builtin agents and skills, verified through prompt tests.

**Non-negotiable rules**:
- Each tier MUST pass verification tests before advancing
- Bronze (8-12h): Basic vault, one watcher, folder structure
- Silver (20-30h): Multiple watchers, MCP integration, scheduling
- Gold (40+h): Full integrations (Odoo, social media, audits)
- Platinum (60+h): Cloud-local hybrid with 24/7 operation simulation
- Prompt tests MUST verify 99%+ consistency per tier

**Rationale**: Enables measurable progress, early validation, and risk reduction
through incremental complexity rather than big-bang development.

### VI. Integration of Connected MCP Servers

MCP servers MUST be used for external actions, documentation retrieval, and
interactions (email, social media, APIs) to streamline development and operations.

**Non-negotiable rules**:
- MCP servers handle all external API interactions
- Framework/library documentation retrieved via MCP when available
- Email sending, social media posting routed through MCP
- MCP server failures MUST degrade gracefully without system crash

**Rationale**: Centralizes external integrations for maintainability and enables
consistent error handling across all external communications.

## Key Standards

### Agent Skills

All AI functionality MUST be implemented as Agent Skills (SKILL.md files) for
reproducibility and instant ramp-up. Each skill MUST include:
- Clear purpose and inputs/outputs
- Usage examples
- Dependencies and prerequisites

### Code Quality

- Python code MUST follow PEP 8 standards
- All scripts MUST have clean modular structure
- Functions MUST include docstrings and error handling
- Code MUST be reviewed for readability before merge

### Documentation

- README.md MUST provide comprehensive project overview
- Architecture diagrams MUST be maintained and updated
- Inline comments MUST explain non-obvious logic
- Obsidian vault MUST be used for knowledge management

### Testing

- Each tier MUST pass prompt tests before completion
- Tests MUST simulate real inputs (e.g., email trigger → plan → approval → action → log)
- Target: 99%+ consistency across all operations
- Hackathon 0 requirements MUST be verified per phase

### Security

- Secrets (.env, tokens) MUST NEVER be synced or committed
- HITL approval REQUIRED for all financial/legal actions
- Audit logging REQUIRED for all autonomous operations
- Security audits MUST be performed at Gold tier and above

### Tool Usage

- Claude Code: Primary orchestration engine (brain)
- Skills: Specific task execution (file ops, API calls)
- MCP Servers: Documentation and external actions
- Python watchers: Perception and monitoring
- Obsidian: Dashboard and memory management

## Constraints

### Technology Stack

- **Claude Code**: Primary reasoning and orchestration engine
- **Obsidian**: v1.10.6+ for dashboard and memory vault
- **Python**: 3.13+ for watchers and orchestration scripts
- **Node.js**: v24+ for MCP servers
- **GitHub**: Version control and collaboration

### Tiered Progression

Development MUST follow this progression:
1. **Bronze** (8-12 hours): Basic vault setup, one watcher, folder structure
2. **Silver** (20-30 hours): Multiple watchers, MCP integration, scheduling
3. **Gold** (40+ hours): Full integrations (Odoo, social media, audits)
4. **Platinum** (60+ hours): Cloud-local hybrid, 24/7 operation simulation

### Hardware Requirements

- **Minimum**: 8GB RAM, 4-core CPU
- **Recommended**: 16GB RAM with SSD for always-on setup

### External Dependencies

- No additional pip/npm installs beyond pre-configured environments
- All dependencies MUST be documented in requirements files

### Timeline

- Phase-by-phase development with verification tests post-tier
- Total estimated effort: 8-60+ hours based on target tier

### Ethics

- AI involvement MUST be disclosed in all external communications
- Transparency and accountability MUST be maintained in all operations
- User consent REQUIRED for all autonomous actions

## Governance

**Amendment Procedure**: Constitution amendments require:
1. Proposed change documented with rationale
2. Impact analysis on existing principles and tiers
3. User approval before implementation
4. Version increment per semantic versioning

**Versioning Policy**:
- MAJOR: Backward incompatible changes, principle removals
- MINOR: New principles, material expansions, new tiers
- PATCH: Clarifications, wording improvements, typo fixes

**Compliance Review**:
- All PRs MUST verify constitution compliance
- Constitution Check required in planning phase
- Non-compliance MUST be resolved before merge

**Version**: 1.0.0 | **Ratified**: 2026-02-17 | **Last Amended**: 2026-02-17
