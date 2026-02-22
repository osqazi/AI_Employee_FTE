# Skill: Odoo Create Invoice

## Purpose
Create invoices in Odoo Community accounting system via JSON-RPC API using odoo-mcp server.

## Inputs
- `partner_id`: Odoo partner (client) ID (integer)
- `amount`: Invoice amount (number)
- `project`: Project name (string)
- `line_items`: Optional array of line items with name, quantity, price_unit

## Outputs
- `success`: Boolean indicating invoice creation success
- `invoice_id`: Odoo invoice ID (integer) if successful
- `message`: Status message
- `error`: Error message if failed

## Examples

### Example 1: Simple Invoice Creation

**Input**:
```json
{
  "partner_id": 123,
  "amount": 5000.00,
  "project": "Consulting Services"
}
```

**Output**:
```json
{
  "success": true,
  "invoice_id": 456,
  "message": "Invoice 456 created successfully"
}
```

### Example 2: Invoice with Line Items

**Input**:
```json
{
  "partner_id": 123,
  "amount": 5000.00,
  "project": "Consulting Services",
  "line_items": [
    {
      "name": "Business Consulting",
      "quantity": 10,
      "price_unit": 500.00
    }
  ]
}
```

**Output**:
```json
{
  "success": true,
  "invoice_id": 456,
  "message": "Invoice 456 created successfully"
}
```

### Example 3: Invoice Creation Failed

**Input**:
```json
{
  "partner_id": 999,
  "amount": 5000.00,
  "project": "Consulting Services"
}
```

**Output**:
```json
{
  "success": false,
  "error": "Partner 999 not found",
  "message": "Failed to create invoice"
}
```

## Dependencies
- odoo-mcp server operational
- Odoo Community v19+ installed and accessible via JSON-RPC
- ODOO_URL, ODOO_DATABASE, ODOO_API_KEY environment variables configured

## Usage

### As Claude Code Skill

```bash
# Invoke odoo_create_invoice skill
claude-code "Use odoo_create_invoice skill to create invoice:
- partner_id: 123
- amount: 5000
- project: Consulting Services

Invoke via odoo-mcp server."
```

### As Python Function (via odoo-mcp)

```python
# Via MCP server
result = await odoo_mcp.create_invoice({
    'partner_id': 123,
    'amount': 5000.00,
    'project': 'Consulting Services'
})

if result['success']:
    print(f"Invoice created: {result['invoice_id']}")
else:
    print(f"Error: {result['error']}")
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Partner not found | Invalid partner_id | Verify partner exists in Odoo |
| Odoo connection failed | Odoo server down | Check ODOO_URL, restart Odoo |
| Authentication failed | Invalid API key | Verify ODOO_API_KEY |
| Amount invalid | Negative or zero amount | Ensure amount > 0 |

## Logging

All invoice creations logged to `AI_Employee_Vault/Logs/audit_log.jsonl`:

```json
{
  "timestamp": "2026-02-21T10:30:00Z",
  "action": "odoo_create_invoice",
  "source": "odoo-mcp",
  "status": "success",
  "details": {
    "partner_id": 123,
    "amount": 5000.00,
    "project": "Consulting Services",
    "invoice_id": 456
  }
}
```

## HITL Approval

Invoice creation requires HITL approval before execution:

1. Cross-domain trigger detected (WhatsApp message about project completion)
2. Task created in /Needs_Action with invoice details
3. User reviews and moves task to /Pending_Approval
4. odoo_create_invoice skill invoked via odoo-mcp
5. Invoice created in Odoo
6. Task moved to /Done with invoice_id logged
