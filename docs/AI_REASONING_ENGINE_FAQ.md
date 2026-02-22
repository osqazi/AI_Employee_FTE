# AI Reasoning Engine FAQ

**Personal AI Employee - Hackathon 0**  
**Version**: 1.0.0  
**Date**: 2026-02-22

---

## Quick Answer

**Q: Will skills call Qwen instead of Claude Code?**

**A: Yes!** When you set `AI_REASONING_ENGINE=qwen`, all Agent Skills will be invoked via Qwen instead of Claude Code. The skills themselves (`.md` files) work with **both** engines - only the CLI tool changes.

---

## Detailed FAQ

### Q1: How do Agent Skills work with both engines?

**A:** Agent Skills are **documentation files** (`.md`) that describe capabilities. They don't call any specific AI engine. Instead:

- **When `AI_REASONING_ENGINE=claude`**: You run `claude "Use skill_name skill to..."`
- **When `AI_REASONING_ENGINE=qwen`**: You run `qwen "Use skill_name skill to..."`

**The skill documentation is identical** - you just use a different CLI command.

### Q2: Do I need to modify skills for Qwen?

**A: No!** All 18 Agent Skills work with both engines without modification:

**Silver Tier Skills (7)**:
- read_task.md ✅ Works with both
- plan_action.md ✅ Works with both
- write_report.md ✅ Works with both
- file_operations.md ✅ Works with both
- create_plan_md.md ✅ Works with both
- send_email.md ✅ Works with both
- schedule_task.md ✅ Works with both

**Gold Tier Skills (11)**:
- odoo_create_invoice.md ✅ Works with both
- odoo_log_transaction.md ✅ Works with both
- odoo_run_audit.md ✅ Works with both
- facebook_post.md ✅ Works with both
- instagram_post.md ✅ Works with both
- twitter_post.md ✅ Works with both
- social_generate_summary.md ✅ Works with both
- browser_automate.md ✅ Works with both
- docs_lookup_api.md ✅ Works with both
- error_recovery.md ✅ Works with both
- ralph_wiggum_orchestrator.md ✅ Works with both

### Q3: How do I switch which engine skills use?

**A:** Two steps:

1. **Toggle the engine**:
   ```bash
   python toggle_reasoning_engine.py --toggle
   ```

2. **Use the corresponding CLI command**:
   ```bash
   # If switched to Claude Code
   claude "Use odoo_create_invoice skill"
   
   # If switched to Qwen
   qwen "Use odoo_create_invoice skill"
   ```

### Q4: What changes when I switch engines?

**A:** Only the **CLI command** changes:

| Component | Claude Code | Qwen |
|-----------|-------------|------|
| **CLI Command** | `claude` | `qwen` |
| **Config File** | `~/.config/claude-code/mcp.json` | Qwen config |
| **Skills** | Same 18 skills | Same 18 skills |
| **MCP Servers** | Same 5 servers | Same 5 servers |
| **Vault** | Same Obsidian vault | Same Obsidian vault |

### Q5: Will MCP servers work with Qwen?

**A:** Yes! MCP servers are **independent** of the AI engine. They expose tools that both Claude Code and Qwen can invoke:

```
┌─────────────┐     ┌─────────────┐
│  Claude     │     │  Qwen       │
│  Code       │     │             │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └────────┬──────────┘
                │
                ▼
       ┌─────────────────┐
       │  MCP Servers    │
       │  - email-mcp    │
       │  - odoo-mcp     │
       │  - social-mcp   │
       │  - browser-mcp  │
       │  - docs-mcp     │
       └─────────────────┘
```

### Q6: Will Ralph Wiggum loop work with Qwen?

**A:** Yes! The Ralph Wiggum loop pattern (READ→REASON→PLAN→ACT→CHECK) works with both engines. The loop is implemented in `watchers/ralph_wiggum_loop.py` and works independently of which AI engine you use.

### Q7: Do I need Qwen API keys?

**A:** That depends on how you're using Qwen:

- **Qwen via CLI tool**: Follow Qwen CLI installation instructions
- **Qwen via API**: You'll need QWEN_API_KEY in `.env`

The toggle script itself doesn't require API keys - it just switches which CLI tool you'll use.

### Q8: How do I know which engine is active?

**A:** Run:
```bash
python toggle_reasoning_engine.py --status
```

Output shows:
```
Current Engine: Claude Code (CLAUDE)  # or Qwen (QWEN)
Environment Variable: AI_REASONING_ENGINE=claude  # or qwen
```

### Q9: Can I use different engines for different tasks?

**A:** Yes! You can toggle between engines at any time:

