# API Reference

**Personal AI Employee - Hackathon 0**  
**Version**: 1.0.0  
**Date**: 2026-02-21

---

## MCP Server APIs

### Email MCP API

**Endpoint**: `mcp_servers/email-mcp/index.js`

**Tools**:
- `send_email` - Send email via SMTP

**Input Schema**:
```json
{
  "to": "recipient@example.com",
  "subject": "Email subject",
  "body": "Email body (HTML supported)",
  "attachments": []
}
```

**Output Schema**:
```json
{
  "success": true,
  "messageId": "<abc123@mail.gmail.com>",
  "message": "Email sent successfully"
}
```

---

### Odoo MCP API

**Endpoint**: `mcp_servers/odoo-mcp/index.js`

**Tools**:

#### odoo_create_invoice

**Input Schema**:
```json
{
  "partner_id": 123,
  "amount": 5000.00,
  "project": "Consulting Services",
  "line_items": []
}
```

**Output Schema**:
```json
{
  "success": true,
  "invoice_id": 456,
  "message": "Invoice 456 created successfully"
}
```

#### odoo_log_transaction

**Input Schema**:
```json
{
  "type": "expense",
  "account_id": 456,
  "amount": 150.00,
  "description": "Office supplies",
  "category": "Office Expenses"
}
```

**Output Schema**:
```json
{
  "success": true,
  "transaction_id": 789,
  "message": "Transaction 789 logged successfully"
}
```

#### odoo_run_audit

**Input Schema**:
```json
{
  "start_date": "2026-02-14",
  "end_date": "2026-02-21",
  "filters": {}
}
```

**Output Schema**:
```json
{
  "success": true,
  "total_invoices": 15,
  "total_revenue": 25000.00,
  "total_expenses": 3500.00,
  "profit": 21500.00,
  "invoices": [],
  "message": "Audit complete: 15 invoices"
}
```

---

### Social MCP API

**Endpoint**: `mcp_servers/social-mcp/index.js`

**Tools**:

#### facebook_post

**Input Schema**:
```json
{
  "message": "Post message",
  "link": "https://example.com",
  "image_url": "https://example.com/image.jpg"
}
```

**Output Schema**:
```json
{
  "success": true,
  "post_id": "123456789_987654321",
  "platform": "facebook",
  "message": "Facebook post created successfully"
}
```

#### instagram_post

**Input Schema**:
```json
{
  "caption": "Post caption",
  "image_url": "https://example.com/image.jpg"
}
```

**Output Schema**:
```json
{
  "success": true,
  "post_id": "17841405822304914",
  "platform": "instagram",
  "message": "Instagram post created successfully"
}
```

#### twitter_post

**Input Schema**:
```json
{
  "text": "Tweet text (max 280 chars)"
}
```

**Output Schema**:
```json
{
  "success": true,
  "post_id": "1628374950183746582",
  "platform": "twitter",
  "message": "Twitter post created successfully"
}
```

#### social_generate_summary

**Input Schema**:
```json
{
  "activities": ["Activity 1", "Activity 2"],
  "platform": "facebook"
}
```

**Output Schema**:
```json
{
  "success": true,
  "summary": "🎉 This Week in Review:\n\nActivity 1\nActivity 2\n\n#WeeklyReview",
  "platform": "facebook",
  "character_count": 145,
  "message": "Summary generated for facebook"
}
```

---

### Browser MCP API

**Endpoint**: `mcp_servers/browser-mcp/index.js`

**Tools**:

#### browser_fill_form

**Input Schema**:
```json
{
  "url": "https://example.com/form",
  "fields": {
    "#name": "John Doe",
    "#email": "john@example.com"
  },
  "submit_selector": "button[type='submit']"
}
```

