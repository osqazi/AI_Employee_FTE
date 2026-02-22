# Gold Tier MCP Server Contracts

**Feature**: Gold Tier Autonomous Assistant  
**Branch**: `003-gold-tier`  
**Date**: 2026-02-20  
**Purpose**: Define API contracts for all Gold Tier MCP servers

---

## 1. Odoo MCP Server Contract

### Service Information

- **Server ID**: `odoo-mcp`
- **Protocol**: JSON-RPC 2.0
- **Transport**: HTTP POST
- **Authentication**: Odoo API Key

### Tools

#### `odoo_create_invoice`

**Description**: Create invoice in Odoo via JSON-RPC API

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "partner_id": {"type": "integer", "description": "Odoo partner (client) ID"},
    "amount": {"type": "number", "description": "Invoice amount"},
    "project": {"type": "string", "description": "Project name"},
    "line_items": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": {"type": "string"},
          "quantity": {"type": "number"},
          "price_unit": {"type": "number"}
        }
      }
    }
  },
  "required": ["partner_id", "amount", "project"]
}
```

**Output Schema**:
```json
{
  "type": "object",
  "properties": {
    "success": {"type": "boolean"},
    "invoice_id": {"type": "integer"},
    "invoice_number": {"type": "string"},
    "message": {"type": "string"}
  }
}
```

#### `odoo_log_transaction`

**Description**: Log transaction (expense/revenue) in Odoo accounting

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "type": {"type": "string", "enum": ["expense", "revenue"]},
    "account_id": {"type": "integer"},
    "amount": {"type": "number"},
    "description": {"type": "string"},
    "category": {"type": "string"}
  },
  "required": ["type", "account_id", "amount", "description"]
}
```

#### `odoo_run_audit`

**Description**: Run audit report for date range

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "start_date": {"type": "string", "format": "date"},
    "end_date": {"type": "string", "format": "date"},
    "filters": {"type": "object"}
  },
  "required": ["start_date", "end_date"]
}
```

---

## 2. Social MCP Server Contract

### Service Information

- **Server ID**: `social-mcp`
- **Protocol**: JSON-RPC 2.0
- **Transport**: HTTP POST
- **Authentication**: OAuth 2.0 Tokens per platform

### Tools

#### `facebook_post`

**Description**: Create post on Facebook Page

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "message": {"type": "string"},
    "link": {"type": "string"},
    "image_url": {"type": "string"},
    "hashtags": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["message"]
}
```

#### `instagram_post`

**Description**: Create post on Instagram Business Account

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "caption": {"type": "string"},
    "image_url": {"type": "string"},
    "hashtags": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["caption", "image_url"]
}
```

#### `twitter_post`

**Description**: Create tweet on Twitter/X

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "text": {"type": "string", "maxLength": 280},
    "media_url": {"type": "string"},
    "hashtags": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["text"]
}
```

#### `social_generate_summary`

**Description**: Generate social media summary from activity data

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "activities": {"type": "array", "items": {"type": "string"}},
    "platform": {"type": "string", "enum": ["facebook", "instagram", "twitter"]}
  },
  "required": ["activities", "platform"]
}
```

---

## 3. Browser MCP Server Contract

### Service Information

- **Server ID**: `browser-mcp`
- **Protocol**: JSON-RPC 2.0
- **Transport**: HTTP POST
- **Browser**: Playwright Chromium (headless)

### Tools

#### `browser_fill_form`

**Description**: Fill and submit web form

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "url": {"type": "string"},
    "fields": {
      "type": "object",
      "additionalProperties": {"type": "string"}
    },
    "submit_selector": {"type": "string"}
  },
  "required": ["url", "fields"]
}
```

#### `browser_extract_data`

**Description**: Extract data from web page

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "url": {"type": "string"},
    "selectors": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["url", "selectors"]
}
```

#### `browser_navigate_screenshot`

**Description**: Navigate to URL and capture screenshot

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "url": {"type": "string"},
    "wait_for": {"type": "string"},
    "timeout_ms": {"type": "integer", "default": 30000}
  },
  "required": ["url"]
}
```

---

## 4. Docs MCP Server Contract

### Service Information

- **Server ID**: `docs-mcp`
- **Protocol**: JSON-RPC 2.0
- **Transport**: HTTP POST
- **Purpose**: API documentation lookup

### Tools

#### `docs_lookup_api`

**Description**: Look up API documentation

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "api_name": {"type": "string"},
    "endpoint": {"type": "string"},
    "method": {"type": "string"}
  },
  "required": ["api_name"]
}
```

#### `docs_get_examples`

**Description**: Get code examples for API usage

**Input Schema**:
```json
{
  "type": "object",
  "properties": {
    "api_name": {"type": "string"},
    "operation": {"type": "string"},
    "language": {"type": "string", "default": "python"}
  },
  "required": ["api_name", "operation"]
}
```

---

## Contract Validation Rules

1. All MCP servers must implement JSON-RPC 2.0 protocol
2. All tools must validate input against schema before execution
3. All tools must return output matching output schema
4. Error responses must include error code and message
5. All tool calls must be logged in audit_log.jsonl

---

**Contracts Status**: ✅ COMPLETE - All 4 Gold Tier MCP server contracts defined with input/output schemas

**Next Phase**: Phase 1 quickstart.md (setup guide for Gold Tier)
