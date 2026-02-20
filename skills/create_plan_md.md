# Skill: Create Plan.md

## Purpose
Create a Plan.md file with checkbox-based action items for complex multi-step tasks.

## Inputs
- `task_file_path`: Path to the task file in /Needs_Action
- `task_content`: Task file content including YAML frontmatter and body
- `complexity_threshold`: Minimum number of steps to create Plan.md (default: 3)

## Outputs
- `plan_file_path`: Path to created Plan.md in /Plans/ folder
- `plan_content`: Full Plan.md content with YAML frontmatter and checkboxes
- `action_items`: List of action items extracted from task

## Examples

### Example 1: Complex Task (3+ steps)

**Input Task**:
```markdown
---
source: gmail_watcher
type: email
from: client@example.com
subject: Project Proposal Request
status: pending
---

# Email Content

Client is requesting a detailed project proposal for a new website development.
Need to:
1. Review their requirements document
2. Create technical specification
3. Estimate timeline and costs
4. Prepare proposal document
5. Send proposal to client
```

**Output Plan.md**:
```markdown
---
source_task: EMAIL_20260218_123456_abc123.md
type: email_response
status: active
created: 2026-02-18T12:34:56Z
updated: 2026-02-18T12:34:56Z
total_steps: 5
completed_steps: 0
---

# Plan: Project Proposal Request

**Source**: EMAIL_20260218_123456_abc123.md  
**From**: client@example.com  
**Subject**: Project Proposal Request  
**Created**: 2026-02-18T12:34:56Z

## Action Items

- [ ] 1. Review their requirements document
- [ ] 2. Create technical specification
- [ ] 3. Estimate timeline and costs
- [ ] 4. Prepare proposal document
- [ ] 5. Send proposal to client

## Progress

**Status**: 0/5 completed (0%)

## Notes

<!-- Add planning notes here -->

## Completion Report

<!-- Will be filled when all checkboxes are complete -->
```

### Example 2: Simple Task (< 3 steps)

**Input Task**:
```markdown
---
source: file_watcher
status: pending
---

# Task Description

Quick file review needed.
```

**Output**: No Plan.md created (task has < 3 steps, can be processed directly)

## Dependencies
- Python 3.13+
- pathlib for file operations
- YAML parsing (can use simple parsing or PyYAML)

## Usage

### As Claude Code Skill

```bash
# Invoke create_plan_md skill
claude-code "Use create_plan_md skill to create a plan for this task:
1. Read the task file at AI_Employee_Vault/Needs_Action/TASK_FILE.md
2. Extract action items from the task description
3. If task has 3+ steps, create Plan.md in AI_Employee_Vault/Plans/
4. Return the plan file path and action items list"
```

### As Python Function

```python
from watchers.plan_manager import create_plan_md

# Create plan from task file
result = create_plan_md(
    task_file_path='AI_Employee_Vault/Needs_Action/EMAIL_123.md',
    vault_path='AI_Employee_Vault'
)

print(f"Plan created: {result['plan_file_path']}")
print(f"Action items: {len(result['action_items'])}")
```

## Task Complexity Rules

**Create Plan.md if**:
- Task has 3 or more distinct action items
- Task requires multiple steps to complete
- Task involves coordination across different systems
- Task requires HITL approval at some point

**Skip Plan.md if**:
- Task has 1-2 simple action items
- Task can be completed in a single operation
- Task is informational only (no action required)

## Plan.md Schema

### YAML Frontmatter

| Field | Type | Description |
|-------|------|-------------|
| `source_task` | string | Filename of originating task in /Needs_Action |
| `type` | string | Task type (email_response, file_processing, etc.) |
| `status` | enum | active, completed, archived |
| `created` | ISO8601 | Plan creation timestamp |
| `updated` | ISO8601 | Last update timestamp |
| `total_steps` | integer | Total number of action items |
| `completed_steps` | integer | Number of completed items |

### Body Sections

1. **Header**: Plan title with source info
2. **Action Items**: Checkbox list (`- [ ]`) of actions
3. **Progress**: Completion status summary
4. **Notes**: Planning notes and context
5. **Completion Report**: Filled when plan complete

## Error Handling

| Error | Action |
|-------|--------|
| Task file not found | Log error, return None |
| Cannot parse task content | Log error, return None |
| Cannot create Plans folder | Log error, return None |
| Plan file already exists | Update existing plan |
