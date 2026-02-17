# Quickstart Guide: Bronze Tier Foundation

**Feature**: Bronze Tier Foundation  
**Branch**: `001-bronze-tier-foundation`  
**Date**: 2026-02-17  
**Purpose**: Step-by-step setup and usage instructions

---

## Prerequisites

Before starting, ensure you have:

- [ ] **Python 3.13+** installed and accessible from command line
- [ ] **Obsidian v1.10.6+** installed
- [ ] **Claude Code** configured and working
- [ ] **8GB RAM** minimum, 20GB free disk space
- [ ] **Stable internet** connection (for initial setup and API calls)

### Verify Prerequisites

```bash
# Check Python version
python --version  # Should show Python 3.13.x or higher

# Check Obsidian installation
# Windows: Check if Obsidian.exe exists in Program Files
# macOS: Check if Obsidian.app exists in Applications
# Linux: Run `obsidian` from terminal

# Check Claude Code
claude-code --version  # Should show version info
```

---

## Step 1: Create Vault Directory Structure

Create the Obsidian vault with required folder structure:

```bash
# Choose a location for your vault (example: ~/ai-assist-vault)
mkdir -p ~/ai-assist-vault/Inbox
mkdir -p ~/ai-assist-vault/Needs_Action
mkdir -p ~/ai-assist-vault/Pending_Approval
mkdir -p ~/ai-assist-vault/Done
mkdir -p ~/ai-assist-vault/logs
```

**Expected Structure**:
```
ai-assist-vault/
├── Inbox/
├── Needs_Action/
├── Pending_Approval/
├── Done/
└── logs/
```

---

## Step 2: Initialize Obsidian Vault

1. Open Obsidian
2. Click "Open folder as vault"
3. Select the `~/ai-assist-vault` directory
4. Obsidian will initialize the vault

---

## Step 3: Create Dashboard.md

Create `Dashboard.md` in the vault root with this content:

```markdown
# System Dashboard

**Last Updated**: [Auto-updated by polling script]

## Task Summary

| Status | Count |
|--------|-------|
| Pending | 0 |
| Awaiting Approval | 0 |
| Completed | 0 |

## Recent Activity

- No recent activity

## System Health

- Watcher: Not started
- Last Scan: N/A
- Errors (last 24h): 0
```

---

## Step 4: Create Company_Handbook.md

Create `Company_Handbook.md` in the vault root:

```markdown
# Company Handbook

## Rules of Engagement

1. All actions must be logged with timestamps
2. Sensitive actions require human approval before execution
3. Failed operations must be moved to Inbox for review
4. Task files must follow YAML frontmatter schema

## Operational Guidelines

- Process tasks in order of priority (high → medium → low)
- Update task status field as you progress
- Write detailed completion reports
- Never modify files outside the vault without explicit permission

## Constraints

- No external API calls without user configuration
- No secrets (.env, tokens) stored in vault
- No automatic execution of financial or legal actions

## Escalation Procedures

**Escalate to Inbox when**:
- Task file is malformed
- Required fields are missing
- Processing fails multiple times
- Action requires human judgment

**How to escalate**:
1. Log the error with details
2. Move task file to Inbox folder
3. Update Dashboard with error count
```

---

## Step 5: Create Watcher Script

Create `watchers/file_watcher.py`:

