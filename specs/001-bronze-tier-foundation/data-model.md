# Data Model: Bronze Tier Foundation

**Feature**: Bronze Tier Foundation  
**Branch**: `001-bronze-tier-foundation`  
**Date**: 2026-02-17  
**Purpose**: Define entities, schemas, and relationships for the task management system

---

## 1. Task File

**Description**: Primary entity representing a work item triggered by the Watcher and processed by Claude Code.

### Schema

**File Format**: Markdown with YAML frontmatter

```yaml
---
source: <string>        # What triggered this task (e.g., "file_watcher")
timestamp: <ISO8601>    # When trigger was detected (UTC)
status: <enum>          # Current lifecycle state
priority: <enum>        # Task priority level
---
```

**Body Sections**:
1. `# Task Description` - Human-readable description of the trigger
2. `## Processing Notes` - Claude Code adds planning and execution notes
3. `## Completion Report` - Final results written after task completion

### Fields

| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| `source` | string | Yes | Any | Component that detected the trigger (e.g., "file_watcher", "manual") |
| `timestamp` | ISO 8601 | Yes | UTC format | When the trigger was detected |
| `status` | enum | Yes | `pending`, `processing`, `approved`, `completed`, `failed` | Current task state |
| `priority` | enum | Yes | `low`, `medium`, `high` | Task priority level |

### Status Transitions

```
pending → processing → approved → completed
                    ↓              ↓
                 failed        failed
```

**Transition Rules**:
- `pending` → `processing`: When Claude Code starts working on the task
- `processing` → `approved`: When HITL approval is granted (for sensitive actions)
- `processing` → `completed`: When task finishes without requiring approval
- `processing` → `failed`: When an error occurs
- `approved` → `completed`: When task finishes after approval
- `approved` → `failed`: When an error occurs after approval
- Any state → `failed`: On unrecoverable error

### Validation Rules

1. All frontmatter fields are required
2. `timestamp` must be valid ISO 8601 format with timezone
3. `status` must be one of the defined enum values
4. `priority` must be one of the defined enum values
5. Body must contain `# Task Description` section

### Example

```markdown
---
source: file_watcher
timestamp: 2026-02-17T10:30:00Z
status: pending
priority: medium
---

# Task Description

New file detected in monitored directory: `/inbox/invoice_123.pdf`

**Detected At**: 2026-02-17 10:30:00 UTC  
**File Type**: PDF  
**Suggested Action**: Process invoice and log in accounting system

## Processing Notes

<!-- Claude Code adds planning here -->

## Completion Report

<!-- Written after task completion -->
```

---

## 2. Watcher

**Description**: Component that monitors a designated directory for new or modified files and creates Task Files.

### Interface

```python
class Watcher:
    def __init__(self, watch_path: str, poll_interval: int = 5)
    def scan(self) -> List[Path]  # Returns list of new/modified files
    def run(self) -> None  # Starts continuous monitoring loop
    def stop(self) -> None  # Gracefully stops monitoring
```

### Configuration

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `watch_path` | string | Required | Directory to monitor |
| `poll_interval` | integer | 5 | Seconds between scans |
| `file_pattern` | string | `*.md` | Glob pattern for files to detect |

### Behavior

1. Poll `watch_path` every `poll_interval` seconds
2. Detect new or modified files matching `file_pattern`
3. For each detected file:
   - Create a Task File in `/Needs_Action`
   - Log the operation with structured logging
4. Handle errors gracefully (log and continue)

---

## 3. Agent Skill

**Description**: Documented capability (SKILL.md file) that defines how AI performs a specific task.

### Structure

```markdown
# Skill: [Skill Name]

## Purpose
[One-sentence description]

## Inputs
- [Input name]: [Description and format]

## Outputs
- [Output name]: [Description and format]

## Examples
### Example 1: [Scenario]
**Input**: [Example]
**Output**: [Example]

## Dependencies
- [Required tools/libraries]

## Usage
[Instructions for Claude Code]
```

### Required Sections

| Section | Purpose |
|---------|---------|
| `Purpose` | One-sentence description of skill capability |
| `Inputs` | List of inputs with descriptions |
| `Outputs` | List of outputs with descriptions |
| `Examples` | At least one usage example |
| `Dependencies` | Required tools, libraries, or other skills |
| `Usage` | Instructions for Claude Code invocation |

### Bronze Tier Skills

1. **read_task**: Parse task file and extract frontmatter + body
2. **plan_action**: Create ordered action plan from task description
3. **write_report**: Append completion report to task file
4. **file_operations**: Move files between vault folders

