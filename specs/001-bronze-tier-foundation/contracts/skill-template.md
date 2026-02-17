# Agent Skill Contract Template

**Purpose**: Define standard interface for Agent Skills in Bronze Tier Foundation

---

## Contract Specification

### Skill Interface

```markdown
# Skill: [Skill Name]

## Purpose
[One-sentence description]

## Inputs
| Name | Type | Required | Description |
|------|------|----------|-------------|
| [input_name] | [type] | Yes/No | [Description] |

## Outputs
| Name | Type | Description |
|------|------|-------------|
| [output_name] | [type] | [Description] |

## Examples

### Example [N]: [Scenario]
**Input**: [Example input]
**Output**: [Example output]

## Dependencies
- [List required tools, libraries, or other skills]

## Usage
[Instructions for Claude Code invocation]
```

---

## Bronze Tier Skills

### 1. read_task

**File**: `skills/read_task.md`

| Attribute | Value |
|-----------|-------|
| Purpose | Parse task file and extract frontmatter + body |
| Input | file_path (string) |
| Output | frontmatter (dict), body (string) |
| Dependencies | Python yaml library |

### 2. plan_action

**File**: `skills/plan_action.md`

| Attribute | Value |
|-----------|-------|
| Purpose | Create ordered action plan from task description |
| Input | task_description (string), task_priority (string) |
| Output | plan (list), requires_approval (boolean) |
| Dependencies | None |

### 3. write_report

**File**: `skills/write_report.md`

| Attribute | Value |
|-----------|-------|
| Purpose | Append completion report to task file |
| Input | file_path (string), results (string), status (string) |
| Output | success (boolean) |
| Dependencies | File system write access |

### 4. file_operations

**File**: `skills/file_operations.md`

| Attribute | Value |
|-----------|-------|
| Purpose | Move files between vault folders |
| Input | source_path (string), dest_folder (string) |
| Output | success (boolean), new_path (string) |
| Dependencies | File system write access |

---

## Validation Rules

1. All skills MUST follow the template structure
2. All skills MUST have at least one example
3. All skills MUST list dependencies explicitly
4. All skills MUST be testable via prompt invocation
