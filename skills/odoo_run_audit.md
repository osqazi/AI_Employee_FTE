# Skill: Odoo Run Audit

## Purpose
Run audit reports for date ranges in Odoo Community accounting system via JSON-RPC API using odoo-mcp server. Generates revenue, expenses, and profit summaries.

## Inputs
- `start_date`: Start date in YYYY-MM-DD format (string, required)
- `end_date`: End date in YYYY-MM-DD format (string, required)
- `filters`: Optional additional filters (object, optional)

## Outputs
- `success`: Boolean indicating audit success
- `total_invoices`: Total number of invoices in date range (integer)
- `total_revenue`: Total revenue amount (number)
- `total_expenses`: Total expenses amount (number)
- `profit`: Net profit (revenue - expenses) (number)
- `invoices`: Array of invoice details (array)
- `message`: Status message

## Examples

### Example 1: Weekly Audit

**Input**:
```json
{
  "start_date": "2026-02-14",
  "end_date": "2026-02-21"
}
```

**Output**:
```json
{
  "success": true,
  "total_invoices": 15,
  "total_revenue": 25000.00,
  "total_expenses": 3500.00,
  "profit": 21500.00,
  "invoices": [...],
  "message": "Audit complete: 15 invoices, $25000 revenue, $3500 expenses"
}
```

### Example 2: Monthly Audit

**Input**:
```json
{
  "start_date": "2026-02-01",
  "end_date": "2026-02-28"
}
```

**Output**:
```json
{
  "success": true,
  "total_invoices": 45,
  "total_revenue": 75000.00,
  "total_expenses": 12000.00,
  "profit": 63000.00,
  "invoices": [...],
  "message": "Audit complete: 45 invoices, $75000 revenue, $12000 expenses"
}
```

### Example 3: Audit Failed

**Input**:
```json
{
  "start_date": "2026-13-01",
  "end_date": "2026-13-31"
}
```

**Output**:
```json
{
  "success": false,
  "error": "Invalid date format",
  "message": "Failed to run audit"
}
```

## Dependencies
- odoo-mcp server operational
- Odoo Community v19+ installed and accessible via JSON-RPC
- ODOO_URL, ODOO_DATABASE, ODOO_API_KEY environment variables configured

## Usage

### As Claude Code Skill

```bash
# Invoke odoo_run_audit skill
claude-code "Use odoo_run_audit skill to run weekly audit:
- start_date: 2026-02-14
- end_date: 2026-02-21

Invoke via odoo-mcp server."
```

### As Python Function (via odoo-mcp)

```python
# Via MCP server
result = await odoo_mcp.run_audit({
    'start_date': '2026-02-14',
    'end_date': '2026-02-21'
})

if result['success']:
    print(f"Audit complete: {result['total_invoices']} invoices")
    print(f"Revenue: ${result['total_revenue']:,.2f}")
    print(f"Expenses: ${result['total_expenses']:,.2f}")
    print(f"Profit: ${result['profit']:,.2f}")
else:
    print(f"Error: {result['error']}")
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Invalid date format | Dates not YYYY-MM-DD | Use correct date format |
| Odoo connection failed | Odoo server down | Check ODOO_URL, restart Odoo |
| Authentication failed | Invalid API key | Verify ODOO_API_KEY |
| Date range invalid | start_date > end_date | Ensure start_date <= end_date |

## Logging

All audit runs logged to `AI_Employee_Vault/Logs/audit_log.jsonl`:

```json
{
  "timestamp": "2026-02-21T23:59:00Z",
  "action": "odoo_run_audit",
  "source": "odoo-mcp",
  "status": "success",
  "details": {
    "start_date": "2026-02-14",
    "end_date": "2026-02-21",
    "total_invoices": 15,
    "total_revenue": 25000.00,
    "total_expenses": 3500.00,
    "profit": 21500.00
  }
}
```

## CEO Briefing Integration

Audit results used for weekly CEO Briefing generation:

1. Scheduled audit runs every Sunday at 11:59 PM
2. odoo_run_audit skill invoked for previous week
3. Revenue, expenses, profit extracted from audit result
4. CEO Briefing updated in Dashboard.md with:
   - Total revenue for week
   - Total expenses for week
   - Net profit
   - Top clients by revenue
   - Expense breakdown by category
5. Audit logged in audit_log.jsonl

## Subscription Audit

Audit results also used for subscription cost optimization:

1. Run audit for previous month
2. Identify recurring expenses (software subscriptions)
3. Flag subscriptions with:
   - No login in 30 days
   - Cost increased > 20%
   - Duplicate functionality with another tool
4. Add cost optimization suggestions to CEO Briefing