**Output Schema**:
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "screenshot": "base64..."
}
```

#### browser_extract_data

**Input Schema**:
```json
{
  "url": "https://example.com/pricing",
  "selectors": {
    "basic_price": ".plan-basic .price",
    "pro_price": ".plan-pro .price"
  }
}
```

**Output Schema**:
```json
{
  "success": true,
  "data": {
    "basic_price": "$9.99",
    "pro_price": "$19.99"
  },
  "message": "Extracted 2 data points"
}
```

#### browser_navigate_screenshot

**Input Schema**:
```json
{
  "url": "https://example.com",
  "wait_for": ".main-content",
  "timeout_ms": 30000
}
```

**Output Schema**:
```json
{
  "success": true,
  "screenshot": "base64...",
  "title": "Example Domain",
  "message": "Screenshot captured for https://example.com"
}
```

---

### Docs MCP API

**Endpoint**: `mcp_servers/docs-mcp/index.js`

**Tools**:

#### docs_lookup_api

**Input Schema**:
```json
{
  "api_name": "facebook",
  "endpoint": "/{page-id}/feed",
  "method": "POST"
}
```

**Output Schema**:
```json
{
  "success": true,
  "documentation_url": "https://developers.facebook.com/docs/graph-api",
  "api_name": "facebook",
  "endpoint": "/{page-id}/feed",
  "method": "POST",
  "message": "Documentation found for facebook"
}
```

#### docs_get_examples

**Input Schema**:
```json
{
  "api_name": "odoo",
  "operation": "invoice",
  "language": "javascript"
}
```

**Output Schema**:
```json
{
  "success": true,
  "language": "javascript",
  "api_name": "odoo",
  "operation": "invoice",
  "example": "// Odoo JSON-RPC Invoice Example\n...",
  "message": "Code example generated for odoo invoice"
}
```

---

## Agent Skills Reference

### Silver Tier Skills (7)

1. **read_task.md**: Parse task files and extract metadata
2. **plan_action.md**: Create action plans from task descriptions
3. **write_report.md**: Write completion reports
4. **file_operations.md**: Move files between folders
5. **create_plan_md.md**: Create Plan.md with checkboxes
6. **send_email.md**: Send emails via SMTP
7. **schedule_task.md**: Schedule recurring tasks

### Gold Tier Skills (10+)

1. **odoo_create_invoice.md**: Create invoices in Odoo
2. **odoo_log_transaction.md**: Log transactions in Odoo
3. **odoo_run_audit.md**: Run audit reports in Odoo
4. **facebook_post.md**: Post to Facebook
5. **instagram_post.md**: Post to Instagram
6. **twitter_post.md**: Post to Twitter
7. **social_generate_summary.md**: Generate social summaries
8. **browser_automate.md**: Browser automation via Playwright
9. **docs_lookup_api.md**: API documentation lookup
10. **error_recovery.md**: Error handling with retry logic
11. **ralph_wiggum_orchestrator.md**: Ralph Wiggum loop orchestration

---

## Odoo JSON-RPC API Reference

### Base URL

```
http://localhost:8069/web/dataset/call_kw
```

### Request Format

```json
{
  "jsonrpc": "2.0",
  "method": "call",
  "params": {
    "service": "object",
    "method": "execute",
    "args": [
      "database",
      "api_key",
      "model",
      "method",
      [arguments]
    ]
  }
}
```

### Example: Create Invoice

```bash
curl -X POST http://localhost:8069/web/dataset/call_kw \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "object",
      "method": "execute",
      "args": [
        "odoo_db",
        "api_key",
        "account.move",
        "create",
        [{
          "move_type": "out_invoice",
          "partner_id": 123,
          "invoice_line_ids": [[0, 0, {
            "name": "Service",
            "price_unit": 100.00,
            "quantity": 1
          }]]
        }]
      ]
    }
  }'
```

### Example: Search Read

```bash
curl -X POST http://localhost:8069/web/dataset/call_kw \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
      "service": "object",
      "method": "execute",
      "args": [
        "odoo_db",
        "api_key",
        "account.move",
        "search_read",
        [[["date", ">=", "2026-02-01"]], ["name", "amount_total", "state"]]
      ]
    }
  }'
```

---

## Social Media API References

### Facebook Graph API

**Base URL**: `https://graph.facebook.com/v18.0`

**Post to Page**:
```
POST /{page-id}/feed
```

**Parameters**:
- `message`: Post message
- `link`: Link to share (optional)
- `access_token`: Page Access Token

### Instagram Graph API

**Base URL**: `https://graph.facebook.com/v18.0`

**Create Media Container**:
```
POST /{ig-user-id}/media
```

**Parameters**:
- `image_url`: Image URL
- `caption`: Caption text
- `access_token`: Access Token

**Publish Media**:
```
POST /{ig-user-id}/media_publish
```

**Parameters**:
- `creation_id`: Container ID from previous step
- `access_token`: Access Token

### Twitter API v2

**Base URL**: `https://api.twitter.com/2`

**Create Tweet**:
```
POST /tweets
```

**Headers**:
- `Authorization: Bearer {bearer-token}`
- `Content-Type: application/json`

**Body**:
```json
{
  "text": "Tweet text (max 280 chars)"
}
```

---

## Error Codes

### MCP Server Errors

| Code | Message | Resolution |
|------|---------|------------|
| 400 | Invalid input | Check input schema |
| 401 | Authentication failed | Verify credentials |
| 403 | Permission denied | Check API permissions |
| 404 | Not found | Verify resource ID |
| 429 | Rate limit exceeded | Wait and retry |
| 500 | Server error | Check server logs |
| 503 | Service unavailable | Retry later |

### Odoo Errors

| Error | Cause | Resolution |
|-------|-------|------------|
| Connection refused | Odoo not running | Start Odoo server |
| Authentication failed | Invalid API key | Regenerate API key |
| Model not found | Invalid model name | Verify model exists |
| Access denied | Insufficient permissions | Check user permissions |

---

*Document per Hackathon 0 Handbook requirements*
