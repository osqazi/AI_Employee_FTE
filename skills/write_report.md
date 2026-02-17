# Skill: Write Report

## Purpose
Append a completion report to a task file.

## Inputs
- `file_path`: Path to the task file (string)
- `results`: Summary of what was accomplished (string)
- `status`: Final status - completed, failed, or approved (string)
- `error_message`: If failed, description of the error (string, optional)

## Outputs
- `success`: Boolean indicating if the write was successful
- `file_path`: Path to the updated file (string)

## Examples

### Example 1: Write completion report
**Input**: 
- file_path: `/path/to/vault/Needs_Action/task_001.md`
- results: "File processed successfully. Invoice #123 extracted: $500.00, Vendor: ACME Corp."
- status: "completed"

**Output**: `{"success": true, "file_path": "/path/to/vault/Done/task_001.md"}`

### Example 2: Write failure report
**Input**:
- file_path: `/path/to/vault/Needs_Action/task_002.md`
- results: "Could not parse file - invalid format"
- status: "failed"
- error_message: "File does not contain expected YAML frontmatter"

**Output**: `{"success": true, "file_path": "/path/to/vault/Inbox/task_002.md"}`

## Dependencies
- File system write access

## Usage
After completing a task, invoke this skill to write the final report.

**Prompt Template**:
```
Update the task file at {file_path} with:

Status: {status}
Results: {results}
{Error message if applicable}

Steps:
1. Read the existing file content
2. Update the YAML frontmatter status field
3. Append the completion report to the ## Completion Report section
4. Move the file to appropriate folder (Done/Inbox)
5. Confirm the write was successful
```
