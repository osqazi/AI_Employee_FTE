# Research & Technology Decisions: Bronze Tier Foundation

**Feature**: Bronze Tier Foundation  
**Branch**: `001-bronze-tier-foundation`  
**Date**: 2026-02-17  
**Purpose**: Document technology decisions, best practices, and implementation patterns

---

## 1. File System Monitoring in Python

**Decision**: Use `pathlib` with polling (check directory every 5-10 seconds)

**Rationale**:
- No external dependencies required (uses Python standard library)
- Cross-platform compatibility (Windows, macOS, Linux)
- Simple implementation suitable for Bronze tier (8-12 hour scope)
- Aligns with Constitution Principle II (Local-First Privacy)

**Implementation Pattern**:
```python
from pathlib import Path
import time

class FileWatcher:
    def __init__(self, watch_path, poll_interval=5):
        self.watch_path = Path(watch_path)
        self.poll_interval = poll_interval
        self.known_files = set()
    
    def scan(self):
        """Scan directory for new or modified files"""
        current_files = set()
        for file in self.watch_path.rglob('*.md'):
            current_files.add((file, file.stat().st_mtime))
        
        new_files = current_files - self.known_files
        self.known_files = current_files
        return new_files
    
    def run(self):
        """Continuous monitoring loop"""
        while True:
            new_files = self.scan()
            for file_path, mtime in new_files:
                self.process_trigger(file_path)
            time.sleep(self.poll_interval)
```

**Alternatives Considered**:
- `watchdog` library: Rejected - adds external dependency, overkill for Bronze tier simplicity
- `inotify` (Linux-only): Rejected - not cross-platform
- Polling with `os.listdir`: Rejected - `pathlib` is more Pythonic and provides stat info

**Best Practices**:
- Use `rglob()` for recursive scanning if subdirectories needed
- Track file modification times to detect changes, not just new files
- Implement graceful shutdown on KeyboardInterrupt
- Log all scan operations with timestamps

---

## 2. Claude Code Integration Pattern

**Decision**: Claude Code CLI with direct file system access to vault directory

**Rationale**:
- Direct file read/write without API complexity
- Aligns with Constitution Principle II (Local-First Privacy) - no network calls required
- Leverages Claude Code as primary orchestration engine per Constitution
- Simpler error handling and debugging

**Implementation Pattern**:
```bash
# Claude Code reads task file
claude-code "Read the task file at /path/to/vault/Needs_Action/task_001.md and create a plan"

# Claude Code writes results
claude-code "Append the completion report to the task file and move it to Done folder"
```

**Agent Skills Integration**:
- Each SKILL.md file contains prompt template for specific operation
- Claude Code invoked with skill prompt + file context
- Results parsed and written back to vault

**Alternatives Considered**:
- Claude API (Anthropic): Rejected - requires network, API keys, violates local-first for Bronze
- Local LLM (Ollama, etc.): Rejected - adds complexity, Claude Code already configured

**Best Practices**:
- Always include full file path in prompts for clarity
- Use structured output format (Markdown sections) for easy parsing
- Implement retry logic for CLI invocation failures
- Log all Claude Code interactions for audit trail

---

## 3. Structured Logging Format

**Decision**: JSON-lines format (one JSON object per line) with standard fields

**Rationale**:
- Machine-parseable for automated audit and monitoring
- Human-readable with proper formatting tools
- Industry standard for structured logging
- Supports Constitution Principle I (audit logging requirement)

**Log Entry Schema**:
```json
{
  "timestamp": "2026-02-17T10:30:00.000Z",
  "action": "trigger_detected",
  "source": "file_watcher.py",
  "status": "success",
  "duration_ms": 45,
  "user": "system",
  "details": {
    "file_path": "/vault/Inbox/trigger_001.md",
    "task_id": "task_001"
  }
}
```

**Required Fields** (per spec clarification):
- `timestamp`: ISO 8601 format with timezone
- `action`: What operation was performed
- `source`: Which component performed the action
- `status`: success, failure, pending, skipped
- `duration_ms`: Operation duration in milliseconds
- `user`: system or actual user ID if applicable

**Implementation Pattern**:
```python
import json
import logging
from datetime import datetime

def log_operation(action, status, source, duration_ms, details=None, user="system"):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "action": action,
        "source": source,
        "status": status,
        "duration_ms": duration_ms,
        "user": user,
        "details": details or {}
    }
    logging.info(json.dumps(log_entry))
```

