# Skill: Schedule Task

## Purpose
Schedule recurring or one-time tasks using OS-native scheduling (cron on Linux/macOS, Task Scheduler on Windows).

## Inputs
- `task_type`: Type of task to schedule (daily_tasks, weekly_summary, custom)
- `schedule`: Schedule specification (cron expression or preset)
- `description`: Task description
- `script_path`: Path to Python script to execute
- `enabled`: Whether schedule is active (boolean, default: true)

## Outputs
- `success`: Boolean indicating scheduling success
- `schedule_id`: Identifier for scheduled task
- `next_run`: Next scheduled run time (ISO 8601)
- `message`: Status message

## Examples

### Example 1: Schedule Daily Tasks

**Input**:
```json
{
  "task_type": "daily_tasks",
  "schedule": "0 8 * * *",
  "description": "Run daily tasks scheduler at 8 AM",
  "script_path": "scheduling/daily_tasks.py"
}
```

**Output**:
```json
{
  "success": true,
  "schedule_id": "daily_tasks_8am",
  "next_run": "2026-02-21T08:00:00Z",
  "message": "Daily tasks scheduled for 8:00 AM daily"
}
```

### Example 2: Schedule Weekly Summary

**Input**:
```json
{
  "task_type": "weekly_summary",
  "schedule": "0 9 * * 1",
  "description": "Generate weekly summary every Monday at 9 AM",
  "script_path": "scheduling/weekly_summary.py"
}
```

**Output**:
```json
{
  "success": true,
  "schedule_id": "weekly_summary_monday_9am",
  "next_run": "2026-02-24T09:00:00Z",
  "message": "Weekly summary scheduled for Monday 9:00 AM"
}
```

### Example 3: Custom Schedule

**Input**:
```json
{
  "task_type": "custom",
  "schedule": "*/30 * * * *",
  "description": "Check inbox every 30 minutes",
  "script_path": "watchers/file_watcher.py"
}
```

## Dependencies
- Python 3.13+
- OS scheduling system (cron or Task Scheduler)
- Script to be scheduled must exist

## Usage

### As Claude Code Skill

```bash
# Schedule daily tasks
claude-code "Use schedule_task skill to schedule daily tasks:
- task_type: daily_tasks
- schedule: 0 8 * * *
- script_path: scheduling/daily_tasks.py"

# Schedule weekly summary
claude-code "Use schedule_task skill to schedule weekly summary:
- task_type: weekly_summary
- schedule: 0 9 * * 1
- script_path: scheduling/weekly_summary.py"
```

### Cron Expressions

| Expression | Meaning |
|------------|---------|
| `0 8 * * *` | Daily at 8:00 AM |
| `0 9 * * 1` | Every Monday at 9:00 AM |
| `*/30 * * * *` | Every 30 minutes |
| `0 0 * * *` | Daily at midnight |
| `0 17 * * 5` | Every Friday at 5:00 PM |

### Preset Schedules

| Preset | Cron Expression |
|--------|-----------------|
| `daily_8am` | `0 8 * * *` |
| `daily_9am` | `0 9 * * *` |
| `weekly_monday_9am` | `0 9 * * 1` |
| `weekly_friday_5pm` | `0 17 * * 5` |
| `every_30min` | `*/30 * * * *` |

## Platform-Specific Setup

### Linux/macOS (cron)

1. Open crontab editor:
   ```bash
   crontab -e
   ```

2. Add schedule entry:
   ```bash
   # Daily tasks at 8 AM
   0 8 * * * cd /path/to/project && python scheduling/daily_tasks.py
   ```

3. Save and exit

### Windows (Task Scheduler)

**Via Command Line**:
```powershell
# Create scheduled task
schtasks /Create /TN "Daily Tasks" /TR "python C:\path\to\scheduling\daily_tasks.py" /SC DAILY /ST 08:00
```

**Via GUI**:
1. Open Task Scheduler
2. Click "Create Basic Task"
3. Name: "Daily Tasks"
4. Trigger: Daily at 8:00 AM
5. Action: Start a program
6. Program: `python`
7. Arguments: `scheduling\daily_tasks.py`
8. Start in: `C:\path\to\project`

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Script not found | Invalid script_path | Verify script exists |
| Invalid cron expression | Malformed schedule | Use valid cron syntax |
| Permission denied | No execute permission | Grant script execution rights |
| Python not found | Python not in PATH | Use full Python path |

## Verification

### Check cron jobs (Linux/macOS)
```bash
crontab -l
```

### Check scheduled tasks (Windows)
```powershell
schtasks /Query /TN "Daily Tasks"
```

### Test script manually
```bash
python scheduling/daily_tasks.py
```

## Best Practices

1. **Use absolute paths** in cron/Task Scheduler
2. **Redirect output** to log files:
   ```bash
   0 8 * * * cd /path && python script.py >> logs/daily.log 2>&1
   ```
3. **Set PYTHONPATH** if needed:
   ```bash
   0 8 * * * cd /path && PYTHONPATH=/path python script.py
   ```
4. **Test manually first** before scheduling
5. **Monitor logs** regularly for errors

## Security Notes

- ✅ Scripts run with user permissions
- ✅ No elevated privileges required
- ✅ Logs stored locally
- ❌ Don't schedule scripts with hardcoded credentials
- ❌ Don't expose scheduled tasks to network
