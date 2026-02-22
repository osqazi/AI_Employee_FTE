# AI Reasoning Engine Toggle Guide

**Personal AI Employee - Hackathon 0**  
**Version**: 1.1.0  
**Date**: 2026-02-22

---

## Overview

The Personal AI Employee project supports two AI reasoning engines:

1. **Claude Code** (Primary) - Anthropic's AI assistant
2. **Qwen** (Secondary) - Alibaba's Qwen AI assistant

Use the `toggle_reasoning_engine.py` script to easily switch between them at any time.

**All Agent Skills work with both engines** - the toggle automatically routes skill invocations to the selected engine.

---

## How Skills Work with Both Engines

### Agent Skills Are Engine-Agnostic

All Agent Skills (`.md` files in `skills/`) are **documentation files** that describe capabilities. They work with **both** Claude Code and Qwen:

```
┌─────────────────────────────────────────────────────────┐
│              Agent Skills (skills/*.md)                 │
│  - read_task.md                                         │
│  - plan_action.md                                       │
│  - odoo_create_invoice.md                               │
│  - facebook_post.md                                     │
│  - ... (18 skills total)                                │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│         AI Reasoning Engine (Selected via .env)         │
│  ┌─────────────┐           ┌─────────────┐             │
│  │  Claude     │◄──────────┤   Toggle    │             │
│  │  Code       │  Switch   │   Script    │             │
│  │  (Primary)  │──────────►│             │             │
│  └─────────────┘           └─────────────┘             │
│         ▲                           ▲                   │
│         │                           │                   │
│  ┌──────┴──────────┐         ┌──────┴──────────┐       │
│  │ claude command  │         │ qwen command    │       │
│  └─────────────────┘         └─────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

### Using Skills with Selected Engine

**When AI_REASONING_ENGINE=claude**:
```bash
# Skills invoked via Claude Code
claude "Use odoo_create_invoice skill to create invoice"
```

**When AI_REASONING_ENGINE=qwen**:
```bash
# Same skill invoked via Qwen
qwen "Use odoo_create_invoice skill to create invoice"
```

**The skill documentation is the same** - only the CLI tool changes!

---

## Environment Variable

**Variable**: `AI_REASONING_ENGINE`  
**Location**: `.env` file (project root)  
**Options**: `claude` (default) or `qwen`

```env
# AI Reasoning Engine Selection
# Options: 'claude' (Claude Code - Primary), 'qwen' (Qwen - Secondary)
# Default: 'claude'
AI_REASONING_ENGINE=claude
```

---

## Quick Start

### Check Current Engine

```bash
python toggle_reasoning_engine.py --status
```

### Toggle to Other Engine

```bash
python toggle_reasoning_engine.py --toggle
```

### Switch to Specific Engine

```bash
# Switch to Claude Code
python toggle_reasoning_engine.py --engine claude

# Switch to Qwen
python toggle_reasoning_engine.py --engine qwen
```

### Interactive Mode

```bash
python toggle_reasoning_engine.py
```

---

## Usage Examples

### Example 1: Check Status

```bash
$ python toggle_reasoning_engine.py --status

============================================================
AI REASONING ENGINE STATUS
============================================================
Current Engine: Claude Code (CLAUDE)
Other Engine:   Qwen (QWEN)

Environment Variable: AI_REASONING_ENGINE=claude
Configuration File: .env

[CONFIG] Claude Code Configuration:
   Status: Active
   MCP Config: ~/.config/claude-code/mcp.json

[CONFIG] Qwen Configuration:
   Status: Standby

[USAGE] Usage:
   Toggle:    python toggle_reasoning_engine.py --toggle
   Switch:    python toggle_reasoning_engine.py --engine <claude|qwen>
   Status:    python toggle_reasoning_engine.py --status
   Interactive: python toggle_reasoning_engine.py
============================================================
```

### Example 2: Toggle Engine

```bash
$ python toggle_reasoning_engine.py --toggle

Toggling from CLAUDE to QWEN...
[OK] Switched to Qwen (QWEN)
   AI_REASONING_ENGINE=qwen
```

### Example 3: Switch to Claude Code

```bash
$ python toggle_reasoning_engine.py --engine claude

[OK] Switched to Claude Code (CLAUDE)
   AI_REASONING_ENGINE=claude
```

---

## How It Works

### 1. Environment Variable Update

The script updates the `AI_REASONING_ENGINE` variable in your `.env` file:

```bash
# Before
AI_REASONING_ENGINE=claude

