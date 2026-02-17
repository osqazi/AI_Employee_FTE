# Skill: Read Task

## Purpose
Parse a task file and extract frontmatter metadata and body content.

## Inputs
- `file_path`: Path to the task file to read (string)

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

### Example 2: Read completed task
**Input**: `/path/to/vault/Done/task_001.md`
**Output**:
```python
{
  "frontmatter": {
    "source": "file_watcher",
    "timestamp": "2026-02-17T10:30:00Z",
    "status": "completed",
    "priority": "medium"
  },
  "body": "# Task Description\n\n...\n\n## Completion Report\n\nTask completed successfully."
}
```

## Dependencies
- Python `yaml` library (optional, can parse simple YAML manually)
- File system read access

## Usage
When Claude Code needs to process a task, first invoke this skill to read and parse the file.

**Prompt Template**:
```
Read the task file at {file_path} and extract:
1. YAML frontmatter fields (source, timestamp, status, priority)
2. Body content (Task Description, Processing Notes, Completion Report sections)

Return the parsed data in a structured format.
```
