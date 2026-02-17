# Skill: Plan Action

## Purpose
Create an ordered action plan from a task description.

## Inputs
- `task_description`: The task description from the parsed task file (string)
- `task_priority`: Priority level (low/medium/high) (string)
- `task_source`: What triggered this task (string, optional)

## Outputs
- `plan`: Ordered list of actions to complete the task
- `requires_approval`: Boolean indicating if human approval is needed
- `approval_reason`: If approval needed, explain why (string)

## Examples

### Example 1: Simple file processing
**Input**: 
- task_description: "Review and process file invoice_123.pdf"
- task_priority: "medium"
- task_source: "file_watcher"

**Output**:
```
Plan:
1. Read the invoice file content
2. Extract key information (amount, date, vendor, invoice number)
3. Validate extracted data
4. Log the extraction with structured logging
5. Write summary to completion report
6. Move task file to Done folder

Requires approval: No
```

### Example 2: Action requiring approval
**Input**:
- task_description: "Send email to client with invoice"
- task_priority: "high"
- task_source: "file_watcher"

**Output**:
```
Plan:
1. Draft email content with invoice attachment
2. Prepare recipient details
3. Flag for human approval (external communication)
4. After approval: Send email via configured email service
5. Log sending confirmation
6. Move task to Done folder

Requires approval: Yes
Approval reason: External communication (email sending) requires HITL per Constitution Principle I
```

## Dependencies
- None

## Usage
After reading a task, invoke this skill to create a plan before execution.

**Prompt Template**:
```
Based on this task description, create a step-by-step action plan:

Task: {task_description}
Priority: {task_priority}
Source: {task_source}

Consider:
1. What actions are needed to complete this task?
2. Does this require human approval? (financial, legal, external communications)
3. What information needs to be logged?

Return an ordered list of actions and indicate if approval is needed.
```
