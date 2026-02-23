# Facebook Access Token Setup - Quick Guide

**Issue**: Current token missing `pages_manage_posts` and `pages_read_engagement` permissions

---

## Get Token with Correct Permissions (3 minutes)

### Step 1: Go to Graph API Explorer

**URL**: https://developers.facebook.com/tools/explorer/

### Step 2: Select Your App

- Click dropdown at top
- Select "Personal AI Employee" app (or create one)

### Step 3: Get Page Access Token

1. Click **"Get Token"** button
2. Select **"Get Page Access Token"**
3. **Select your Page**: "MetaLog Inc." (ID: 646045365268781)

### Step 4: Grant Required Permissions

Click **"Add Permissions"** and grant:

- ✅ `pages_manage_posts` - Required to post to Page
- ✅ `pages_read_engagement` - Required to read Page engagement
- ✅ `pages_show_list` - Required to list Pages

### Step 5: Copy Token

- Click "Continue" → "Allow"
- **Copy the Access Token** (long string starting with EAAX...)

### Step 6: Update .env

Replace the FACEBOOK_ACCESS_TOKEN in `.env`:

```env
FACEBOOK_PAGE_ID=646045365268781
FACEBOOK_ACCESS_TOKEN=<paste_new_token_here>
```

### Step 7: Test

```bash
cd mcp_servers/social-mcp
node test_facebook_simple.js
```

---

## Expected Success Output

```
============================================================
✅ FACEBOOK POST SUCCESSFUL!
============================================================
   Post ID: 646045365268781_123456789
   View at: https://facebook.com/646045365268781_123456789
   Message: 🧪 Gold Tier Live Test - Facebook Integration...
============================================================
```

---

## Troubleshooting

**Still getting permission error?**

1. Make sure you're an **Admin** of the Page
2. Token must be a **Page Access Token** (not User Access Token)
3. All 3 permissions must be granted: `pages_manage_posts`, `pages_read_engagement`, `pages_show_list`

**Token expired?**

- Tokens from Graph API Explorer expire in ~1 hour
- For longer-lived token, follow steps in docs/SOCIAL_MEDIA_API_SETUP.md