# After toggle
AI_REASONING_ENGINE=qwen
```

### 2. Logging

All switches are logged to `AI_Employee_Vault/Logs/reasoning_engine_switches.log`:

```
2026-02-22T21:19:33.360694 - Switched to Claude Code (claude)
2026-02-22T21:20:15.123456 - Switched to Qwen (qwen)
```

### 3. Immediate Effect

The change takes effect immediately for all subsequent Specify commands:

```bash
# Switch engine
python toggle_reasoning_engine.py --engine qwen

# Next command uses Qwen
/sp.specify "Your task here"
```

---

## Command Reference

| Command | Description |
|---------|-------------|
| `python toggle_reasoning_engine.py` | Interactive mode |
| `python toggle_reasoning_engine.py --status` | Show current engine |
| `python toggle_reasoning_engine.py --toggle` | Toggle to other engine |
| `python toggle_reasoning_engine.py --engine claude` | Switch to Claude Code |
| `python toggle_reasoning_engine.py --engine qwen` | Switch to Qwen |

---

## Use Cases

### Use Claude Code When:
- Complex reasoning required
- Code generation and refactoring
- Architecture planning
- Working with MCP servers
- Default operation

### Use Qwen When:
- Multi-language tasks (especially Asian languages)
- Cost optimization
- Different perspective needed
- Claude Code unavailable
- Backup engine required

---

## Integration with Specify Commands

The `AI_REASONING_ENGINE` variable controls which AI is used for all Specify commands:

```bash
# Set engine to Qwen
python toggle_reasoning_engine.py --engine qwen

# Run Specify command (uses Qwen)
/sp.specify "Add user authentication"

# Switch back to Claude Code
python toggle_reasoning_engine.py --engine claude

# Run Specify command (uses Claude Code)
/sp.implement
```

---

## Troubleshooting

### Issue: Toggle script not found

**Solution**: Ensure you're in the project root directory:
```bash
cd D:\Projects\hackathon\ai-assist-fte
python toggle_reasoning_engine.py --status
```

### Issue: .env file not updated

**Solution**: Check file permissions:
```bash
# Windows
icacls .env

# Linux/macOS
ls -la .env
```

### Issue: Engine doesn't seem to change

**Solution**: 
1. Verify `.env` file was updated: `grep AI_REASONING_ENGINE .env`
2. Restart your terminal/shell
3. Check the log file: `cat AI_Employee_Vault/Logs/reasoning_engine_switches.log`

---

## Best Practices

1. **Default to Claude Code**: Use Claude Code for most tasks
2. **Toggle for Specific Tasks**: Switch to Qwen when needed
3. **Log Review**: Periodically review switch logs for patterns
4. **Test Both**: Verify critical features work with both engines
5. **Document Preferences**: Note which engine works best for which tasks

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              AI Reasoning Engine Layer                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────┐           ┌─────────────┐            │
│  │  Claude     │◄──────────┤   Toggle    │───────────►│
│  │  Code       │  Switch   │   Script    │            │
│  │  (Primary)  │──────────►│             │            │
│  └─────────────┘           └─────────────┘            │
│         ▲                           ▲                  │
│         │                           │                  │
│         └───────────┬───────────────┘                  │
│                     │                                  │
│              AI_REASONING_ENGINE                       │
│                     │                                  │
│         ┌───────────┴───────────────┐                  │
│         ▼                           ▼                  │
│  ┌─────────────┐           ┌─────────────┐            │
│  │  Specify    │           │   Specify   │            │
│  │  Commands   │           │   Commands  │            │
│  │  (Claude)   │           │   (Qwen)    │            │
│  └─────────────┘           └─────────────┘            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Reference Card

```
┌──────────────────────────────────────────────────────┐
│         AI Reasoning Engine Toggle                   │
├──────────────────────────────────────────────────────┤
│ Status:   python toggle_reasoning_engine.py --status │
│ Toggle:   python toggle_reasoning_engine.py --toggle │
│ Switch:   python toggle_reasoning_engine.py --engine │
│ Interactive: python toggle_reasoning_engine.py       │
├──────────────────────────────────────────────────────┤
│ Engine: claude (Primary) | qwen (Secondary)          │
│ Variable: AI_REASONING_ENGINE in .env                │
│ Log: AI_Employee_Vault/Logs/reasoning_engine_switches│
└──────────────────────────────────────────────────────┘
```

---

*Document per Hackathon 0 documentation requirements*
