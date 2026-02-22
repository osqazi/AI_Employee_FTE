# Gold Tier Setup Guide

**Personal AI Employee - Hackathon 0**  
**Version**: 1.0.0  
**Date**: 2026-02-21

---

## Prerequisites

### Software Requirements

- **Python 3.13+**: [Download](https://www.python.org/downloads/)
- **Node.js v18+**: [Download](https://nodejs.org/)
- **Obsidian v1.10.6+**: [Download](https://obsidian.md/)
- **Claude Code**: Active subscription
- **Git**: For version control

### API Access

- **Odoo Community v19+**: Local installation with JSON-RPC API enabled
- **Facebook Graph API**: Developer account, Page Access Token
- **Instagram Graph API**: Business account connected to Facebook Page
- **Twitter/X API v2**: Developer account, Bearer Token
- **SMTP**: Email sending credentials

### Hardware Requirements

- **Minimum**: 8GB RAM, 4-core CPU, 20GB free disk
- **Recommended**: 16GB RAM, 8-core CPU, SSD storage
- **For 24/7 operation**: Dedicated mini-PC or cloud VM

---

## Installation Steps

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd ai-assist-fte
```

### Step 2: Install Python Dependencies

```bash
# Create virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate  # Windows

# Install Python packages
pip install -r requirements.txt
```

### Step 3: Install Node.js Dependencies

```bash
# Install MCP server dependencies
cd mcp_servers/email-mcp && npm install
cd ../social-mcp && npm install
cd ../odoo-mcp && npm install
cd ../browser-mcp && npm install
cd ../docs-mcp && npm install
cd ../..
```

### Step 4: Install Playwright Browsers

```bash
# Install Playwright browsers for browser-mcp
npx playwright install
```

### Step 5: Configure Environment Variables

Create `.env` file in project root:

```bash
# Copy example
cp .env.example .env

# Edit .env with your credentials
```

**.env Template**:

```env
# Odoo Configuration
ODOO_URL=http://localhost:8069
ODOO_DATABASE=odoo_db
ODOO_API_KEY=your_odoo_api_key

# Facebook Configuration
FACEBOOK_PAGE_ID=your_page_id
FACEBOOK_ACCESS_TOKEN=your_access_token

# Instagram Configuration
INSTAGRAM_USER_ID=your_ig_user_id
INSTAGRAM_ACCESS_TOKEN=your_access_token

# Twitter Configuration
TWITTER_BEARER_TOKEN=your_bearer_token

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Development Mode
DEV_MODE=false
```

### Step 6: Create Obsidian Vault

```bash
# Create vault directory
mkdir AI_Employee_Vault

# Create required folders
mkdir AI_Employee_Vault/Inbox
mkdir AI_Employee_Vault/Needs_Action
mkdir AI_Employee_Vault/Pending_Approval
mkdir AI_Employee_Vault/Approved
mkdir AI_Employee_Vault/Done
mkdir AI_Employee_Vault/Plans
mkdir AI_Employee_Vault/Logs
```

### Step 7: Open Vault in Obsidian

1. Open Obsidian
2. Click "Open folder as vault"
3. Select `AI_Employee_Vault` folder
4. Verify folder structure appears in sidebar

### Step 8: Create Business_Goals.md

Create `AI_Employee_Vault/Business_Goals.md`:

```markdown
# Business Goals

---
last_updated: 2026-02-21
review_frequency: weekly
---

## Q1 2026 Objectives

### Revenue Target
- Monthly goal: $10,000
- Current MTD: $4,500

### Key Metrics to Track
| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Client response time | < 24 hours | > 48 hours |
| Invoice payment rate | > 90% | < 80% |
| Software costs | < $500/month | > $600/month |

### Subscription Audit Rules
Flag for review if:
- No login in 30 days
- Cost increased > 20%
- Duplicate functionality with another tool
```

### Step 9: Configure Scheduling

**Linux/macOS (cron)**:

```bash
# Open crontab
crontab -e

# Add CEO Briefing schedule (Sunday 11:59 PM)
59 23 * * 0 cd /path/to/ai-assist-fte && python scheduling/ceo_briefing.py
```

**Windows (Task Scheduler)**:

```powershell
# Open Task Scheduler
taskschd.msc

# Create basic task
- Name: CEO Briefing
- Trigger: Weekly, Sunday, 11:59 PM
- Action: Start program
- Program: python
- Arguments: scheduling/ceo_briefing.py
- Start in: C:\path\to\ai-assist-fte
```

### Step 10: Test Installation

**Test Cross-Domain Trigger**:

```bash
python watchers/cross_domain_trigger.py
```

Expected output: 3 test tasks created in /Needs_Action

**Test Ralph Wiggum Loop**:

```bash
python watchers/ralph_wiggum_loop.py
```

Expected output: RalphWiggumLoop initialized

**Test CEO Briefing**:

```bash
python scheduling/ceo_briefing.py
```

Expected output: Briefing generated, Dashboard updated

---

## MCP Server Configuration

### Configure Claude Code MCP Settings

Create or edit `~/.config/claude-code/mcp.json`:

```json
{
  "mcpServers": {
    "email": {
      "command": "node",
      "args": ["/path/to/ai-assist-fte/mcp_servers/email-mcp/index.js"],
      "env": {
        "SMTP_HOST": "smtp.gmail.com",
        "SMTP_PORT": "587",
        "SMTP_USER": "${SMTP_USER}",
        "SMTP_PASS": "${SMTP_PASS}"
      }
    },
    "odoo": {
      "command": "node",
      "args": ["/path/to/ai-assist-fte/mcp_servers/odoo-mcp/index.js"],
      "env": {
        "ODOO_URL": "${ODOO_URL}",
        "ODOO_DATABASE": "${ODOO_DATABASE}",
        "ODOO_API_KEY": "${ODOO_API_KEY}"
      }
    },
    "social": {
      "command": "node",
      "args": ["/path/to/ai-assist-fte/mcp_servers/social-mcp/index.js"],
      "env": {
        "FACEBOOK_PAGE_ID": "${FACEBOOK_PAGE_ID}",
        "FACEBOOK_ACCESS_TOKEN": "${FACEBOOK_ACCESS_TOKEN}",
        "INSTAGRAM_USER_ID": "${INSTAGRAM_USER_ID}",
        "INSTAGRAM_ACCESS_TOKEN": "${INSTAGRAM_ACCESS_TOKEN}",
        "TWITTER_BEARER_TOKEN": "${TWITTER_BEARER_TOKEN}"
      }
    },
    "browser": {
      "command": "node",
      "args": ["/path/to/ai-assist-fte/mcp_servers/browser-mcp/index.js"]
    },
    "docs": {
      "command": "node",
      "args": ["/path/to/ai-assist-fte/mcp_servers/docs-mcp/index.js"]
    }
  }
}
```

---

## Verification Checklist

### Core Functionality

- [ ] Python 3.13+ installed
- [ ] Node.js v18+ installed
- [ ] Obsidian vault created
- [ ] .env file configured with credentials
- [ ] All MCP server dependencies installed
- [ ] Playwright browsers installed

### MCP Servers

- [ ] email-mcp operational
- [ ] odoo-mcp operational
- [ ] social-mcp operational
- [ ] browser-mcp operational
- [ ] docs-mcp operational

### Agent Skills

- [ ] 17+ SKILL.md files present
- [ ] All skills have complete documentation
- [ ] Skills tested via Claude Code

### Watchers

- [ ] cross_domain_trigger.py tested
- [ ] ralph_wiggum_loop.py tested
- [ ] watchdog.py tested

### Scheduling

- [ ] cron/Task Scheduler configured
- [ ] CEO Briefing scheduled for Sunday 11:59 PM
- [ ] Test briefing generation successful

### Documentation

- [ ] Business_Goals.md created
- [ ] Dashboard.md exists
- [ ] Company_Handbook.md exists
- [ ] Architecture documentation reviewed

---

## Troubleshooting

### Common Issues

**Issue**: MCP server fails to start

**Solution**:
1. Check Node.js version: `node --version`
2. Verify dependencies: `npm install`
3. Check .env credentials
4. Review error logs in mcp_servers/*/logs/

**Issue**: Playwright browser not found

**Solution**:
```bash
npx playwright install
```

**Issue**: Odoo connection failed

**Solution**:
1. Verify Odoo is running: `http://localhost:8069`
2. Check ODOO_URL in .env
3. Verify API key in Odoo user settings
4. Test connection: `python -c "import requests; requests.get('http://localhost:8069')"`

**Issue**: Social media API errors

**Solution**:
1. Verify API tokens are valid (not expired)
2. Check API rate limits
3. Verify Page/App permissions
4. Regenerate tokens if needed

**Issue**: CEO Briefing not generating

**Solution**:
1. Run manually: `python scheduling/ceo_briefing.py`
2. Check error logs in AI_Employee_Vault/Logs/
3. Verify Odoo connection
4. Verify vault folder structure

---

## Next Steps

After setup completion:

1. **Test cross-domain flows**: Send test WhatsApp/email, verify task creation
2. **Test Ralph Wiggum loop**: Create complex task, verify autonomous completion
3. **Test CEO Briefing**: Run manual briefing, verify Dashboard update
4. **Configure production scheduling**: Set up cron/Task Scheduler
5. **Monitor with watchdog**: Start watchdog.py for 24/7 monitoring

---

*Document per Hackathon 0 Handbook requirements*
