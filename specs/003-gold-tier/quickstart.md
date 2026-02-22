# Gold Tier Quickstart Guide

**Feature**: Gold Tier Autonomous Assistant  
**Branch**: `003-gold-tier`  
**Date**: 2026-02-20  
**Purpose**: Step-by-step setup instructions for Gold Tier implementation

---

## Prerequisites

Before starting Gold Tier implementation, ensure you have:

### Completed Silver Tier
- ✅ All 86 Silver Tier tasks complete
- ✅ 7 Agent Skills operational (read_task, plan_action, write_report, file_operations, create_plan_md, send_email, schedule_task)
- ✅ 3 watchers functional (Filesystem, Gmail, WhatsApp)
- ✅ email-mcp server operational

### System Requirements
- **Python 3.13+** - [Download](https://www.python.org/downloads/)
- **Node.js v18+** - [Download](https://nodejs.org/)
- **Odoo Community v19+** - Local installation required
- **Obsidian v1.10.6+** - [Download](https://obsidian.md/)
- **Claude Code** - Active subscription with Stop hook support

### API Access
- **Facebook Graph API** - Developer account, Page Access Token
- **Instagram Graph API** - Business account, Access Token
- **Twitter/X API v2** - Developer account, Bearer Token
- **Odoo JSON-RPC** - API key from Odoo user settings

### Estimated Setup Time
- **Odoo Foundation**: 6-8 hours
- **Social Media Integrations**: 16-22 hours (Facebook/Instagram/Twitter)
- **MCP Architecture**: 8-12 hours
- **Weekly Audits**: 6-8 hours
- **Ralph Wiggum Loop**: 8-10 hours
- **Error Recovery**: 6-8 hours
- **Cross-Domain Flows**: 8-10 hours
- **Documentation**: 6-8 hours
- **Total**: 54-72 hours (4-6 weeks)

---

## Step 1: Verify Silver Tier Completion

```bash
# Check Silver Tier tasks complete
cd specs/002-silver-tier
# Verify all 86 tasks marked [x] in tasks.md

# Test Silver Tier functionality
python ../tests/test_watchers_silver.py
python ../tests/test_gmail_live.py
```

**Expected**: All tests pass, 3 watchers operational, email-mcp functional

---

## Step 2: Set Up Odoo Community v19+

### Install Odoo (if not already installed)

```bash
# Ubuntu/Debian
sudo apt-get install odoo

# Windows
# Download installer from https://www.odoo.com/page/download

# macOS
brew install odoo
```

### Configure Odoo for JSON-RPC API

1. Open Odoo in browser: `http://localhost:8069`
2. Go to **Settings** → **Users & Companies** → **Users**
3. Select your user
4. Click **Action** → **Change Password**
5. Generate API Key (copy and save securely)
6. Note database name (e.g., `odoo_db`)

### Test Odoo JSON-RPC Connection

```python
import requests
import json

odoo_url = "http://localhost:8069"
db = "odoo_db"
api_key = "YOUR_API_KEY"

payload = {
    "jsonrpc": "2.0",
    "method": "call",
    "params": {
        "service": "object",
        "method": "execute",
        "args": [
            db,
            api_key,
            "res.partner",
            "search_read",
            [],
            ["name"]
        ]
    }
}

response = requests.post(f"{odoo_url}/web/dataset/call_kw", json=payload)
print(response.json())
```

**Expected**: List of partners (clients) from Odoo

---

## Step 3: Set Up Social Media API Access

### Facebook Graph API

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create new app (Business type)
3. Add **Facebook Login** product
4. Get Page Access Token from Graph API Explorer
5. Note Page ID

### Instagram Graph API

1. Ensure Instagram account is Business account
2. Connect Instagram to Facebook Page
3. Get Instagram Business Account ID
4. Generate Access Token

### Twitter/X API v2

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create new project and app
3. Generate Bearer Token (OAuth 2.0)
4. Note API key and secret

---

## Step 4: Create Gold Tier Folder Structure

```bash
cd ai-assist-fte

# Create new folders for Gold Tier
mkdir AI_Employee_Vault/Logs
mkdir mcp_servers/odoo-mcp
mkdir mcp_servers/social-mcp
mkdir mcp_servers/browser-mcp
mkdir mcp_servers/docs-mcp
mkdir docs

# Create log files
touch AI_Employee_Vault/Logs/audit_log.jsonl
touch AI_Employee_Vault/Logs/ralph_wiggum_log.jsonl
touch AI_Employee_Vault/Logs/error_log.jsonl
```

---

## Step 5: Install MCP Server Dependencies

```bash
# Odoo MCP
cd mcp_servers/odoo-mcp
npm init -y
npm install @modelcontextprotocol/sdk express axios

# Social MCP
cd ../social-mcp
npm init -y
npm install @modelcontextprotocol/sdk express axios

# Browser MCP
cd ../browser-mcp
npm init -y
npm install @modelcontextprotocol/sdk express playwright

# Docs MCP
cd ../docs-mcp
npm init -y
npm install @modelcontextprotocol/sdk express axios
```

---

## Step 6: Configure Environment Variables

Create/update `.env` file in project root:

```env
# Silver Tier (existing)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Gold Tier (NEW)
# Odoo Configuration
ODOO_URL=http://localhost:8069
ODOO_DATABASE=odoo_db
ODOO_API_KEY=your-odoo-api-key

# Facebook Configuration
FACEBOOK_PAGE_ID=your-page-id
FACEBOOK_ACCESS_TOKEN=your-access-token

# Instagram Configuration
INSTAGRAM_USER_ID=your-ig-user-id
INSTAGRAM_ACCESS_TOKEN=your-access-token

# Twitter Configuration
TWITTER_BEARER_TOKEN=your-bearer-token

# Browser Automation
BROWSER_TYPE=chromium
BROWSER_HEADLESS=true
```

**IMPORTANT**: Add `.env` to `.gitignore` (never commit secrets)

---

## Step 7: Update Agent Skills for Gold Tier

Create new Agent Skills in `skills/` folder:

1. `odoo_create_invoice.md` - Create invoices in Odoo
2. `odoo_log_transaction.md` - Log transactions
3. `odoo_run_audit.md` - Run audit reports
4. `facebook_post.md` - Post to Facebook
5. `instagram_post.md` - Post to Instagram
6. `twitter_post.md` - Post to Twitter
7. `social_generate_summary.md` - Generate social summaries
8. `browser_automate.md` - Browser automation
9. `error_recovery.md` - Error recovery logic
10. `ralph_wiggum_orchestrator.md` - Ralph Wiggum loop orchestration

---

## Step 8: Configure Ralph Wiggum Loop

Create `watchers/ralph_wiggum_loop.py` with:

- Read vault state
- Reason about next step
- Plan actions
- Execute via skills/MCP
- Check if done
- Iterate until complete or max 10 loops

---

## Step 9: Set Up Weekly CEO Briefing

Update `scheduling/weekly_summary.py` or create `scheduling/ceo_briefing.py`:

```python
# Run every Sunday at 11:59 PM
# Generate CEO Briefing in Dashboard.md
# Include: Revenue, Expenses, Profit, Bottlenecks, Task Summary, Insights
```

Configure cron job (Linux/macOS):
```bash
crontab -e
# Add: 59 23 * * 0 cd /path/to/project && python scheduling/ceo_briefing.py
```

Or Task Scheduler (Windows):
```powershell
schtasks /Create /TN "CEO Briefing" /TR "python C:\path\to\scheduling\ceo_briefing.py" /SC WEEKLY /D SUN /ST 23:59
```

---

## Step 10: Test Gold Tier Components

### Test Odoo MCP

```bash
cd mcp_servers/odoo-mcp
node index.js
# In another terminal, test invoice creation
```

### Test Social MCP

```bash
cd mcp_servers/social-mcp
node index.js
# Test Facebook post draft
```

### Test Ralph Wiggum Loop

```bash
python watchers/ralph_wiggum_loop.py
# Trigger multi-step task (invoice flow)
# Verify loop completes in ≤10 iterations
```

---

## Step 11: Run Phase Prompt Tests

After each phase, run prompt tests:

**Phase 1 (Odoo)**:
- Create test invoice → Verify in Odoo UI
- Log test expense → Verify in Odoo accounting

**Phase 2-3 (Social)**:
- Draft Facebook post → Verify in Business Manager
- Draft tweet → Verify in Twitter dashboard

**Phase 4 (MCP)**:
- Invoke browser-mcp → Verify automation success
- Invoke docs-mcp → Verify documentation retrieved

**Phase 5 (Audits)**:
- Run weekly audit → Verify CEO Briefing in Dashboard.md

**Phase 6 (Ralph Wiggum)**:
- Trigger multi-step invoice flow → Verify ≤10 iterations

**Phase 7 (Error Recovery)**:
- Simulate API timeout → Verify retry with backoff

**Phase 8 (Cross-Domain)**:
- Send WhatsApp about client work → Verify Odoo invoice + social post drafted

---

## Step 12: Verify Gold Tier Acceptance

Run full Gold Tier acceptance checklist:

- [ ] Cross-domain integration tested (WhatsApp → Odoo → Social)
- [ ] Odoo MCP operational (20+ test transactions)
- [ ] Social MCPs operational (3+ posts/platform)
- [ ] 4+ MCP servers deployed (email, social, Odoo, browser, docs)
- [ ] Weekly CEO Briefing automated
- [ ] Error recovery 95%+ uptime
- [ ] Comprehensive audit logging (90-day retention)
- [ ] Ralph Wiggum loop operational
- [ ] Documentation complete
- [ ] All phase prompt tests passed

---

## Troubleshooting

### Odoo Connection Failed
- Verify Odoo is running: `http://localhost:8069`
- Check API key is valid
- Verify database name is correct

### Social Media API Errors
- Check tokens are not expired
- Verify rate limits not exceeded
- Ensure Business/Developer accounts active

### Ralph Wiggum Loop Infinite
- Check max iterations set to 10
- Verify completion marker logic
- Review ralph_wiggum_log.jsonl for debugging

### Audit Logging Not Working
- Verify Logs/ folder exists
- Check file permissions
- Ensure JSON-lines format correct

---

## Next Steps

After Gold Tier setup complete:

1. **Production Deployment**: Configure background services, monitoring
2. **Live Testing**: Run full end-to-end tests with real data
3. **Hackathon 0 Submission**: Prepare demo video, architecture diagram
4. **Platinum Tier Planning**: Cloud deployment, work-zone specialization

---

**Quickstart Status**: ✅ COMPLETE - All 12 steps documented with commands and expected outcomes

**Ready for**: Phase-by-phase Gold Tier implementation following plan.md roadmap
