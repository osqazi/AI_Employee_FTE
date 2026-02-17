# Skill: File Operations

## Purpose
Move files between vault folders.

## Inputs
- `source_path`: Current file location (string)
- `dest_folder`: Target folder name - Inbox, Needs_Action, Pending_Approval, Done (string)
- `reason`: Why the file is being moved (string, optional)

## Outputs
- `success`: Boolean indicating if the move was successful
- `new_path`: New file location (string)
- `error`: Error message if move failed (string, optional)

## Examples

### Example 1: Move to Pending_Approval
**Input**: 
- source_path: `/path/to/vault/Needs_Action/task_001.md`
- dest_folder: "Pending_Approval"
- reason: "Requires human approval for external communication"

**Output**: 
```json
{
  "success": true,
  "new_path": "/path/to/vault/Pending_Approval/task_001.md"
}
```

### Example 2: Move to Done
**Input**:
- source_path: `/path/to/vault/Needs_Action/task_002.md`
- dest_folder: "Done"
- reason: "Task completed successfully"

**Output**:
```json
{
  "success": true,
  "new_path": "/path/to/vault/Done/task_002.md"
}
```

### Example 3: Move to Inbox (error case)
**Input**:
- source_path: `/path/to/vault/Needs_Action/task_003.md`
- dest_folder: "Inbox"
- reason: "Malformed task file - manual review required"

**Output**:
```json
{
  "success": true,
  "new_path": "/path/to/vault/Inbox/task_003.md"
}
```

## Dependencies
- File system write access

## Usage
Use this skill to move files between folders during task processing.

**Prompt Template**:
```
Move the file from {source_path} to the {dest_folder} folder.

Reason: {reason}

Steps:
1. Verify the source file exists
2. Read the file content
3. Create the file in the destination folder
4. Delete the original file
5. Log the operation with structured logging
6. Return success status and new path
```

## Status Transitions

| From | To | When |
|------|-----|------|
| Needs_Action | Pending_Approval | Human approval required |
| Pending_Approval | Needs_Action | User approved, continue processing |
| Needs_Action | Done | Task completed successfully |
| Needs_Action | Inbox | Error or malformed file |
| Inbox | Needs_Action | User fixed and resubmitted |