---

## 4. Dashboard

**Description**: Markdown file providing real-time visibility into system state, pending tasks, and recent activity.

### Content Structure

```markdown
# System Dashboard

**Last Updated**: [ISO 8601 timestamp]

## Task Summary

| Status | Count |
|--------|-------|
| Pending | [count] |
| Awaiting Approval | [count] |
| Completed | [count] |

## Recent Activity

- [timestamp] [activity description]
- [timestamp] [activity description]

## System Health

- Watcher: [Running/Stopped]
- Last Scan: [timestamp]
- Errors (last 24h): [count]
```

### Update Mechanism

- **Method**: Polling-based refresh
- **Interval**: 30 seconds (per SC-007)
- **Implementation**: Python script that scans vault folders and rewrites Dashboard.md

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `Last Updated` | ISO 8601 | When dashboard was last refreshed |
| `Task Summary` | Table | Counts of tasks by status |
| `Recent Activity` | List | Last 5-10 completed tasks |
| `System Health` | Section | Watcher status, last scan time, error count |

---

## 5. Company Handbook

**Description**: Markdown file containing operational rules, guidelines, and constraints for AI behavior.

### Content Structure

```markdown
# Company Handbook

## Rules of Engagement

1. [Rule 1]
2. [Rule 2]

## Operational Guidelines

- [Guideline 1]
- [Guideline 2]

## Constraints

- [Constraint 1]
- [Constraint 2]

## Escalation Procedures

- [When to escalate]
- [How to escalate]
```

### Purpose

- Defines AI behavior boundaries
- Provides decision-making framework
- Documents escalation procedures
- Serves as reference for Claude Code

---

## 6. Vault Folder Structure

**Description**: Directory structure organizing task lifecycle.

### Structure

```
AI_Employee_Vault/
├── Dashboard.md              # Real-time system summary
├── Company_Handbook.md       # Rules and guidelines
├── Inbox/                    # Unprocessed triggers (error cases)
├── Needs_Action/             # Tasks awaiting processing
├── Pending_Approval/         # Tasks awaiting human approval
└── Done/                     # Completed tasks
```

### Folder Purposes

| Folder | Purpose |
|--------|---------|
| `Inbox` | Malformed triggers or error cases requiring manual review |
| `Needs_Action` | Tasks ready for Claude Code processing |
| `Pending_Approval` | Tasks awaiting human approval for sensitive actions |
| `Done` | Completed tasks with final reports |

### File Movement Rules

1. Watcher creates files in `Needs_Action`
2. Claude Code moves file to `Pending_Approval` when approval needed
3. User moves file from `Pending_Approval` back to `Needs_Action` after approval
4. Claude Code moves file to `Done` on completion
5. Errors move file to `Inbox` for manual review

---

## 7. Log Entry

**Description**: Structured log record for audit and debugging.

### Schema

```json
{
  "timestamp": "<ISO8601>",
  "action": "<string>",
  "source": "<string>",
  "status": "<enum>",
  "duration_ms": "<integer>",
  "user": "<string>",
  "details": "<object>"
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `timestamp` | ISO 8601 | Yes | When operation occurred (UTC) |
| `action` | string | Yes | What operation was performed |
| `source` | string | Yes | Which component performed it |
| `status` | enum | Yes | `success`, `failure`, `pending`, `skipped` |
| `duration_ms` | integer | Yes | Operation duration in milliseconds |
| `user` | string | Yes | `system` or user ID |
| `details` | object | No | Additional context (optional) |

### Format

- **Storage**: JSON-lines (one JSON object per line)
- **File**: `watchers/logs/operations.log`
- **Rotation**: Daily or when file exceeds 10MB

---

## Relationships

```
┌─────────────┐      ┌──────────────┐
│   Watcher   │─────▶│  Task File   │
└─────────────┘      └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Agent Skill │
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │   Dashboard  │
                     └──────────────┘
```

**Relationships**:
1. Watcher **creates** Task Files
2. Agent Skills **process** Task Files
3. Dashboard **displays** Task File status
4. Log Entries **record** all operations

---

## Validation Summary

| Entity | Validation Method |
|--------|-------------------|
| Task File | YAML parsing + schema validation |
| Watcher | Unit tests for scan() and run() |
| Agent Skill | Manual review of SKILL.md structure |
| Dashboard | Visual inspection + count verification |
| Company Handbook | Manual review for completeness |
| Log Entry | JSON parsing + schema validation |