```python
#!/usr/bin/env python3
"""
File Watcher for Bronze Tier Foundation
Monitors a directory and creates task files when new files are detected.
"""

import json
import logging
from datetime import datetime
from pathlib import Path
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('file_watcher')

class FileWatcher:
    def __init__(self, watch_path, vault_path, poll_interval=5):
        self.watch_path = Path(watch_path)
        self.vault_path = Path(vault_path)
        self.poll_interval = poll_interval
        self.known_files = set()
        
    def scan(self):
        """Scan directory for new or modified files"""
        current_files = set()
        if self.watch_path.exists():
            for file in self.watch_path.rglob('*.md'):
                current_files.add((file, file.stat().st_mtime))
        
        new_files = current_files - self.known_files
        self.known_files = current_files
        return new_files
    
    def create_task_file(self, file_path):
        """Create a task file in Needs_Action folder"""
        timestamp = datetime.utcnow().isoformat() + 'Z'
        task_content = f"""---
source: file_watcher
timestamp: {timestamp}
status: pending
priority: medium
---

# Task Description

New file detected: `{file_path}`

**Detected At**: {timestamp}  
**File Type**: Markdown  
**Suggested Action**: Review and process file

## Processing Notes

## Completion Report
"""
        task_filename = f"task_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{file_path.stem}.md"
        task_path = self.vault_path / 'Needs_Action' / task_filename
        
        with open(task_path, 'w') as f:
            f.write(task_content)
        
        logger.info(f"Created task file: {task_path}")
        return task_path
    
    def log_operation(self, action, status, duration_ms, details=None):
        """Log operation in structured format"""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + 'Z',
            "action": action,
            "source": "file_watcher.py",
            "status": status,
            "duration_ms": duration_ms,
            "user": "system",
            "details": details or {}
        }
        
        log_file = self.vault_path / 'logs' / 'operations.log'
        with open(log_file, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def run(self):
        """Continuous monitoring loop"""
        logger.info(f"Starting file watcher on {self.watch_path}")
        self.log_operation("watcher_start", "success", 0, 
                          {"watch_path": str(self.watch_path)})
        
        try:
            while True:
                start_time = time.time()
                new_files = self.scan()
                
                for file_path, mtime in new_files:
                    try:
                        self.create_task_file(file_path)
                    except Exception as e:
                        logger.error(f"Error creating task file: {e}")
                        self.log_operation("create_task", "failure", 
                                         int((time.time() - start_time) * 1000),
                                         {"error": str(e)})
                
                duration_ms = int((time.time() - start_time) * 1000)
                self.log_operation("scan_complete", "success", duration_ms,
                                 {"new_files": len(new_files)})
                
                time.sleep(self.poll_interval)
        except KeyboardInterrupt:
            logger.info("Watcher stopped by user")
            self.log_operation("watcher_stop", "success", 0)

if __name__ == '__main__':
    # Configure paths
    WATCH_DIR = Path.home() / 'ai-assist-vault' / 'Inbox'
    VAULT_DIR = Path.home() / 'ai-assist-vault'
    
    # Ensure directories exist
    WATCH_DIR.mkdir(parents=True, exist_ok=True)
    (VAULT_DIR / 'logs').mkdir(exist_ok=True)
    
    # Start watcher
    watcher = FileWatcher(WATCH_DIR, VAULT_DIR)
    watcher.run()
```

**Make executable** (Linux/macOS):
```bash
chmod +x watchers/file_watcher.py
```

---

## Step 6: Create Dashboard Updater Script

Create `watchers/dashboard_updater.py`:

```python
#!/usr/bin/env python3
"""
Dashboard Updater for Bronze Tier Foundation
Refreshes Dashboard.md every 30 seconds with current task counts.
"""

from datetime import datetime
from pathlib import Path
import time

class DashboardUpdater:
    def __init__(self, vault_path, update_interval=30):
        self.vault_path = Path(vault_path)
        self.update_interval = update_interval
    
    def count_files(self, folder):
        """Count .md files in a folder"""
        folder_path = self.vault_path / folder
        if not folder_path.exists():
            return 0
        return len(list(folder_path.glob('*.md')))
    
    def get_recent_activity(self, limit=5):
        """Get recent completed tasks"""
        done_folder = self.vault_path / 'Done'
        if not done_folder.exists():
            return []
        
        files = sorted(done_folder.glob('*.md'), 
                      key=lambda f: f.stat().st_mtime, 
                      reverse=True)
        
        activities = []
        for f in files[:limit]:
            mtime = datetime.fromtimestamp(f.stat().st_mtime)
            activities.append(f"- {mtime.isoformat()}: Completed {f.name}")
        
        return activities
    
    def generate_dashboard(self):
        """Generate Dashboard.md content"""
        pending = self.count_files('Needs_Action')
        approval = self.count_files('Pending_Approval')
        completed = self.count_files('Done')
        inbox = self.count_files('Inbox')
        
        now = datetime.utcnow().isoformat() + 'Z'
        
        activity_lines = self.get_recent_activity()
        activity_text = '\n'.join(activity_lines) if activity_lines else '- No recent activity'
        
        content = f"""# System Dashboard

**Last Updated**: {now}

## Task Summary

| Status | Count |
|--------|-------|
| Pending | {pending} |
| Awaiting Approval | {approval} |
| Completed | {completed} |
| In Inbox | {inbox} |

## Recent Activity

{activity_text}

## System Health

- Watcher: Running
- Last Scan: {now}
- Errors (last 24h): 0
"""
        return content
    
    def run(self):
        """Continuous update loop"""
        print(f"Starting dashboard updater (refresh every {self.update_interval}s)")
        
        while True:
            dashboard_path = self.vault_path / 'Dashboard.md'
            content = self.generate_dashboard()
            
            # Atomic write: write to temp file, then rename
            temp_path = dashboard_path.with_suffix('.md.tmp')
            with open(temp_path, 'w') as f:
                f.write(content)
            temp_path.rename(dashboard_path)
            
            time.sleep(self.update_interval)

if __name__ == '__main__':
    VAULT_DIR = Path.home() / 'ai-assist-vault'
    updater = DashboardUpdater(VAULT_DIR)
    updater.run()
```