```bash
# Use Claude Code for complex reasoning
python toggle_reasoning_engine.py --engine claude
claude "Create architecture plan"

# Switch to Qwen for multi-language task
python toggle_reasoning_engine.py --toggle
qwen "Translate this to Chinese"

# Switch back to Claude Code
python toggle_reasoning_engine.py --engine claude
claude "Implement the feature"
```

### Q10: Will Specify commands work with Qwen?

**A:** Yes! All Specify commands work with both engines:

**With Claude Code**:
```bash
/sp.specify "Add feature"
/sp.plan "Create plan"
/sp.tasks "Generate tasks"
/sp.implement "Implement feature"
```

**With Qwen**:
```bash
# Same commands, just run via qwen CLI
qwen "/sp.specify Add feature"
qwen "/sp.plan Create plan"
qwen "/sp.tasks Generate tasks"
qwen "/sp.implement Implement feature"
```

---

## Architecture

### How It All Works Together

```
┌─────────────────────────────────────────────────────────┐
│                    User Commands                        │
│  - claude "Use skill_name..."                           │
│  - qwen "Use skill_name..."                             │
│  - /sp.specify, /sp.plan, /sp.tasks, /sp.implement      │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              AI Reasoning Engine Layer                  │
│  ┌─────────────┐           ┌─────────────┐             │
│  │  Claude     │◄──────────┤   Toggle    │             │
│  │  Code       │  Switch   │   Script    │             │
│  │  (Primary)  │──────────►│             │             │
│  └──────┬──────┘           └─────────────┘             │
│         │                                               │
│         └───────────┬───────────────┘                   │
│                     │                                   │
│              AI_REASONING_ENGINE                        │
│              (in .env file)                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Agent Skills (18 total)                    │
│  - skills/read_task.md                                  │
│  - skills/odoo_create_invoice.md                        │
│  - skills/facebook_post.md                              │
│  - ... (all work with both engines)                     │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              MCP Servers (5 total)                      │
│  - email-mcp, odoo-mcp, social-mcp                      │
│  - browser-mcp, docs-mcp                                │
│  (all work with both engines)                           │
└─────────────────────────────────────────────────────────┘
```

---

## Usage Examples

### Example 1: Using Skills with Claude Code

```bash
# Ensure Claude Code is active
python toggle_reasoning_engine.py --engine claude

# Use a skill
claude "Use odoo_create_invoice skill to create invoice for Client ABC, $5000"

# Check skill was invoked
# Claude Code reads skills/odoo_create_invoice.md and executes it
```

### Example 2: Using Same Skill with Qwen

```bash
# Switch to Qwen
python toggle_reasoning_engine.py --toggle

# Use the same skill
qwen "Use odoo_create_invoice skill to create invoice for Client ABC, $5000"

# Same skill documentation, different AI engine
```

### Example 3: Specify Commands

```bash
# With Claude Code
python toggle_reasoning_engine.py --engine claude
claude "/sp.specify Add user authentication"

# With Qwen
python toggle_reasoning_engine.py --engine qwen
qwen "/sp.specify Add user authentication"
```

---

## Troubleshooting

### Q: Skills don't seem to work with Qwen

**A:** Check:
1. Qwen CLI is installed: `qwen --version`
2. You're using correct syntax: `qwen "Use skill_name skill to..."`
3. Skill documentation exists: `ls skills/skill_name.md`

### Q: MCP servers not working with Qwen

**A:** MCP configuration is engine-independent:
1. Verify MCP servers work: `claude "List MCP servers"`
2. Same MCP config works for Qwen
3. Check `~/.config/claude-code/mcp.json`

### Q: Ralph Wiggum loop behaves differently with Qwen

**A:** Different AI engines may have different reasoning styles:
1. Both engines support the loop pattern
2. Adjust max_iterations if needed
3. Review loop logs: `AI_Employee_Vault/Logs/ralph_wiggum_log.jsonl`

---

## Summary

| Question | Answer |
|----------|--------|
| Do skills work with Qwen? | ✅ Yes, all 18 skills work with both engines |
| Do I need to modify skills? | ❌ No, skills are engine-agnostic |
| How do I switch engines? | `python toggle_reasoning_engine.py --toggle` |
| What changes when I switch? | Only the CLI command (`claude` vs `qwen`) |
| Do MCP servers work with Qwen? | ✅ Yes, MCP is engine-independent |
| Does Ralph Wiggum loop work? | ✅ Yes, loop pattern works with both |
| Do Specify commands work? | ✅ Yes, all commands work with both |

---

*Document per Hackathon 0 documentation requirements*
