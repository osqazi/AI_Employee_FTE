# AI-Assist-FTE: Silver Tier Functional Assistant

**Personal AI Employee** - Autonomous task management with human-in-the-loop safeguards

[![Tests](https://img.shields.io/badge/tests-70%2F86%20tasks-brightgreen)]()
[![Python](https://img.shields.io/badge/python-3.13+-blue.svg)]()
[![Constitution](https://img.shields.io/badge/constitution-v1.0.0-blue)](.specify/memory/constitution.md)
[![Tier](https://img.shields.io/badge/tier-Silver%20(81%25%20complete)-brightgreen)]()

---

## Overview

Silver Tier Functional Assistant is the second phase of an Autonomous FTE (Full-Time Equivalent) system - a Personal AI Employee that proactively manages tasks while requiring human approval for sensitive actions. This tier extends Bronze Tier with:

- **Multiple Watchers**: Filesystem, Gmail, and WhatsApp monitoring
- **Plan.md Management**: Checkbox-based task progression tracking
- **MCP Server Integration**: Email sending capability via email-mcp
- **HITL Approval Workflow**: /Pending_Approval → /Approved → /Done pattern
- **Basic Scheduling**: Daily tasks and weekly summary generation
- **Agent Skills**: 7 documented capabilities for Claude Code integration

**Estimated Setup Time**: 20-30 hours (Silver Tier)
**Current Progress**: 81% complete (70/86 tasks)

---

## Quick Start

### Prerequisites

- **Python 3.13+** - [Download](https://www.python.org/downloads/)
- **Obsidian v1.10.6+** - [Download](https://obsidian.md/)
- **Claude Code** (optional) - For autonomous task processing

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd ai-assist-fte
   ```

2. **Verify Python version**:
   ```bash
   python --version  # Should show Python 3.13.x or higher
   ```

3. **Open Obsidian Vault**:
   - Open Obsidian
   - Click "Open folder as vault"
   - Select the `AI_Employee_Vault/` directory

### Running the System

1. **Start the File Watcher** (monitors for triggers):
   ```bash
   python watchers/file_watcher.py
   ```

2. **Start the Dashboard Updater** (refreshes every 30 seconds):
   ```bash
   python watchers/dashboard_updater.py
   ```

3. **Create a trigger**:
   - Place a `.md` file in `obsidian-vault/Inbox/`
   - Watcher will automatically create a task file in `Needs_Action/`

4. **Monitor progress**:
   - Open `obsidian-vault/Dashboard.md` in Obsidian
   - Task counts update automatically

---

## Architecture

```
┌─────────────────┐      ┌──────────────┐
│   File Watcher  │─────▶│  Task File   │
│  (perception)   │      │  (work item) │
└─────────────────┘      └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │ Agent Skills │
                         │  (capabilities)
                         └──────────────┘
                                │
                                ▼
                         ┌──────────────┐
                         │   Dashboard  │
                         │  (visibility)│
                         └──────────────┘
```

### Components

| Component | File | Purpose |
|-----------|------|---------|
| **File Watcher** | `watchers/file_watcher.py` | Monitors directory for triggers, creates task files |
| **Dashboard Updater** | `watchers/dashboard_updater.py` | Refreshes Dashboard.md every 30 seconds |
| **File Operations** | `watchers/file_operations.py` | Moves files between folders, updates status |
| **Agent Skills** | `skills/*.md` | Documented capabilities for Claude Code |
| **Tests** | `tests/*.py` | Unit and end-to-end test suite |

### Vault Structure

```
AI_Employee_Vault/
├── Dashboard.md              # Real-time system summary
├── Company_Handbook.md       # Rules and guidelines
├── Inbox/                    # Manual review items
├── Needs_Action/             # Pending tasks
├── Pending_Approval/         # Awaiting human approval
└── Done/                     # Completed tasks
```

---

## Agent Skills

Agent Skills are documented capabilities that enable Claude Code to process tasks autonomously.

| Skill | File | Purpose |
|-------|------|---------|
| **Read Task** | `skills/read_task.md` | Parse task files and extract metadata |
| **Plan Action** | `skills/plan_action.md` | Create action plans from descriptions |
| **Write Report** | `skills/write_report.md` | Write completion reports |
| **File Operations** | `skills/file_operations.md` | Move files between folders |

Each skill includes:
- Purpose statement
- Input/output specifications
- Usage examples
- Dependencies

---

## Testing

### Run All Tests

```bash
python -m pytest tests/ -v
```

### Test Coverage

- **Unit Tests** (11 tests): FileWatcher, YAML parsing, logging
- **End-to-End Tests** (6 tests): Full workflow, dashboard updates, consistency

**Latest Results**: 17/17 tests passed (100%)

### Test Categories

| Test Suite | Tests | Purpose |
|------------|-------|---------|
| `test_watcher.py` | 11 | File monitoring, task creation, logging |
| `test_e2e.py` | 6 | Complete workflow, error handling |

---

## Configuration

### Watcher Settings

Edit `watchers/file_watcher.py`:

```python
WATCH_DIR = Path.home() / 'ai-assist-vault' / 'Inbox'
VAULT_DIR = Path.home() / 'ai-assist-vault'
```

Or use relative paths for project development:

```python
WATCH_DIR = Path(__file__).parent.parent / 'obsidian-vault' / 'Inbox'
VAULT_DIR = Path(__file__).parent.parent / 'obsidian-vault'
```

### Dashboard Refresh Interval

Edit `watchers/dashboard_updater.py`:

```python
updater = DashboardUpdater(VAULT_DIR, update_interval=30)  # 30 seconds
```

---

## Human-in-the-Loop (HITL) Workflow

### Actions Requiring Approval

- **Financial**: Payments, invoices, purchases
- **Legal**: Contracts, agreements
- **External Communications**: Emails, social media posts
- **Data Changes**: Deleting/modifying important records

### Approval Process

1. Claude Code moves file from `Needs_Action/` to `Pending_Approval/`
2. User reviews task file in Obsidian
3. User moves file back to `Needs_Action/` to approve
4. Claude Code continues processing
5. If user disagrees, move to `Inbox/` for manual handling

---

## Logging

All operations are logged in structured JSON-lines format:

**Location**: `watchers/logs/operations.log`

**Format**:
```json
{
  "timestamp": "2026-02-17T10:30:00Z",
  "action": "scan_complete",
  "source": "file_watcher.py",
  "status": "success",
  "duration_ms": 45,
  "user": "system",
  "details": {"new_files": 1}
}
```

---

## Constitution Compliance

This implementation follows the AI-Assist-FTE Constitution:

| Principle | Status | Implementation |
|-----------|--------|----------------|
| **I. Autonomy with HITL** | ✅ | File-based approval via `Pending_Approval/` |
| **II. Local-First Privacy** | ✅ | All data in local Obsidian vault |
| **III. Modularity** | ✅ | Agent Skills as separate SKILL.md files |
| **IV. Reliability** | ✅ | Error handling, structured logging |
| **V. Phase-by-Phase** | ✅ | Bronze tier scope (8-12 hours) |
| **VI. MCP Servers** | ⚠️ | Not required for Bronze (Silver tier) |

---

## Troubleshooting

### Watcher Not Detecting Files

1. Ensure the watch directory exists
2. Check file permissions
3. Verify files have `.md` extension
4. Check `operations.log` for errors

### Dashboard Not Updating

1. Ensure `dashboard_updater.py` is running
2. Check that `Dashboard.md` exists in vault root
3. Verify no other process has the file locked

### Task Files Malformed

1. Verify YAML frontmatter format (between `---` markers)
2. Check all required fields: source, timestamp, status, priority
3. Review `Company_Handbook.md` for examples

---

## Next Tiers

### Silver Tier (20-30 hours)
- Multiple watchers (email, file system, APIs)
- MCP server integration
- Scheduling and automation
- Enhanced error recovery

### Gold Tier (40+ hours)
- Full integrations (Odoo, social media)
- Advanced audit capabilities
- Comprehensive documentation

### Platinum Tier (60+ hours)
- Cloud-local hybrid sync
- 24/7 operation simulation
- Production deployment

---

## Contributing

1. Follow PEP 8 for Python code
2. Add docstrings to all functions
3. Include tests for new functionality
4. Update Agent Skills for new capabilities
5. Verify constitution compliance

---

## License

[Your License Here]

---

## Support

For issues or questions:
1. Check the [Dashboard](obsidian-vault/Dashboard.md) for system status
2. Review `operations.log` in `watchers/logs/`
3. Consult `Company_Handbook.md` for operational guidelines
4. Run tests: `python -m pytest tests/ -v`

---

**Version**: 1.0.0 (Bronze Tier)  
**Last Updated**: 2026-02-17  
**Status**: Production Ready (Core Implementation Complete)