---

## Step 7: Create Agent Skills

Create the `skills/` directory and add SKILL.md files:

### skills/read_task.md

```markdown
# Skill: Read Task

## Purpose
Parse a task file and extract frontmatter metadata and body content.

## Inputs
- `file_path`: Path to the task file to read

## Outputs
- `frontmatter`: Dictionary with source, timestamp, status, priority
- `body`: String containing the Markdown body content

## Examples

### Example 1: Read pending task
**Input**: `/path/to/vault/Needs_Action/task_001.md`
**Output**: 
```python
{
  "frontmatter": {
    "source": "file_watcher",
    "timestamp": "2026-02-17T10:30:00Z",
    "status": "pending",
    "priority": "medium"
  },
  "body": "# Task Description\n\nNew file detected..."
}
```

## Dependencies
- Python `yaml` library for frontmatter parsing
- File system read access

## Usage
When Claude Code needs to process a task, first invoke this skill to read and parse the file.
```

### skills/plan_action.md

```markdown
# Skill: Plan Action

## Purpose
Create an ordered action plan from a task description.

## Inputs
- `task_description`: The task description from the parsed task file
- `task_priority`: Priority level (low/medium/high)

## Outputs
- `plan`: Ordered list of actions to complete the task
- `requires_approval`: Boolean indicating if human approval is needed

## Examples

### Example 1: Simple file processing
**Input**: 
- task_description: "Review and process file invoice_123.pdf"
- task_priority: "medium"

**Output**:
```
1. Read the invoice file
2. Extract key information (amount, date, vendor)
3. Log the extraction
4. Write summary to completion report
5. Move task to Done folder

Requires approval: No
```

## Dependencies
- None

## Usage
After reading a task, invoke this skill to create a plan before execution.
```

### skills/write_report.md

```markdown
# Skill: Write Report

## Purpose
Append a completion report to a task file.

## Inputs
- `file_path`: Path to the task file
- `results`: Summary of what was accomplished
- `status`: Final status (completed/failed)

## Outputs
- `success`: Boolean indicating if the write was successful

## Examples

### Example 1: Write completion report
**Input**: 
- file_path: `/path/to/vault/Needs_Action/task_001.md`
- results: "File processed successfully. Summary: ..."
- status: "completed"

**Output**: `{"success": true}`

## Dependencies
- File system write access

## Usage
After completing a task, invoke this skill to write the final report.
```

### skills/file_operations.md

```markdown
# Skill: File Operations

## Purpose
Move files between vault folders.

## Inputs
- `source_path`: Current file location
- `dest_folder`: Target folder name (Inbox, Needs_Action, Pending_Approval, Done)

## Outputs
- `success`: Boolean indicating if the move was successful
- `new_path`: New file location

## Examples

### Example 1: Move to Pending_Approval
**Input**: 
- source_path: `/path/to/vault/Needs_Action/task_001.md`
- dest_folder: "Pending_Approval"

**Output**: 
```json
{
  "success": true,
  "new_path": "/path/to/vault/Pending_Approval/task_001.md"
}
```

## Dependencies
- File system write access

## Usage
Use this skill to move files between folders during task processing.
```

---

## Step 8: Test the Setup

### Test Watcher

1. Start the Watcher in one terminal:
```bash
python watchers/file_watcher.py
```

2. In another terminal, create a test file in the Inbox:
```bash
echo "Test trigger" > ~/ai-assist-vault/Inbox/test_trigger.md
```

3. Verify a task file was created in `Needs_Action`:
```bash
ls ~/ai-assist-vault/Needs_Action/
```

4. Check the logs:
```bash
cat ~/ai-assist-vault/logs/operations.log
```

### Test Dashboard

1. Start the Dashboard Updater in a separate terminal:
```bash
python watchers/dashboard_updater.py
```

2. Open Obsidian and verify Dashboard.md shows:
   - Correct task counts
   - Updates every 30 seconds
   - Recent activity section

### Test End-to-End

1. Create a trigger file in Inbox
2. Verify Watcher creates task in Needs_Action
3. Manually process the task (simulate Claude Code):
   - Read the task file
   - Write a completion report
   - Move to Done folder
4. Verify Dashboard updates reflect the change

---

## Claude Code Integration

### Overview

Claude Code serves as the reasoning engine that processes task files autonomously using Agent Skills. This section documents the integration pattern for automated task processing.

### Invocation Pattern

