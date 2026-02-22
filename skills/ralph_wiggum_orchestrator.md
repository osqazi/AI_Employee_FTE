# Skill: Ralph Wiggum Orchestrator

## Purpose
Orchestrate autonomous multi-step task completion using the Ralph Wiggum loop pattern (Stop hook from Handbook Section 2D). Keeps Claude Code iterating (READ → REASON → PLAN → ACT → CHECK) until tasks are complete or max iterations (10) reached.

## Inputs
- `task_file`: Path to task file in /Needs_Action (string, required)
- `max_iterations`: Maximum loop iterations (integer, default: 10)
- `current_iteration`: Current iteration number (integer, default: 0)
- `plan_file`: Path to associated Plan.md (string, optional)

## Outputs
- `status`: Loop status ('active', 'completed', 'failed', 'max_iterations_exceeded') (string)
- `iteration`: Current iteration number (integer)
- `phase`: Current phase ('READ', 'REASON', 'PLAN', 'ACT', 'CHECK') (string)
- `action`: Action taken in current iteration (string)
- `outcome`: Outcome of current iteration (string)
- `next_action`: Next action to take (string)
- `should_continue`: Boolean indicating if loop should continue

## Examples

### Example 1: First Iteration

**Input**:
```json
{
  "task_file": "AI_Employee_Vault/Needs_Action/CROSSDOMAIN_INVOICE_20260221_150833.md",
  "max_iterations": 10,
  "current_iteration": 0
}
```

**Output**:
```json
{
  "status": "active",
  "iteration": 1,
  "phase": "READ",
  "action": "Load task file and extract frontmatter",
  "outcome": "Task loaded successfully",
  "next_action": "Reason about next step",
  "should_continue": true
}
```

### Example 2: Task Completed

**Input**:
```json
{
  "task_file": "AI_Employee_Vault/Needs_Action/CROSSDOMAIN_INVOICE_20260221_150833.md",
  "max_iterations": 10,
  "current_iteration": 3,
  "plan_file": "AI_Employee_Vault/Plans/PLAN_20260221_150833.md"
}
```

**Output**:
```json
{
  "status": "completed",
  "iteration": 4,
  "phase": "CHECK",
  "action": "Verify all Plan.md checkboxes marked [x]",
  "outcome": "All steps complete",
  "next_action": "Move task to /Done, log success",
  "should_continue": false
}
```

### Example 3: Max Iterations Exceeded

**Input**:
```json
{
  "task_file": "AI_Employee_Vault/Needs_Action/CROSSDOMAIN_INVOICE_20260221_150833.md",
  "max_iterations": 10,
  "current_iteration": 10
}
```

**Output**:
```json
{
  "status": "max_iterations_exceeded",
  "iteration": 10,
  "phase": "CHECK",
  "action": "Check iteration count",
  "outcome": "Max iterations (10) reached",
  "next_action": "Move task to /Inbox with alert",
  "should_continue": false
}
```

## Dependencies
- ralph_wiggum_loop.py orchestrator
- Plan.md for state persistence
- ralph_wiggum_log.jsonl for iteration logging

## Usage

### As Claude Code Skill

```bash
# Invoke ralph_wiggum_orchestrator skill
claude-code "Use ralph_wiggum_orchestrator skill to process task:
- task_file: AI_Employee_Vault/Needs_Action/CROSSDOMAIN_INVOICE_*.md
- max_iterations: 10

Run READ → REASON → PLAN → ACT → CHECK loop until complete."
```

## Ralph Wiggum Loop Pattern

### Iteration Phases

```
┌─────────────────────────────────────────────────────────────┐
│ Ralph Wiggum Loop                                           │
├─────────────────────────────────────────────────────────────┤
│ 1. READ: Load task from /Needs_Action                       │
│ 2. REASON: Analyze task, determine next step                │
│ 3. PLAN: Create/update Plan.md with action items            │
│ 4. ACT: Execute action via Agent Skills + MCP servers       │
│ 5. CHECK: Verify if task complete                           │
│    - If YES: Move to /Done, log success, exit               │
│    - If NO: Increment iteration counter                     │
│      - If iterations < 10: Go to step 2                     │
│      - If iterations >= 10: Move to /Inbox, log failure     │
└─────────────────────────────────────────────────────────────┘
```

### State Persistence

**Plan.md** tracks:
- `status`: active, completed, archived
- `created`: Creation timestamp
- `updated`: Last update timestamp
- `total_steps`: Total action items
- `completed_steps`: Completed action items
- `iteration`: Current iteration number

**ralph_wiggum_log.jsonl** tracks:
- Every iteration with phase, action, outcome, duration
- Full audit trail for debugging

### Escape Conditions

| Condition | Action |
|-----------|--------|
| Task complete (all checkboxes [x]) | Move to /Done, log success |
| Max iterations (10) reached | Move to /Inbox, log failure |
| Human flag file created | Pause loop, alert user |
| Explicit completion marker | Move to /Done, log success |

## Logging

All iterations logged to `AI_Employee_Vault/Logs/ralph_wiggum_log.jsonl`:

```json
{
  "timestamp": "2026-02-21T10:30:00Z",
  "plan_file": "AI_Employee_Vault/Plans/PLAN_20260221_150833.md",
  "iteration": 1,
  "phase": "READ",
  "action": "Load task file and extract frontmatter",
  "outcome": "Task loaded successfully",
  "next_phase": "REASON",
  "duration_ms": 50
}
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Task file not found | Invalid task_file path | Verify task exists in /Needs_Action |
| Plan.md not found | Missing plan_file | Create Plan.md on first iteration |
| Max iterations | Task too complex | Move to /Inbox with full context |
| MCP server error | External service down | Retry with backoff, fallback to manual |

## Integration

Ralph Wiggum loop integrated with all cross-domain flows:

1. Cross-domain trigger detected
2. Task created in /Needs_Action
3. ralph_wiggum_orchestrator skill invoked
4. Loop runs until task complete or max iterations
5. Task moved to /Done (success) or /Inbox (failure)
6. All iterations logged for audit

## Handbook Reference

Implements Handbook Section 2D "Ralph Wiggum Loop" pattern:
- Stop hook intercepts Claude Code exit
- Re-injects prompt if task not complete
- Allows Claude to see previous failed output
- Continues until completion or max iterations
