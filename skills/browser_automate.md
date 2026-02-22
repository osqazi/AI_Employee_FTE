# Skill: Browser Automate

## Purpose
Automate web browser interactions using Playwright via browser-mcp server for form filling, data extraction, and screenshot capture.

## Inputs
- `action`: Browser action ('fill_form', 'extract_data', 'navigate_screenshot') (string, required)
- `url`: Target URL (string, required)
- `fields`: Form fields or CSS selectors (object, optional)
- `submit_selector`: Submit button CSS selector (string, optional)
- `wait_for`: CSS selector to wait for (string, optional)
- `timeout_ms`: Timeout in milliseconds (integer, default: 30000)

## Outputs
- `success`: Boolean indicating action success
- `data`: Extracted data or screenshot (object/string)
- `message`: Status message
- `error`: Error message if failed

## Examples

### Example 1: Fill and Submit Form

**Input**:
```json
{
  "action": "fill_form",
  "url": "https://example.com/contact",
  "fields": {
    "#name": "John Doe",
    "#email": "john@example.com",
    "#message": "Hello!"
  },
  "submit_selector": "button[type='submit']"
}
```

**Output**:
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "screenshot": "base64..."
}
```

### Example 2: Extract Data

**Input**:
```json
{
  "action": "extract_data",
  "url": "https://example.com/pricing",
  "selectors": {
    "basic_price": ".plan-basic .price",
    "pro_price": ".plan-pro .price",
    "enterprise_price": ".plan-enterprise .price"
  }
}
```

**Output**:
```json
{
  "success": true,
  "data": {
    "basic_price": "$9.99",
    "pro_price": "$19.99",
    "enterprise_price": "$49.99"
  },
  "message": "Extracted 3 data points"
}
```

## Dependencies
- browser-mcp server operational
- Playwright installed (npx playwright install)
- Chromium browser available

## Usage

### As Claude Code Skill

```bash
# Invoke browser_automate skill
claude-code "Use browser_automate skill to fill form:
- action: fill_form
- url: https://example.com/contact
- fields: {name: John, email: john@example.com}

Invoke via browser-mcp server."
```

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Timeout | Page load timeout | Increase timeout_ms |
| Selector not found | Invalid CSS selector | Verify selector syntax |
| Navigation failed | Invalid URL | Check URL validity |
| Playwright not installed | Missing browser | Run: npx playwright install |

## HITL Approval

Browser automation requires HITL approval before execution:

1. Task created in /Needs_Action with browser action details
2. User reviews and moves task to /Pending_Approval
3. browser_automate skill invoked via browser-mcp
4. Action executed, screenshot captured
5. Task moved to /Done with results logged