**Basic Workflow**:
1. **Read Task** → Parse task file and extract metadata
2. **Plan Action** → Create ordered action plan
3. **Execute Plan** → Perform actions using skills
4. **Write Report** → Document completion results
5. **Move File** → Update task status and location

### Using Agent Skills

Each skill is documented in `skills/` folder with purpose, inputs, outputs, and examples.

**Example: Process a Task File**

```bash
# 1. Read the task file
claude-code "Read the task file at AI_Employee_Vault/Needs_Action/task_001.md 
and extract the YAML frontmatter (source, timestamp, status, priority) 
and body content. Use the read_task skill from skills/read_task.md"

# 2. Create an action plan
claude-code "Based on this task description, create a step-by-step action plan. 
Consider if human approval is needed (financial, legal, external communications). 
Use the plan_action skill from skills/plan_action.md"

# 3. Execute the plan
claude-code "Execute the action plan. For each step, use the appropriate Agent Skill. 
Log all operations with structured logging."

# 4. Write completion report
claude-code "Write a completion report to the task file summarizing what was 
accomplished. Update the YAML frontmatter status to 'completed'. 
Use the write_report skill from skills/write_report.md"

# 5. Move to Done folder
claude-code "Move the completed task file from Needs_Action to Done folder. 
Use the file_operations skill from skills/file_operations.md"
```

### HITL Approval Workflow

When a task requires human approval:

```bash
# 1. Move to Pending_Approval folder
claude-code "This task requires human approval (reason: external communication). 
Move the file from Needs_Action to Pending_Approval folder. 
Update status to 'pending_approval'."

# 2. Wait for user approval
# User reviews the task in Obsidian and moves it back to Needs_Action

# 3. Continue processing
claude-code "User has approved the task. Continue with the action plan."
```

### Skill Reference

| Skill | File | Purpose |
|-------|------|---------|
| **Read Task** | `skills/read_task.md` | Parse YAML frontmatter and body |
| **Plan Action** | `skills/plan_action.md` | Create action plan with approval check |
| **Write Report** | `skills/write_report.md` | Append completion report |
| **File Operations** | `skills/file_operations.md` | Move files between folders |

### Example: Complete Task Processing

**Input Task** (`Needs_Action/task_001.md`):
```markdown
---
source: file_watcher
timestamp: 2026-02-17T10:30:00Z
status: pending
priority: medium
---

# Task Description

Process invoice invoice_123.pdf from Inbox folder.
```

**Claude Code Processing**:
```bash
# Read task
claude-code "Use read_task skill to parse AI_Employee_Vault/Needs_Action/task_001.md"

# Output:
# {
#   "frontmatter": {
#     "source": "file_watcher",
#     "timestamp": "2026-02-17T10:30:00Z",
#     "status": "pending",
#     "priority": "medium"
#   },
#   "body": "# Task Description\n\nProcess invoice..."
# }

# Plan action
claude-code "Use plan_action skill to create action plan"

# Output:
# Plan:
# 1. Read invoice file from Inbox
# 2. Extract amount, date, vendor
# 3. Log extraction
# 4. Write summary to completion report
# 5. Move to Done folder
# Requires approval: No

# Execute and write report
claude-code "Execute plan and use write_report skill to document results"

# Move to Done
claude-code "Use file_operations skill to move task to Done folder"
```

### Best Practices

1. **Always read the task first** - Understand what's needed before acting
2. **Check for approval requirements** - Financial, legal, external comms need HITL
3. **Log all operations** - Use structured logging for audit trail
4. **Update status field** - Keep YAML frontmatter in sync with task state
5. **Write detailed reports** - Future you will thank you
6. **Move files atomically** - Ensure file operations complete fully

---

## Troubleshooting

### Watcher not detecting files

- Ensure the watch directory exists and is accessible
- Check file permissions
- Verify the file pattern matches (*.md)
- Check logs for errors

### Dashboard not updating

- Ensure Dashboard.md exists in vault root
- Check file permissions
- Verify no other process has the file locked
- Check for Python errors in terminal

### Task files malformed

- Verify YAML frontmatter has correct format
- Ensure all required fields are present
- Check for proper `---` delimiters

---

## Next Steps

After completing setup:

1. [ ] Run full end-to-end test (trigger → task → completion)
2. [ ] Create additional Agent Skills as needed
3. [ ] Configure Claude Code integration for automated processing
4. [ ] Document any customizations in Company_Handbook.md
5. [ ] Proceed to Silver tier (multiple watchers, MCP integration)

---

## Estimated Time

- Prerequisites verification: 15 minutes
- Vault setup: 15 minutes
- Script creation: 2-3 hours
- Testing: 1 hour
- **Total**: 3.5-4.5 hours (within Bronze tier 8-12 hour budget)