**Alternatives Considered**:
- Plain text logging: Rejected - harder to parse for audit reports
- CSV format: Rejected - less flexible for nested data
- Syslog: Rejected - overkill for single-user local system

**Best Practices**:
- Log at appropriate levels (INFO for operations, ERROR for failures, DEBUG for details)
- Rotate log files to prevent disk exhaustion
- Never log sensitive data (tokens, passwords, PII)
- Include correlation IDs for tracing multi-step operations

---

## 4. YAML Frontmatter for Task Files

**Decision**: YAML frontmatter at top of Markdown files (between `---` markers)

**Rationale**:
- Standard in Markdown ecosystem (Jekyll, Hugo, Obsidian support)
- Easy to parse with `pyyaml` or similar libraries
- Keeps metadata separate from human-readable content
- Aligns with spec requirement for structured Task File schema

**Task File Structure**:
```markdown
---
source: file_watcher
timestamp: 2026-02-17T10:30:00Z
status: pending
priority: medium
---

# Task Description

This section contains the human-readable description of the trigger,
including any context needed for Claude Code to process the task.

## Processing Notes

Claude Code adds planning and execution notes here.

## Completion Report

Final results and outcomes written after task completion.
```

**Required Frontmatter Fields** (per spec):
- `source`: What triggered this task (e.g., "file_watcher", "email_watcher")
- `timestamp`: ISO 8601 when trigger was detected
- `status`: pending, processing, approved, completed, failed
- `priority`: low, medium, high

**Parsing Pattern**:
```python
import yaml

def parse_task_file(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Split frontmatter from body
    parts = content.split('---', 2)
    if len(parts) < 3:
        raise ValueError("Invalid task file: missing frontmatter")
    
    frontmatter = yaml.safe_load(parts[1])
    body = parts[2].strip()
    
    return frontmatter, body
```

**Alternatives Considered**:
- JSON header block: Rejected - less Markdown-native, harder to read
- Inline metadata (e.g., `**source**: value`): Rejected - harder to parse reliably
- Separate metadata file: Rejected - adds complexity, risk of desync

**Best Practices**:
- Always include all required fields
- Validate frontmatter on task creation
- Update status field as task progresses through lifecycle
- Preserve body content when updating frontmatter

---

## 5. Dashboard Polling Mechanism

**Decision**: Simple Python script that scans vault folders every 30 seconds and updates Dashboard.md

**Rationale**:
- Matches spec requirement (SC-007: 30-second refresh)
- No Obsidian plugin development needed (reduces Bronze tier complexity)
- Simple implementation using existing file system monitoring pattern
- Aligns with Constitution Principle V (Phase-by-Phase Development)

**Implementation Pattern**:
```python
from pathlib import Path
from datetime import datetime

class DashboardUpdater:
    def __init__(self, vault_path, update_interval=30):
        self.vault_path = Path(vault_path)
        self.update_interval = update_interval
    
    def count_files(self, folder):
        """Count .md files in a folder"""
        return len(list((self.vault_path / folder).glob('*.md')))
    
    def generate_dashboard(self):
        """Generate Dashboard.md content"""
        pending = self.count_files('Needs_Action')
        approval = self.count_files('Pending_Approval')
        completed = self.count_files('Done')
        
        content = f"""# System Dashboard

**Last Updated**: {datetime.utcnow().isoformat()}Z

## Task Summary

| Status | Count |
|--------|-------|
| Pending | {pending} |
| Awaiting Approval | {approval} |
| Completed | {completed} |

## Recent Activity

<!-- Auto-populated by Watcher -->

## System Health

- Watcher: Running
- Last Scan: {datetime.utcnow().isoformat()}Z
"""
        return content
    
    def run(self):
        """Continuous update loop"""
        while True:
            dashboard_path = self.vault_path / 'Dashboard.md'
            content = self.generate_dashboard()
            with open(dashboard_path, 'w') as f:
                f.write(content)
            time.sleep(self.update_interval)
```

**Dashboard Content Requirements**:
- Real-time task counts by status
- Last update timestamp
- Recent activity log (last 5-10 completions)
- System health indicators (Watcher status, last scan time)

**Alternatives Considered**:
- Obsidian plugin with file watchers: Rejected - adds plugin development complexity
- Event-driven updates (update on file change): Rejected - requires more complex coordination
- Manual refresh: Rejected - doesn't meet "real-time" requirement

