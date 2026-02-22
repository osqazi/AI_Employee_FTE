# Skill: Odoo Log Transaction

## Purpose
Log transactions (expenses/revenue) in Odoo Community accounting system via JSON-RPC API using odoo-mcp server.

## Inputs
- `type`: Transaction type ('expense' or 'revenue') (string, required)
- `account_id`: Odoo account/partner ID (integer, required)
- `amount`: Transaction amount (number, required)
- `description`: Transaction description (string, required)
- `category`: Transaction category (string, optional)

## Outputs
- `success`: Boolean indicating transaction logging success
- `transaction_id`: Odoo transaction ID (integer) if successful
- `message`: Status message
- `error`: Error message if failed

## Examples

### Example 1: Log Expense

**Input**:
```json
{
  "type": "expense",
  "account_id": 456,
  "amount": 150.00,
  "description": "Office supplies purchase",
  "category": "Office Expenses"
}
```

**Output**:
```json
{
  "success": true,
  "transaction_id": 789,
  "message": "Transaction 789 logged successfully"
}
```

### Example 2: Log Revenue

**Input**:
```json
{
  "type": "revenue",
  "account_id": 123,
  "amount": 5000.00,
  "description": "Consulting services - Project ABC",
  "category": "Service Revenue"
}
```

**Output**:
```json
{
  "success": true,
  "transaction_id": 790,
  "message": "Transaction 790 logged successfully"
}
```

### Example 3: Transaction Logging Failed

**Input**:
```json
{
  "type": "expense",
  "account_id": 999,
  "amount": 150.00,
  "description": "Office supplies"
}
```

**Output**:
```json
{
  "success": false,
  "error": "Account 999 not found",
  "message": "Failed to log transaction"
}
```

## Dependencies
- odoo-mcp server operational
- Odoo Community v19+ installed and accessible via JSON-RPC
- ODOO_URL, ODOO_DATABASE, ODOO_API_KEY environment variables configured

## Usage

### As Claude Code Skill

```bash
# Invoke odoo_log_transaction skill
claude-code "Use odoo_log_transaction skill to log expense:
- type: expense
- account_id: 456
- amount: 150
- description: Office supplies purchase
- category: Office Expenses

Invoke via odoo-mcp server."
```

### As Python Function (via odoo-mcp)

```python
# Via MCP server
result = await odoo_mcp.log_transaction({
    'type': 'expense',
    'account_id': 456,
    'amount': 150.00,
    'description': 'Office supplies purchase',
    'category': 'Office Expenses'
})

if result['success']:
    print(f"Transaction logged: {result['transaction_id']}")
else:
    print(f"Error: {result['error']}")
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Account not found | Invalid account_id | Verify account exists in Odoo |
| Odoo connection failed | Odoo server down | Check ODOO_URL, restart Odoo |
| Authentication failed | Invalid API key | Verify ODOO_API_KEY |
| Amount invalid | Negative or zero amount | Ensure amount > 0 |
| Type invalid | Not 'expense' or 'revenue' | Use valid type |

## Logging

All transaction loggings logged to `AI_Employee_Vault/Logs/audit_log.jsonl`:

```json
{
  "timestamp": "2026-02-21T10:35:00Z",
  "action": "odoo_log_transaction",
  "source": "odoo-mcp",
  "status": "success",
  "details": {
    "type": "expense",
    "account_id": 456,
    "amount": 150.00,
    "description": "Office supplies purchase",
    "category": "Office Expenses",
    "transaction_id": 789
  }
}
```

## HITL Approval

Transaction logging requires HITL approval before execution:

1. Cross-domain trigger detected (file drop with receipt)
2. Task created in /Needs_Action with transaction details
3. User reviews and moves task to /Pending_Approval
4. odoo_log_transaction skill invoked via odoo-mcp
5. Transaction logged in Odoo
6. Task moved to /Done with transaction_id logged
