# Skill: Docs Lookup API

## Purpose
Look up API documentation and code examples via docs-mcp server for Facebook, Instagram, Twitter, Odoo, Gmail, Playwright, and other APIs.

## Inputs
- `api_name`: API name (string, required) - e.g., 'facebook', 'instagram', 'twitter', 'odoo', 'gmail', 'playwright'
- `endpoint`: Specific endpoint (string, optional)
- `method`: HTTP method (string, optional) - e.g., 'GET', 'POST'
- `operation`: Operation name for code examples (string, optional) - e.g., 'post', 'create', 'update'
- `language`: Programming language (string, default: 'javascript')

## Outputs
- `success`: Boolean indicating lookup success
- `documentation_url`: URL to official documentation (string)
- `example`: Code example (string)
- `api_name`: API name
- `message`: Status message
- `error`: Error message if failed

## Examples

### Example 1: Lookup Facebook Documentation

**Input**:
```json
{
  "api_name": "facebook",
  "endpoint": "/{page-id}/feed",
  "method": "POST"
}
```

**Output**:
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

### Example 2: Get Odoo Invoice Code Example

**Input**:
```json
{
  "api_name": "odoo",
  "operation": "invoice",
  "language": "javascript"
}
```

**Output**:
```json
{
  "success": true,
  "language": "javascript",
  "api_name": "odoo",
  "operation": "invoice",
  "example": "// Odoo JSON-RPC Invoice Example\nconst response = await axios.post(...)",
  "message": "Code example generated for odoo invoice"
}
```

## Dependencies
- docs-mcp server operational
- Internet connection for documentation lookup

## Usage

### As Claude Code Skill

```bash
# Invoke docs_lookup_api skill
claude-code "Use docs_lookup_api skill to lookup Instagram documentation:
- api_name: instagram
- endpoint: /{ig-user-id}/media
- method: POST

Invoke via docs-mcp server."
```

## Supported APIs

| API | Documentation URL |
|-----|------------------|
| Facebook | https://developers.facebook.com/docs/graph-api |
| Instagram | https://developers.facebook.com/docs/instagram-api |
| Twitter | https://developer.twitter.com/en/docs |
| Odoo | https://www.odoo.com/documentation/19.0/developer/reference/external_api.html |
| Gmail | https://developers.google.com/gmail/api |
| Playwright | https://playwright.dev/docs/api/class-playwright |

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| API not found | Unknown api_name | Use supported API name |
| Connection failed | Network issue | Check internet connection |
| Example not found | No example for operation | Consult official documentation |

## Integration

Docs lookup integrated with all MCP server development:

1. Developer needs API documentation
2. docs_lookup_api skill invoked via docs-mcp
3. Documentation URL and code examples returned
4. Developer uses documentation for implementation
5. All lookups logged for reference