**Best Practices**:
- Use atomic writes (write to temp file, then rename) to prevent corruption
- Include timestamp so users know when data was refreshed
- Handle file lock conflicts gracefully (retry with backoff)
- Log dashboard update operations for debugging

---

## 6. Error Handling Strategy (Bronze Tier)

**Decision**: Basic try-except with structured logging; full Ralph Wiggum loop deferred to Silver

**Rationale**:
- Appropriate for Bronze tier scope (8-12 hours)
- Meets Constitution Principle IV minimum requirements (logging, basic recovery)
- Can be enhanced in Silver/Gold with retry logic and self-healing

**Implementation Pattern**:
```python
import logging

def process_trigger(file_path):
    try:
        task = parse_task_file(file_path)
        plan = create_action_plan(task)
        execute_plan(plan)
        log_operation("process_trigger", "success", "file_watcher.py", duration_ms)
    except FileNotFoundError as e:
        log_operation("process_trigger", "failure", "file_watcher.py", duration_ms, 
                     details={"error": str(e), "type": "file_not_found"})
    except Exception as e:
        log_operation("process_trigger", "failure", "file_watcher.py", duration_ms,
                     details={"error": str(e), "type": "unknown"})
        # Move to Inbox for manual review
        move_to_inbox(file_path)
```

**Error Categories**:
- File not found: Log and skip
- Parse errors: Log and move to /Inbox for manual review
- API failures (Claude Code): Log and leave in /Needs_Action for retry
- File lock conflicts: Wait with timeout, then log warning

**Alternatives Considered**:
- Full Ralph Wiggum loop (multi-step retry with self-correction): Deferred to Silver - exceeds Bronze scope
- No error handling: Rejected - violates Constitution Principle IV
- Complex retry with exponential backoff: Deferred to Silver - adds complexity

**Best Practices**:
- Always log errors with sufficient context for debugging
- Fail gracefully - never crash the entire system
- Move unprocessable items to /Inbox for human review
- Include error type in logs for categorization

---

## 7. Agent Skills Structure (SKILL.md)

**Decision**: Standardized SKILL.md template with Purpose, Inputs, Outputs, Examples, Dependencies

**Rationale**:
- Meets Constitution Principle III (Agent Skills as SKILL.md files)
- Enables reproducibility and instant ramp-up
- Clear interface for Claude Code to invoke skills

**SKILL.md Template**:
```markdown
# Skill: [Skill Name]

## Purpose
[One-sentence description of what this skill does]

## Inputs
- [Input 1]: [Description and format]
- [Input 2]: [Description and format]

## Outputs
- [Output 1]: [Description and format]
- [Output 2]: [Description and format]

## Examples

### Example 1: [Scenario]
**Input**: [Example input]
**Output**: [Example output]

### Example 2: [Scenario]
**Input**: [Example input]
**Output**: [Example output]

## Dependencies
- [Required tools, libraries, or other skills]

## Usage
[Instructions for how Claude Code should invoke this skill]
```

**Bronze Tier Skills**:
1. `read_task.md`: Parse task file and extract frontmatter + body
2. `plan_action.md`: Create ordered action plan from task description
3. `write_report.md`: Append completion report to task file
4. `file_operations.md`: Move files between vault folders

**Alternatives Considered**:
- Inline prompts (no SKILL.md files): Rejected - violates Constitution Principle III, reduces reusability
- Python function libraries: Rejected - less accessible to Claude Code, harder to document

**Best Practices**:
- Keep skills focused and atomic (single responsibility)
- Include multiple examples for clarity
- Document all inputs and outputs explicitly
- Version skills if interface changes

---

## Summary of Technology Choices

| Decision Area | Choice | Rationale |
|---------------|--------|-----------|
| File Monitoring | pathlib + polling | No dependencies, cross-platform, simple |
| Claude Integration | CLI with file access | Local-first, no API complexity |
| Logging Format | JSON-lines | Machine-parseable, standard practice |
| Task File Schema | YAML frontmatter | Markdown-standard, easy to parse |
| Dashboard Updates | Python polling script | No plugin dev, meets 30s requirement |
| Error Handling | Basic try-except | Appropriate for Bronze, enhances later |
| Agent Skills | SKILL.md template | Constitution requirement, reproducible |

---

## Next Steps

1. Implement data model based on Task File schema (data-model.md)
2. Create Agent Skill contracts (contracts/)
3. Write quickstart guide for setup (quickstart.md)
4. Proceed to implementation tasks (tasks.md)
