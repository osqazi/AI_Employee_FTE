# MCP Server Documentation Lookup Configuration

This file configures MCP servers for fetching current documentation during Silver Tier implementation.

## Configured Documentation Sources

### Python 3.13
- **MCP Command**: `mcp-docs python`
- **Official Docs**: https://docs.python.org/3.13/
- **Key Topics**: pathlib, logging, abc (Abstract Base Classes), datetime

### Playwright (WhatsApp Automation)
- **MCP Command**: `mcp-docs playwright`
- **Official Docs**: https://playwright.dev/python/
- **Key Topics**: Browser automation, WhatsApp Web automation, selectors

### Gmail API
- **MCP Command**: `mcp-docs gmail-api`
- **Official Docs**: https://developers.google.com/gmail/api
- **Key Topics**: Authentication (OAuth2), messages.list, messages.get

### WhatsApp Business API
- **MCP Command**: `mcp-docs whatsapp-business-api`
- **Official Docs**: https://developers.facebook.com/docs/whatsapp
- **Key Topics**: Business API, message templates, webhooks

### Node.js (MCP Server Development)
- **MCP Command**: `mcp-docs nodejs`
- **Official Docs**: https://nodejs.org/docs/latest/
- **Key Topics**: MCP server pattern, JSON-RPC, environment variables

### MCP Server Templates
- **MCP Command**: `mcp-docs mcp-server`
- **Official Docs**: https://github.com/anthropics/claude-code/tree/main/docs/mcp
- **Key Topics**: Server configuration, capabilities, authentication

### Cron Syntax (Linux/macOS)
- **MCP Command**: `mcp-docs cron`
- **Official Docs**: https://man7.org/linux/man-pages/man5/crontab.5.html
- **Key Topics**: Cron syntax, scheduling, system timers

### Windows Task Scheduler
- **MCP Command**: `mcp-docs windows-task-scheduler`
- **Official Docs**: https://docs.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page
- **Key Topics**: Task creation, triggers, actions

## Usage Examples

During implementation, invoke MCP server for documentation:

```bash
# Get Python pathlib documentation
mcp-docs python pathlib

# Get Gmail API authentication guide
mcp-docs gmail-api oauth2

# Get Playwright browser automation examples
mcp-docs playwright browser-automation

# Get MCP server configuration template
mcp-docs mcp-server config-template

# Get cron syntax examples
mcp-docs cron examples
```

## Fallback

If MCP server is unavailable, fetch documentation from official sources:
- Python: https://docs.python.org/3.13/
- Playwright: https://playwright.dev/python/
- Gmail API: https://developers.google.com/gmail/api
- Node.js: https://nodejs.org/docs/latest/
- MCP: https://github.com/anthropics/claude-code/tree/main/docs/mcp
