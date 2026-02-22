# Social Media API Setup Guide

**Gold Tier - Personal AI Employee**  
**Version**: 1.0.0  
**Date**: 2026-02-22

---

## Overview

This guide walks you through obtaining API credentials for Facebook, Instagram, and Twitter/X to enable live posting from your Personal AI Employee.

---

## Prerequisites

- Facebook Developer Account
- Facebook Business Page
- Instagram Business Account (connected to Facebook Page)
- Twitter Developer Account
- Personal AI Employee Gold Tier setup complete

---

## Facebook Setup

### Step 1: Create Facebook App

1. **Go to Facebook Developers**: https://developers.facebook.com/
2. **Sign in** with your Facebook account
3. **Create App**:
   - Click "My Apps" → "Create App"
   - Select "Business" as app type
   - Fill in app details:
     - App Name: "Personal AI Employee"
     - Contact email: your-email@gmail.com
   - Click "Create App"

### Step 2: Add Facebook Login Product

1. In your app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Select "Web" as platform
4. Set Site URL: `http://localhost`
5. Save settings

### Step 3: Get Page Access Token

1. **Go to Graph API Explorer**: https://developers.facebook.com/tools/explorer/
2. **Select your app** from dropdown
3. **Click "Get Token"** → "Get Page Access Token"
4. **Select your Facebook Page**
5. **Grant permissions**:
   - `pages_manage_posts`
   - `pages_read_engagement`
   - `publish_to_groups` (if posting to groups)
6. **Copy the Access Token**

### Step 4: Get Page ID

1. Go to your Facebook Page
2. Click "About" in left menu
3. Find "Facebook Page ID" (numeric value)
4. **Copy the Page ID**

### Step 5: Update .env File

```env
# Facebook Configuration
FACEBOOK_PAGE_ID=123456789012345
FACEBOOK_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Instagram Setup

### Step 1: Convert to Business Account

1. **Open Instagram** on your phone
2. **Go to Settings** → Account
3. **Switch to Professional Account**
4. **Select "Business"**
5. **Connect to Facebook Page** (the same one from Facebook setup)

### Step 2: Get Instagram User ID

1. **Go to Graph API Explorer**: https://developers.facebook.com/tools/explorer/
2. **Enter in Graph Explorer**:
   ```
   me/accounts
   ```
3. **Click "Submit"**
4. **Find your page** in results
5. **Copy the `id`** - this is your Instagram User ID

### Step 3: Get Instagram Access Token

**Note**: Instagram uses the same Access Token as Facebook (from Step 4 above)

### Step 4: Update .env File

```env
# Instagram Configuration
INSTAGRAM_USER_ID=17841405822304914
INSTAGRAM_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Twitter/X Setup

### Step 1: Apply for Twitter Developer Account

1. **Go to Twitter Developer Portal**: https://developer.twitter.com/en/portal/dashboard
2. **Sign in** with your Twitter account
3. **Apply for Developer Account**:
   - Click "Apply"
   - Fill in application details:
     - Use case: "Personal AI Employee for Hackathon 0 - automated posting"
     - Description: "Testing social media automation for hackathon project"
   - Submit application
4. **Wait for approval** (usually 1-3 days)

### Step 2: Create Twitter App

1. **Once approved**, go to Developer Dashboard
2. **Click "Create Project"**
3. **Fill in project details**:
   - Project Name: "Personal AI Employee"
   - Description: "Gold Tier hackathon project"
   - Use case: Select "Posting tweets"
4. **Create App** within project

### Step 3: Get Bearer Token

1. **Go to your App** in Developer Dashboard
2. **Click "Keys and Tokens"**
3. **Under "Authentication"**, find "Bearer Token"
4. **Click "Regenerate"** (if needed)
5. **Copy the Bearer Token**

### Step 4: Update .env File

```env
# Twitter/X Configuration
TWITTER_BEARER_TOKEN=AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA0%2BXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

---

## Verification

### Test Credentials

After updating `.env`, run the test script:

```bash
cd mcp_servers/social-mcp
node test_social_media.js
```

**Expected Output**:
```
FACEBOOK: ✅ PASS
   Post ID: 123456789_987654321
INSTAGRAM: ✅ PASS
   Post ID: 17841405822304914
TWITTER: ✅ PASS
   Tweet ID: 1628374950183746582

Total: 3 PASS, 0 SKIPPED, 0 FAIL
🎉 ALL TESTS PASSED!
```

---

## Troubleshooting

### Facebook/Instagram Issues

**Error**: "Invalid OAuth access token"

**Solution**:
1. Token expired - generate new one from Graph API Explorer
2. Ensure permissions granted: `pages_manage_posts`, `pages_read_engagement`
3. Verify Page ID is correct (numeric only)

**Error**: "Unsupported post format"

**Solution**:
- Check image URL is publicly accessible (for Instagram)
- Ensure caption is not empty

### Twitter Issues

**Error**: "Authentication failed"

**Solution**:
1. Verify Bearer Token is correct
2. Check token doesn't have extra spaces
3. Ensure developer account is approved

**Error**: "Tweet text too long"

**Solution**:
- Twitter has 280 character limit
- Shorten your message

---

## Security Notes

### Token Expiration

- **Facebook/Instagram**: Access tokens expire in 60 days
  - Use Graph API Explorer to refresh
  - Consider Long-Lived Tokens for production
- **Twitter**: Bearer tokens don't expire (unless revoked)

### Best Practices

1. **Never commit .env to version control**
2. **Use separate test accounts** for development
3. **Rotate credentials** monthly
4. **Monitor API usage** in developer dashboards
5. **Use test posts** before production deployment

---

## API Rate Limits

| Platform | Limit | Window |
|----------|-------|--------|
| **Facebook** | 200 posts | 15 minutes |
| **Instagram** | 200 posts | 15 minutes |
| **Twitter** | 300 tweets | 15 minutes |

The social-mcp server includes automatic rate limit handling.

---

## Next Steps

After credentials are configured:

1. **Run test script**: `node test_social_media.js`
2. **Verify posts** appear on your social media accounts
3. **Update tasks.md**: Mark T047-T050 as complete
4. **Document results**: Add test results to verification report

---

## Gold Tier Compliance

Once live posting is tested and verified:

- ✅ **Gold Tier Requirement**: "Integrate Facebook and Instagram and post messages"
- ✅ **Gold Tier Requirement**: "Integrate Twitter (X) and post messages"
- ✅ **Handbook Compliance**: All social media integrations complete

---

*Setup Guide per Hackathon 0 documentation requirements*
